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
import { chunkProcess } from '@riavzon/utils';

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

        let currentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        let blockhashTimestamp = Date.now();
        const BLOCKHASH_LIFETIME_MS = 45000;
        const signatures: string[] = [];
        consola.start(`Distributing gas to ${String(subWalletAddresses.length)} wallets...`);
    
        await chunkProcess(subWalletAddresses, 5, async (walletChunk) => {
            if (Date.now() - blockhashTimestamp > BLOCKHASH_LIFETIME_MS) {
                try {
                    currentBlockhash = (await connection.getLatestBlockhash()).blockhash;
                    blockhashTimestamp = Date.now();
                    consola.info('Refreshed blockhash to prevent expiration.');
                } catch (err) {
                    consola.warn('Failed to refresh blockhash, attempting to proceed with the old one...', err);
                }
            }
            
            const chunkSigs = await Promise.all(walletChunk.map(async (sub) => {
                if (!sub.publicAddress) return null;

                try {
                    const transaction = new Transaction().add(
                        SystemProgram.transfer({
                            fromPubkey: mainWallet.publicKey,
                            toPubkey: new PublicKey(sub.publicAddress), 
                            lamports: Number(amountInLamports),
                        })
                    );

                    transaction.recentBlockhash = currentBlockhash;
                    transaction.feePayer = mainWallet.publicKey;
                    transaction.sign(mainWallet);
                    return await connection.sendRawTransaction(transaction.serialize());
                } catch (err) {
                    consola.error(`One transfer failed`, err);
                    return null;
                }
            }));
            
            for (const sig of chunkSigs) if (sig !== null) signatures.push(sig);
            await sleep(500 + Math.random() * 500);
        });

        consola.success(`Sent ${String(signatures.length)} transactions!`);
        consola.info(`Last Sig: ${signatures[signatures.length - 1] ?? 'No signature'}`);
        consola.success(`Successfully distributed funds across wallets`);
        
        return {
            ok: true,
            date: new Date().toISOString(),
            data: {
                sent: `Sent ${String(signatures.length)} transactions`,
                lastSignature: `Last Sig: ${signatures[signatures.length - 1] ?? 'No signature'}`
            }
        };

    } catch (err) {
        consola.error(`Error distributing funds`, err);
        throw new Error(`Error distributing funds`);
    }
}
