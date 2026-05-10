import { 
  Connection, 
  Keypair, 
  VersionedTransaction,
  LAMPORTS_PER_SOL,
  PublicKey
} from '@solana/web3.js';
import { db } from '../../db/connection.js';
import { walletTable } from '../../db/index.js';
import { eq } from 'drizzle-orm';
import consola from 'consola';
import { decryptPrivateKey, getApiAndRpc, sleep } from '../../utils/utils.js';
import type { ExecuteResponse, OrderResponse } from '../../types/Jupiter.js';

const GAS_FEE_BUFFER = BigInt(0.005 * LAMPORTS_PER_SOL);
const SOL_MINT = "So11111111111111111111111111111111111111112";
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

export async function massOutForAllWallets(password: string) {
 const { rpc, rawKey } = await getApiAndRpc(password);
 
 if (rpc.includes('devnet')) {
    consola.error("Jupiter swaps are not supported on Devnet. Please use a Mainnet RPC for trading.");
    process.exit(1);
}

 const API_KEY = rawKey;
 const JUPITER_BASE_URL = "https://api.jup.ag/swap/v2";
 const connection = new Connection(rpc, 'confirmed');

 if (!API_KEY) throw new Error("Missing JUPITER_API_KEY");


  const allSubWallets = await db.select().from(walletTable).where(eq(walletTable.isMainWallet, false));
  const decryptedWallets = allSubWallets.map((sub) => {
         const decryptedWallet = decryptPrivateKey(sub.privateKeyEncrypted as Buffer, password);
         const subWallet = Keypair.fromSecretKey(decryptedWallet);
         return subWallet;
     });
 

     consola.start(`Starting MASS OUT (Cleanup) for ALL wallets...`);
        
     for (const wallet of decryptedWallets) {
       try {
         consola.info(`Checking wallet: ${wallet.publicKey.toBase58()}`);
         const solBalance = BigInt(await connection.getBalance(wallet.publicKey));
         await sleep(500);
            if (solBalance < GAS_FEE_BUFFER) {
                consola.warn(`Skipping ${wallet.publicKey.toBase58()}: No SOL for gas.`);
                continue;
            }

        const standardAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { programId: TOKEN_PROGRAM_ID });
        await sleep(1000);
        const token2022Accounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { programId: TOKEN_2022_PROGRAM_ID });


        const allAccounts = [...standardAccounts.value, ...token2022Accounts.value];

            for (const accountInfo of allAccounts) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                const mint = accountInfo.account.data.parsed.info.mint;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                const tokenAmountRaw = accountInfo.account.data.parsed.info.tokenAmount.amount;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const amountBigInt = BigInt(tokenAmountRaw);

                if (mint === SOL_MINT || amountBigInt === 0n) continue;


                const amountToSell = amountBigInt;

                consola.info(`Found token ${String(mint)}. Selling ${amountToSell.toString()} units...`);

                try {
                    const orderUrl = new URL(`${JUPITER_BASE_URL}/order`);
                    orderUrl.searchParams.append("inputMint", String(mint));
                    orderUrl.searchParams.append("outputMint", SOL_MINT);
                    orderUrl.searchParams.append("amount", amountToSell.toString());
                    orderUrl.searchParams.append('taker', wallet.publicKey.toString());

                    const orderRes = await fetch(orderUrl, { headers: { "x-api-key": API_KEY } });
                    
                    if (!orderRes.ok) {
                        consola.error(`No route for ${String(mint)}. low-liquidity or scam token.`);
                        continue; 
                    }

                    const orderResult = await orderRes.json() as OrderResponse;
                    const transaction = VersionedTransaction.deserialize(Buffer.from(orderResult.transaction, "base64"));
                    transaction.sign([wallet]);

                    const executeRes = await fetch(`${JUPITER_BASE_URL}/execute`, {
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

                    const result = await executeRes.json() as ExecuteResponse;

                    if (result.status === "Success") {
                        consola.success(`Cleaned up ${String(mint)}! TX: ${result.signature}`);
                    } else {
                        consola.error(`Failed to swap ${String(mint)}:`, result);
                    }

                    await sleep(2000);

                } catch (tokenErr) {
                    consola.error(`Error processing token ${String(mint)}:`, tokenErr);
                }
            }

            await sleep(2000);

        } catch (walletErr) {
            consola.error(`Critical error for wallet ${wallet.publicKey.toBase58()}:`, walletErr);
            await sleep(5000);
        }
    }
    consola.success("Mass Out operation completed.");
   return;
}