import { 
  Keypair, 
  VersionedTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { db } from '../../db/connection.js';
import { positionsTable, walletTable } from '../../db/index.js';
import { eq, inArray } from 'drizzle-orm';
import consola from 'consola';
import { chunkProcess } from '@riavzon/utils';
import { decryptPrivateKey, getApiAndRpc, sleep } from '../../utils/utils.js';
import type { ExecuteResponse, OrderResponse } from '../../types/Jupiter.js';
import { fetchWithRetry } from '../../utils/fetchWithRetry.js';

const GAS_FEE_BUFFER = BigInt(0.005 * LAMPORTS_PER_SOL);
const SOL_MINT = "So11111111111111111111111111111111111111112";
const JUPITER_BASE_URL = "https://api.jup.ag/swap/v2";


export async function massOutForAllWallets(password: string) {
 const { rpc, rawKey } = await getApiAndRpc(password);
 
 if (rpc.includes('devnet')) {
    consola.error("Jupiter swaps are not supported on Devnet. Please use a Mainnet RPC for trading.");
    process.exit(1);
}

 const API_KEY = rawKey;
 if (!API_KEY) throw new Error("Missing JUPITER_API_KEY");
 

 const positions = await db.select()
    .from(positionsTable);

  if (positions.length === 0) {
    consola.warn(`No positions found in database`);
    return {
        ok: false,
        date: new Date().toISOString(),
        reason: `No positions found in database`
    };
  }

  const walletMap = new Map<string, Keypair>();
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
 

    consola.info(`Found ${String(positions.length)} token positions to unwind.`);
    const returnType = {
        ok: true,
        date: new Date().toISOString(),
        data: {
            positionsClosed: 0,
            walletsCount: walletMap.entries().toArray().length,
            failedWallets: [{
                pubkey: '',
                reason: ''
            }]
        }
    };

    await chunkProcess(positions, 1, async (chunk) => {
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
                    consola.warn(`Skipping ${pos.walletAddress}: no SOL for gas.`);
                    returnType.data.failedWallets.push({pubkey: pos.walletAddress, reason: 'Not enough SOL for fees'});
                    tx.rollback();
                    return;
                }

                consola.info(`Selling ${String(pos.tokenAmount)} of ${pos.targetMintAddress} from ${pos.walletAddress}...`);
                const orderUrl = new URL(`${JUPITER_BASE_URL}/order`);
                orderUrl.searchParams.set("inputMint", pos.targetMintAddress);
                orderUrl.searchParams.set("outputMint", SOL_MINT);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                orderUrl.searchParams.set("amount", pos.tokenAmount!.toString());
                orderUrl.searchParams.set("taker", pos.walletAddress);

                const orderRes = await fetchWithRetry(String(orderUrl), 5, 500, {
                        headers: { "x-api-key": API_KEY },
                });
                    
                if (!orderRes.ok) {
                    consola.error(`/order failed for ${pos.targetMintAddress}: ${String(orderRes.status)}`, await orderRes.text());
                     returnType.data.failedWallets.push({pubkey: pos.walletAddress, reason: `Jupiter api call to /order is failed. ${String(orderRes.status)}`});
                    tx.rollback();
                    return;
                }

                const orderResult = await orderRes.json() as OrderResponse;
                if (!orderResult.transaction) {
                    tx.rollback();
                    return;
                }
        
                const transaction = VersionedTransaction.deserialize(Buffer.from(orderResult.transaction, "base64"));
                transaction.sign([pair]);

                
                const executeRes = await fetchWithRetry(`${JUPITER_BASE_URL}/execute`, 5, 500, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "x-api-key": API_KEY 
                    },
                    body: JSON.stringify({
                        signedTransaction: Buffer.from(transaction.serialize()).toString("base64"),
                        requestId: orderResult.requestId,
                    }),
                });

                if (!executeRes.ok) {
                        consola.error(`/execute failed for ${pos.targetMintAddress}: ${String(executeRes.status)}`, await executeRes.text());
                        returnType.data.failedWallets.push({pubkey: pos.walletAddress, reason: `Jupiter api call to /execute is failed. ${String(executeRes.status)}`});
                        tx.rollback();
                        return;
                }

                const result = await executeRes.json() as ExecuteResponse;

                if (result.status === "Success") {
                    consola.success(`Cleaned up ${pos.targetMintAddress}: ${result.signature}`);
                    await tx.delete(positionsTable).where(eq(positionsTable.id, pos.id));
                    returnType.data.positionsClosed = returnType.data.positionsClosed + 1;
                } else {
                    returnType.data.failedWallets.push({pubkey: pos.walletAddress, reason: `Swap failed`});
                    tx.rollback();
                    consola.error(`Swap failed for ${pos.targetMintAddress}:`, result);
                }
            } catch (err) {
                tx.rollback();
                returnType.data.failedWallets.push({pubkey: pos.walletAddress, reason: `Critical error for wallet`});
                consola.error(`Critical error for wallet ${pos.walletAddress}:`, err); 
            }
             });
            })
        );
        await sleep(1200);
    });
   consola.success("Mass Out operation completed.");
    if (returnType.data.failedWallets.every(d => d.pubkey && d.pubkey !== '')) {
      returnType.data.failedWallets = [];
     }

  return returnType;
}