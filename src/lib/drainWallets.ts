import { 
  Connection, 
  Keypair, 
  SystemProgram, 
  Transaction, 
  PublicKey
} from '@solana/web3.js';
import { db } from '../db/connection.js';
import { walletTable } from '../db/index.js';
import { eq } from 'drizzle-orm';
import consola from 'consola';
import { decryptPrivateKey, getApiAndRpc } from '../utils/utils.js';



export async function drainWalletsToMain(password: string, fee = 5000) {
    const { rpc } = await getApiAndRpc(password);
    
    const connection = new Connection(rpc, 'confirmed');

    const [mainWalletData] = await db.select().from(walletTable).where(eq(walletTable.isMainWallet, true));
    
    if (!mainWalletData?.privateKeyEncrypted || !mainWalletData.publicAddress) {
        consola.error('Main wallet not configured.');
        return;
    }

    const destPublicKey = new PublicKey(mainWalletData.publicAddress);
    
    const subWalletAddresses = await db.select()
                    .from(walletTable)
                    .where(eq(walletTable.isMainWallet, false));

    if (subWalletAddresses.length === 0) {
        consola.error('There is not configured wallets in the database yet. Create a few first.');
        process.exit(1);
    }

    const subWalletDecrypted = subWalletAddresses.map((sub) => {
            const decryptedWallet = decryptPrivateKey(sub.privateKeyEncrypted as Buffer, password);
            const subWallet = Keypair.fromSecretKey(decryptedWallet);
            return subWallet;
    });

    const publicKeys = subWalletDecrypted.map(w => w.publicKey);
    const accountsInfo = await connection.getMultipleAccountsInfo(publicKeys);


    const { blockhash } = await connection.getLatestBlockhash();
    const txPromises: Promise<string>[] = [];

    for (let i = 0; i < subWalletDecrypted.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const subWallet = subWalletDecrypted[i]!;
        const info = accountsInfo[i];

        if (!info || info.lamports === 0) continue;
        const amountToDrain = info.lamports - fee;

        if (amountToDrain <= 0) {
            consola.info(`Skipping ${String(subWallet.publicKey)}: Insufficient balance for fee.`);
            continue;
        }

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: new PublicKey(subWallet.publicKey),
                toPubkey: new PublicKey(destPublicKey),
                lamports: amountToDrain,
            })
        );

        transaction.recentBlockhash = blockhash;
        transaction.feePayer = subWallet.publicKey;
        transaction.sign(subWallet);

        txPromises.push(connection.sendRawTransaction(transaction.serialize()));
    }

    if (txPromises.length === 0) {
        consola.info('No wallets had enough funds to drain.');
        return;
    }

   try {
        consola.start(`Draining ${String(txPromises.length)} wallets...`);
        const signatures = await Promise.all(txPromises);
        consola.success(`Successfully drained ${String(signatures.length)} wallets.`);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        consola.info(`Sig: ${signatures[0]!}`);
        return;
    } catch (err) {
        consola.error('Error during batch drain:', err);
        process.exit(1);
    }
}