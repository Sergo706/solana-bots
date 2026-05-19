/* eslint-disable @typescript-eslint/restrict-template-expressions */
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
const log = consola.withTag('[SELL]');

export async function massSell(targetMintAddress: string, numberOfWallets: number, password: string, sellPercentage = 0, chunksToProcess = 1, chosenWallets?: Keypair[], targetedPositionsToSell?: number[]) {
 const { rpc, rawKey } = await getApiAndRpc(password);
 
 if (rpc.includes('devnet')) {
    log.error("Jupiter swaps are not supported on Devnet. Please use a Mainnet RPC for trading.");
    throw new Error("Jupiter swaps are not supported on Devnet. Please use a Mainnet RPC for trading.");
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

  if (targetedPositionsToSell && targetedPositionsToSell.length > 0) {
      filters.push(inArray(positionsTable.id, targetedPositionsToSell));
  }

  const positions = await db.select().from(positionsTable).where(and(...filters)).limit(numberOfWallets);

  if (positions.length === 0) {
    log.warn(`No positions found in database for mint: ${targetMintAddress}`);
    return{ 
        ok: false, 
        date: new Date().toISOString(),
        reason: `No positions found in database for mint: ${targetMintAddress}`
    };
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

    const returnType = {
        ok: true,
        date: new Date().toISOString(),
        data: {
            positionsClosed: 0,
            walletsCount: walletMap.size,
            failedWallets: [] as { pubkey: string, reason: string }[],
            walletsSpent: [] as {pubkey: string, spent: number, received: number}[]
        }
    };
    log.start(`Selling ${targetMintAddress} from ${positions.length.toString()} active positions...`);            
     await chunkProcess(positions, chunksToProcess, async (chunk) => {
        await Promise.all(
            chunk.map(async (pos) => {
                const pair = walletMap.get(pos.walletAddress);
                if (!pair) return;
                
                if ((pos.walletRemainingBalance ?? 0n) < GAS_FEE_BUFFER) {
                    log.warn(`Skipping ${pos.walletAddress}: No SOL for gas.`);
                    returnType.data.failedWallets.push({pubkey: pos.walletAddress, reason: 'Not enough SOL for fees'});
                    return;
                }
                
                let amountToSell = pos.tokenAmount ?? 0n;
                if (sellPercentage !== 0 && sellPercentage < 100) {
                    amountToSell = ((pos.tokenAmount ?? 0n) * BigInt(sellPercentage)) / 100n;
                }

                if (!amountToSell || amountToSell <= 0n) {
                    log.info(`Skipping ${pos.walletAddress}: sell amount is 0.`);
                    returnType.data.failedWallets.push({pubkey: pos.walletAddress, reason: 'sell amount is 0.'});
                    return;
                }


                try {

                    log.info(
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
                    log.error(`/order failed: ${String(orderResponse.status)}`, await orderResponse.text());
                    returnType.data.failedWallets.push({pubkey: pos.walletAddress, reason: `Jupiter api call to /order is failed. ${String(orderResponse.status)}`});
                    return;
                }

                const orderResult = await orderResponse.json() as OrderResponse;
                if (!orderResult.transaction) {
                    returnType.data.failedWallets.push({pubkey: pos.walletAddress, reason: `Order failed to generate transaction`});
                    return;
                }
                
        
                const transaction = VersionedTransaction.deserialize(
                    Buffer.from(orderResult.transaction, "base64"),
                );
                transaction.sign([pair]);

                log.info(`Executing SELL for ${pos.walletAddress} (${String(amountToSell)} tokens)...`);


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
                    log.error(`/execute failed: ${String(executeResponse.status)}`, await executeResponse.text());
                    returnType.data.failedWallets.push({pubkey: pos.walletAddress, reason: `Jupiter api call to /execute is failed. ${String(executeResponse.status)}`});
                    return;
                }

                const result = await executeResponse.json() as ExecuteResponse;

                if (result.status === "Success") {
                        log.success(`Sell Success! https://solscan.io/tx/${result.signature}`);
                      try {
                        if (sellPercentage === 0 || sellPercentage === 100) {
                            await db.delete(positionsTable).where(eq(positionsTable.id, pos.id));
                            returnType.data.positionsClosed = returnType.data.positionsClosed + 1;
                            returnType.data.walletsSpent.push({
                                pubkey: pos.walletAddress,
                                spent: Number(amountToSell),
                                received: Number(orderResult.outAmount) / LAMPORTS_PER_SOL
                            });
                        } else {
                            await db.update(positionsTable)
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                .set({ tokenAmount: pos.tokenAmount! - amountToSell })
                                .where(eq(positionsTable.id, pos.id));
                        }
                        } catch (err) {
                            log.error(`CRITICAL: Sell succeeded on-chain but DB update failed for ${pos.walletAddress}`, err);
                        }
                } else {
                    returnType.data.failedWallets.push({pubkey: pos.walletAddress, reason: `Sell failed ${result.error ?? ''}`});
                    log.error("Sell failed:", result);
                }
        } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                returnType.data.failedWallets.push({pubkey: pos.walletAddress, reason: message});
                log.error(`Critical error selling for ${pos.walletAddress}:`, err);
        }
    })
  );
    await sleep(1200);
}); 

  log.success("Mass Sell operation completed.");
  log.info(`Positions Closed:`, returnType.data.positionsClosed);
  log.info(`Wallets Processed:`, returnType.data.walletsCount);
  log.info(`Failed Operations:`, returnType.data.failedWallets.length);

  if (returnType.data.failedWallets.length > 0) {
    log.info("Failures:");
    returnType.data.failedWallets.forEach((fail, i) => {
      log.error(`  ${(i + 1)}. ${fail.pubkey}: ${fail.reason}`);
    });
  }

  return returnType;
}