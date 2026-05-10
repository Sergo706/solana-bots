import { 
  Connection, 
  Keypair, 
  VersionedTransaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { db } from '../../db/connection.js';
import { walletTable } from '../../db/index.js';
import { eq } from 'drizzle-orm';
import consola from 'consola';
import { decryptPrivateKey, getApiAndRpc, sleep } from '../../utils/utils.js';
import type { ExecuteResponse, OrderResponse } from '../../types/Jupiter.js';

const NETWORK_FEE_BUFFER = BigInt(0.005 * LAMPORTS_PER_SOL);
const SOL_MINT = "So11111111111111111111111111111111111111112";

export async function massBuy(targetMintAddress: string, solAmountsPerWallet: number, numberOfWallets: number, password: string) {
 const { rpc, rawKey } = await getApiAndRpc(password);

 const API_KEY = rawKey;
 if (!API_KEY) throw new Error("Missing JUPITER_API_KEY");
 const JUPITER_BASE_URL = "https://api.jup.ag/swap/v2";

 const connection = new Connection(rpc, 'confirmed');
 const lamportsPerWallet = BigInt(Math.floor(solAmountsPerWallet * LAMPORTS_PER_SOL));

 const allSubWallets = await db.select().from(walletTable).where(eq(walletTable.isMainWallet, false));
 const selectedWallets = allSubWallets.slice(0, numberOfWallets);

 if (selectedWallets.length < numberOfWallets) {
        consola.warn(`Requested ${String(numberOfWallets)} wallets, but only found ${String(selectedWallets.length)} in DB.`);
 }

     const decrypedWallets = selectedWallets.map((sub) => {
         const decryptedWallet = decryptPrivateKey(sub.privateKeyEncrypted as Buffer, password);
         const subWallet = Keypair.fromSecretKey(decryptedWallet);
         return subWallet;
     });
 

     consola.start(`Preparing to buy ${targetMintAddress} across ${String(decrypedWallets.length)} wallets...`);
     
     for (const wallet of decrypedWallets) {
       try {
        const balance = await connection.getBalance(wallet.publicKey);

        if (balance < (lamportsPerWallet + NETWORK_FEE_BUFFER)) {
            consola.warn(`Skipping ${wallet.publicKey.toBase58()}: Insufficient SOL for swap + buy.`);
            continue; 
        }

        consola.info(`Ordering for ${wallet.publicKey.toBase58()} wallet...`);
        const orderUrl = new URL(`${JUPITER_BASE_URL}/order`);
        orderUrl.searchParams.append("inputMint", SOL_MINT);
        orderUrl.searchParams.append("outputMint", targetMintAddress);
        orderUrl.searchParams.append("amount", String(lamportsPerWallet));
        orderUrl.searchParams.append('taker', wallet.publicKey.toString());

        const orderResponse = await fetch(orderUrl, { 
            headers: { 
                "x-api-key": API_KEY 
            } 
        });

        if (!orderResponse.ok) {
            consola.error(`/order failed: ${String(orderResponse.status)}`, await orderResponse.text());
            continue;
        }

        const orderResult = await orderResponse.json() as OrderResponse;
        if (!orderResult.transaction) throw new Error("Order failed to generate transaction");
        let totalSolRequired = lamportsPerWallet + NETWORK_FEE_BUFFER;


        if (orderResult.feeMint === SOL_MINT) {
                totalSolRequired += BigInt(orderResult.platformFee.amount);
        }

        if (balance < totalSolRequired) {
            consola.error(`Wallet ${wallet.publicKey.toBase58()} can't afford the Jupiter Platform Fee in SOL.`);
            continue;
        }
        
        const transaction = VersionedTransaction.deserialize(
            Buffer.from(orderResult.transaction, "base64"),
        );
        transaction.sign([wallet]);
        consola.info(`Chosen router: ${orderResult.router}`);


        const executeResponse = await fetch(`${JUPITER_BASE_URL}/execute`, {
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
            continue;
        }

        const result = await executeResponse.json() as ExecuteResponse;

        if (result.status === "Success") {
                consola.success(`Buy Success! https://solscan.io/tx/${result.signature}`);
            } else {
                consola.error("Swap failed:", JSON.stringify(result, null, 2));
         }
         await sleep(1000);
     } catch (err) {
        consola.error(`Critical error for ${wallet.publicKey.toBase58()}:`, err);
    }
  }
  consola.success("Mass Buy operation completed.");
  return;
}