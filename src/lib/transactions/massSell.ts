import { 
  Connection, 
  Keypair, 
  clusterApiUrl,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
  PublicKey
} from '@solana/web3.js';
import { db } from '../../db/connection.js';
import { walletTable } from '../../db/index.js';
import { eq } from 'drizzle-orm';
import consola from 'consola';
import { decryptPrivateKey, sleep } from '../../utils/utils.js';
import type { ExecuteResponse, OrderResponse } from '../../types/Jupiter.js';

const GAS_FEE_BUFFER = BigInt(0.005 * LAMPORTS_PER_SOL);
const SOL_MINT = "So11111111111111111111111111111111111111112";

export async function massSell(targetMintAddress: string, numberOfWallets: number, password: string, sellPercentage = 0) {
 const API_KEY = process.env['JUPITER'];
 const JUPITER_BASE_URL = "https://api.jup.ag/swap/v2";
 const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

 if (!API_KEY) throw new Error("Missing JUPITER_API_KEY");


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
 

     consola.start(`Preparing to Sell ${targetMintAddress} from ${String(decrypedWallets.length)} wallets...`);
     
     for (const wallet of decrypedWallets) {
       try {

         const solBalance = BigInt(await connection.getBalance(wallet.publicKey));
            if (solBalance < GAS_FEE_BUFFER) {
                consola.warn(`Skipping ${wallet.publicKey.toBase58()}: No SOL for gas.`);
                continue;
            }

        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
                mint: new PublicKey(targetMintAddress)
        });

        if (tokenAccounts.value.length === 0) {
            consola.info(`Wallet ${wallet.publicKey.toBase58()} has no balance for this token.`);
            continue;
        }

        const tokenAccount = tokenAccounts.value[0];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const totalTokenAmountStr = tokenAccount?.account.data.parsed?.info?.tokenAmount?.amount;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const totalTokenAmount = BigInt(totalTokenAmountStr);

        if (totalTokenAmount <= 0n) {
            consola.info(`Wallet ${wallet.publicKey.toBase58()} balance is 0.`);
            continue;
        }
        let amountToSell = totalTokenAmount;
        if (sellPercentage !== 0) {
            amountToSell = (totalTokenAmount * BigInt(sellPercentage)) / 100n;
        }

        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        consola.info(`Wallet holds ${totalTokenAmountStr} tokens. Selling ${amountToSell.toString()} tokens...`);
        const orderUrl = new URL(`${JUPITER_BASE_URL}/order`);
        orderUrl.searchParams.append("inputMint", targetMintAddress);
        orderUrl.searchParams.append("outputMint", SOL_MINT);
        orderUrl.searchParams.append("amount", String(amountToSell));
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
        
        
        const transaction = VersionedTransaction.deserialize(
            Buffer.from(orderResult.transaction, "base64"),
        );
        transaction.sign([wallet]);

       consola.info(`Executing SELL for ${wallet.publicKey.toBase58()} (${String(amountToSell)} tokens)...`);


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
                consola.success(`Sell Success! https://solscan.io/tx/${result.signature}`);
            } else {
                consola.error("Sell failed:", result);
         }
         await sleep(1000);
     } catch (err) {
        consola.error(`Critical error selling for ${wallet.publicKey.toBase58()}:`, err);
    }
  }

  consola.success("Mass Sell operation completed.");
  return;
}