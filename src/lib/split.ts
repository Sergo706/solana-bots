import { 
  Connection, 
  Keypair, 
  SystemProgram, 
  Transaction, 
  PublicKey,
  LAMPORTS_PER_SOL, 
  clusterApiUrl
} from '@solana/web3.js';
import { db } from '../db/connection.js';
import { walletTable } from '../db/index.js';
import { eq } from 'drizzle-orm';
import consola from 'consola';
import { decryptPrivateKey } from '../utils/utils.js';


export async function distributeGas(password: string, amountPerWallet: number) {
    const connection = new Connection(clusterApiUrl('devnet'), "confirmed");

    try {

    const [wallet] = await db.select({
        privateKeyEncrypted: walletTable.privateKeyEncrypted,
        publicAddress: walletTable.publicAddress
    }).from(walletTable).where(eq(walletTable.isMainWallet, true));

    if (!wallet?.privateKeyEncrypted) {
        consola.error('The main wallet is not configured. configure it first');
        process.exit(1);
    }

    const decryptedWallet = decryptPrivateKey(wallet.privateKeyEncrypted as Buffer, password);
    const mainWallet = Keypair.fromSecretKey(decryptedWallet);
    const { blockhash } = await connection.getLatestBlockhash();

    const subWalletAddresses = await db.select({privateKeyEncrypted: walletTable.privateKeyEncrypted, publicAddress: walletTable.publicAddress})
                    .from(walletTable)
                    .where(eq(walletTable.isMainWallet, false));

    if (subWalletAddresses.length === 0) {
        consola.error('There is not configured wallets in the database yet. Create a few first.');
        process.exit(1);
    }
    
        const distributionPromises = subWalletAddresses.map(async (sub) => {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: mainWallet.publicKey,
                    toPubkey: new PublicKey(String(sub.publicAddress)), 
                    lamports: Math.floor(LAMPORTS_PER_SOL * amountPerWallet),
                })
            );

            transaction.recentBlockhash = blockhash;
            transaction.feePayer = mainWallet.publicKey;
            transaction.sign(mainWallet);
            return connection.sendRawTransaction(transaction.serialize());

        });
            
    const signatures = await Promise.all(distributionPromises);
    consola.success(`Sent ${String(signatures.length)} transactions!`);
    consola.info(`Last Sig: ${signatures[signatures.length - 1] ?? 'No signature'}`);

    consola.success(`Successfully distributed founds across wallets`);
    } catch (err) {
        consola.error(`Error distributing founds`, err);
        process.exit(1);
    }
}
