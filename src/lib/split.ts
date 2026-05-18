import { 
  Connection, 
  Keypair, 
  SystemProgram, 
  Transaction, 
  PublicKey,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { db } from '../db/connection.js';
import { walletTable } from '../db/index.js';
import { eq } from 'drizzle-orm';
import consola from 'consola';
import { decryptPrivateKey, getApiAndRpc, sleep } from '../utils/utils.js';


export async function distributeGas(password: string, amountPerWallet: number | string, targetedWallets?: { publicAddress: string | null; }[], fee = 5000) {
    const { rpc } = await getApiAndRpc(password);
    const connection = new Connection(rpc, "confirmed");
    const parsedAmount = typeof amountPerWallet === 'string' ? parseFloat(amountPerWallet) : amountPerWallet;

    try {

    const [wallet] = await db.select({
        privateKeyEncrypted: walletTable.privateKeyEncrypted,
        publicAddress: walletTable.publicAddress
    }).from(walletTable).where(eq(walletTable.isMainWallet, true));

    if (!wallet?.privateKeyEncrypted) {
        consola.error('The main wallet is not configured. configure it first');
        throw new Error('The main wallet is not configured. configure it first');
    }

    const decryptedWallet = decryptPrivateKey(wallet.privateKeyEncrypted as Buffer, password);
    const mainWallet = Keypair.fromSecretKey(decryptedWallet);

    let subWalletAddresses: {
        publicAddress: string | null;
    }[];

    if (!targetedWallets || targetedWallets.length === 0) {
        subWalletAddresses = await db.select({privateKeyEncrypted: walletTable.privateKeyEncrypted, publicAddress: walletTable.publicAddress})
                    .from(walletTable)
                    .where(eq(walletTable.isMainWallet, false));
    } else {
        subWalletAddresses = targetedWallets;
    }


    if (subWalletAddresses.length === 0) {
        consola.error('There is not configured wallets in the database yet. Create a few first.');
        throw new Error('There is not configured wallets in the database yet. Create a few first.');
    }

    const amountInLamports = BigInt(Math.floor(parsedAmount * LAMPORTS_PER_SOL));
    const estimatedFeePerTx = fee;

    const totalTransferAmount = amountInLamports * BigInt(subWalletAddresses.length);
    const totalFees = BigInt(estimatedFeePerTx) * BigInt(subWalletAddresses.length);
    const totalRequired = totalTransferAmount + totalFees;
    const currentBalance = BigInt(await connection.getBalance(mainWallet.publicKey));
    
    consola.info(`Total Required: ${String(Number(totalRequired) / LAMPORTS_PER_SOL)} SOL`);
    consola.info(`Current Balance: ${String(Number(currentBalance) / LAMPORTS_PER_SOL)} SOL`);

    if (currentBalance < totalRequired) {
        const missing = Number(totalRequired - currentBalance) / LAMPORTS_PER_SOL;
        consola.error(`Insufficient funds. You need ${missing.toFixed(5)} more SOL in your main wallet.`);
        throw new Error(`Insufficient funds. You need ${missing.toFixed(5)} more SOL in your main wallet.`);
    }

        const { blockhash } = await connection.getLatestBlockhash();
        const distributionPromises = subWalletAddresses.map(async (sub) => {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: mainWallet.publicKey,
                    toPubkey: new PublicKey(String(sub.publicAddress)), 
                    lamports: Number(amountInLamports),
                })
            );

            transaction.recentBlockhash = blockhash;
            transaction.feePayer = mainWallet.publicKey;
            transaction.sign(mainWallet);
            return connection.sendRawTransaction(transaction.serialize());

        });
            
    const signatures = await Promise.all(distributionPromises.map(async (pros) => {
            try {
                await(pros);
                await sleep(Math.random() * 700);
            } catch {}
    }));

    consola.success(`Sent ${String(signatures.length)} transactions!`);
    consola.info(`Last Sig: ${signatures[signatures.length - 1] ?? 'No signature'}`);

    consola.success(`Successfully distributed founds across wallets`);
    return {
        ok: true,
        date: new Date().toISOString(),
        data: {
            sent: `Sent ${String(signatures.length)} transactions`,
            lastSignature: `Last Sig: ${signatures[signatures.length - 1] ?? 'No signature'}`
        }
    };
    } catch (err) {
        consola.error(`Error distributing founds`, err);
        throw new Error(`Error distributing founds`);
    }
}
