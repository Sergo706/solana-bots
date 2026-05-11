import { 
  Keypair, 
  VersionedTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { db } from '../../db/connection.js';
import { positionsTable, walletTable } from '../../db/index.js';
import { eq, inArray, and, SQL } from 'drizzle-orm';
import consola from 'consola';
import { decryptPrivateKey, getApiAndRpc, sleep } from '../../utils/utils.js';
import type { ExecuteResponse, OrderResponse } from '../../types/Jupiter.js';
import { fetchWithRetry } from '../../utils/fetchWithRetry.js';
import { chunkProcess } from '@riavzon/utils';

const GAS_FEE_BUFFER = BigInt(0.005 * LAMPORTS_PER_SOL);
const SOL_MINT = "So11111111111111111111111111111111111111112";
const JUPITER_BASE_URL = "https://api.jup.ag/swap/v2";

export async function massSell(targetMintAddress: string, numberOfWallets: number, password: string, sellPercentage = 0, chunksToProcess = 2, chosenWallets?: Keypair[]) {
 const { rpc, rawKey } = await getApiAndRpc(password);
 
 if (rpc.includes('devnet')) {
    consola.error("Jupiter swaps are not supported on Devnet. Please use a Mainnet RPC for trading.");
    process.exit(1);
}

 const API_KEY = rawKey;
 if (!API_KEY) throw new Error("Missing JUPITER_API_KEY");
 const walletMap = new Map<string, Keypair>();
 const filterAddresses: string[] = [];
 const filters: SQL[] = [];
 filters.push(eq(positionsTable.targetMintAddress, targetMintAddress));

 if (chosenWallets && chosenWallets.length > 0) {
    for (const kw of chosenWallets) {
      const addr = kw.publicKey.toBase58();
      walletMap.set(addr, kw);
      filterAddresses.push(addr);
    }
  }

 if (filterAddresses.length > 0) {
    filters.push(inArray(positionsTable.walletAddress, filterAddresses));
  } 


  const positions = await db.select().from(positionsTable).where(and(...filters)).limit(numberOfWallets);

  if (positions.length === 0) {
    consola.warn(`No positions found in database for mint: ${targetMintAddress}`);
    return;
  }

  if (!chosenWallets || chosenWallets.length === 0) {
    const walletAddresses = positions.map(p => p.walletAddress);
    const relevantWallets = await db.select()
      .from(walletTable)
      .where(inArray(walletTable.publicAddress, walletAddresses));

    for (const w of relevantWallets) {
       const decrypted = decryptPrivateKey(w.privateKeyEncrypted as Buffer, password);
       if (w.publicAddress) {
           walletMap.set(w.publicAddress, Keypair.fromSecretKey(decrypted));
       }
    }
  }


    consola.start(`Selling ${targetMintAddress} from ${positions.length.toString()} active positions...`);            
     await chunkProcess(positions, chunksToProcess, async (chunk) => {
        await Promise.all(
            chunk.map(async (pos) => {
             return db.transaction(async (tx) => { 
                const pair = walletMap.get(pos.walletAddress);
                if (!pair) {
                    tx.rollback();
                    return;
                }

            try {
                if ((pos.walletRemainingBalance ?? 0n) < GAS_FEE_BUFFER) {
                    consola.warn(`Skipping ${pos.walletAddress}: No SOL for gas.`);
                    tx.rollback();
                    return;
                }
                
                let amountToSell = pos.tokenAmount ?? 0n;
                if (sellPercentage !== 0 && sellPercentage < 100) {
                    amountToSell = (pos.tokenAmount ?? 0n * BigInt(sellPercentage)) / 100n;
                }

                if (!amountToSell || amountToSell <= 0n) {
                    consola.info(`Skipping ${pos.walletAddress}: sell amount is 0.`);
                    tx.rollback();
                    return;
                }

                consola.info(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    `Wallet ${pos.walletAddress} holds ${pos.tokenAmount!.toString()} tokens. Selling ${amountToSell.toString()}...`,
                );

                const orderUrl = new URL(`${JUPITER_BASE_URL}/order`);
                orderUrl.searchParams.append("inputMint", targetMintAddress);
                orderUrl.searchParams.append("outputMint", SOL_MINT);
                orderUrl.searchParams.append("amount", String(amountToSell));
                orderUrl.searchParams.append('taker', pos.walletAddress);

                const orderResponse = await fetchWithRetry(String(orderUrl), 5, 500, { 
                    headers: { 
                        "x-api-key": API_KEY 
                    } 
                });

            if (!orderResponse.ok) {
                consola.error(`/order failed: ${String(orderResponse.status)}`, await orderResponse.text());
                tx.rollback();
                return;
            }

            const orderResult = await orderResponse.json() as OrderResponse;
            if (!orderResult.transaction) {
                tx.rollback();
                throw new Error("Order failed to generate transaction");
            }
            
     
            const transaction = VersionedTransaction.deserialize(
                Buffer.from(orderResult.transaction, "base64"),
            );
            transaction.sign([pair]);

           consola.info(`Executing SELL for ${pos.walletAddress} (${String(amountToSell)} tokens)...`);


            const executeResponse = await fetchWithRetry(`${JUPITER_BASE_URL}/execute`, 5, 500, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": API_KEY,
                    },
                    body: JSON.stringify({
                        signedTransaction: Buffer.from(transaction.serialize()).toString("base64"),
                        requestId: orderResult.requestId,
                    }),
                });

            if (!executeResponse.ok) {
                consola.error(`/execute failed: ${String(executeResponse.status)}`, await executeResponse.text());
                tx.rollback();
                return;
            }

            const result = await executeResponse.json() as ExecuteResponse;

            if (result.status === "Success") {
                    consola.success(`Sell Success! https://solscan.io/tx/${result.signature}`);
                    if (sellPercentage === 0 || sellPercentage === 100) {
                         await tx.delete(positionsTable).where(eq(positionsTable.id, pos.id));
                    } else {
                        await tx.update(positionsTable)
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            .set({ tokenAmount: pos.tokenAmount! - amountToSell })
                            .where(eq(positionsTable.id, pos.id));
                    }
                } else {
                    tx.rollback();
                    consola.error("Sell failed:", result);
                }
       } catch (err) {
            tx.rollback();
            consola.error(`Critical error selling for ${pos.walletAddress}:`, err);
       }
       });
    })
  );
    await sleep(1200);
}); 
  consola.success("Mass Sell operation completed.");
  return;
}