import { 
  Connection, 
  Keypair, 
  SystemProgram, 
  Transaction, 
  PublicKey,
  type AccountInfo
} from '@solana/web3.js';
import { db } from '../db/connection.js';
import { walletTable } from '../db/index.js';
import { eq, inArray, SQL, and } from 'drizzle-orm';
import consola from 'consola';
import { decryptPrivateKey, getApiAndRpc, sleep } from '../utils/utils.js';
import { chunkProcess } from '@riavzon/utils';


export async function drainWalletsToMain(password: string, targetedWallets?: {publicAddress: string, id: number}[], fee = 5000) {
    const { rpc } = await getApiAndRpc(password);
    
    const connection = new Connection(rpc, 'confirmed');

    const [mainWalletData] = await db.select().from(walletTable).where(eq(walletTable.isMainWallet, true));
    
    if (!mainWalletData?.privateKeyEncrypted || !mainWalletData.publicAddress) {
        consola.error('Main wallet not configured.');
        throw new Error('Main wallet not configured.');
    }
    const filters: SQL[] = [eq(walletTable.isMainWallet, false)];
    const destPublicKey = new PublicKey(mainWalletData.publicAddress);

    if (targetedWallets?.length === 0) {
        consola.warn('Specific drain requested, but target array resolved empty. Aborting to protect funds.');
        return { ok: false, date: new Date().toISOString(), reason: 'No matching specific wallets were found to drain.' };
    }

    if (targetedWallets && targetedWallets.length > 0) {
        const ids = targetedWallets.map((id) => id.id);
        const pubkeys = targetedWallets.map((id) => id.publicAddress);

        filters.push(inArray(walletTable.id, ids));
        filters.push(inArray(walletTable.publicAddress, pubkeys));
    }

    const subWalletAddresses = await db.select()
                    .from(walletTable)
                    .where(and(...filters));

    if (subWalletAddresses.length === 0) {
        consola.error('There is not configured wallets in the database yet. Create a few first.');
        throw new Error('There is not configured wallets in the database yet. Create a few first.');
    }

    const subWalletDecrypted = subWalletAddresses.map((sub) => {
            const decryptedWallet = decryptPrivateKey(sub.privateKeyEncrypted as Buffer, password);
            const subWallet = Keypair.fromSecretKey(decryptedWallet);
            return subWallet;
    });

    const publicKeys = subWalletDecrypted.map(w => w.publicKey);
    const accountsInfo: (AccountInfo<Buffer> | null)[] = [];
    await chunkProcess(publicKeys, 90, async (chunkOfKeys) => {
        const chunkResults = await connection.getMultipleAccountsInfo(chunkOfKeys);
        accountsInfo.push(...chunkResults);
        await sleep(200);
    });

  try {
      let currentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      let blockhashTimestamp = Date.now();
      const BLOCKHASH_LIFETIME_MS = 45000;
      consola.start(`Draining wallets...`);
      let successCount = 0;

      const walletsWithInfo = subWalletDecrypted.map((wallet, i) => ({ wallet, info: accountsInfo[i] }));  

      await chunkProcess(walletsWithInfo, 5, async (chunk) => { 
            if (Date.now() - blockhashTimestamp > BLOCKHASH_LIFETIME_MS) {
                try {
                    currentBlockhash = (await connection.getLatestBlockhash()).blockhash;
                    blockhashTimestamp = Date.now();
                    consola.info('Refreshed blockhash to prevent expiration.');
                } catch (err) {
                    consola.warn('Failed to refresh blockhash, attempting to proceed with the old one...', err);
                }
            }

            await Promise.all(chunk.map(async ({ wallet, info }) => {
                if (!info || info.lamports === 0) return;
                const amountToDrain = info.lamports - fee;

                if (amountToDrain <= 0) {
                    consola.info(`Skipping ${String(wallet.publicKey)}: Insufficient balance for fee.`);
                    return;
                 }

                try {
                    const transaction = new Transaction().add(
                    SystemProgram.transfer({
                        fromPubkey: new PublicKey(wallet.publicKey),
                        toPubkey: new PublicKey(destPublicKey),
                        lamports: amountToDrain,
                    })
                );

                    transaction.recentBlockhash = currentBlockhash;
                    transaction.feePayer = wallet.publicKey;
                    transaction.sign(wallet);

                    await connection.sendRawTransaction(transaction.serialize());
                    successCount++;
                } catch (err) {
                    consola.error(`Failed to drain ${wallet.publicKey.toBase58()}:`, err);
                }
            }));
            
            await sleep(500 + Math.random() * 500);

      });

      consola.success(`Successfully drained ${String(successCount)} wallets.`);
      return { ok: true, date: new Date().toISOString(), data: `Successfully drained ${String(successCount)} wallets.`};
  } catch (err) {
        consola.error('Error during batch drain:', err);
        throw new Error('Error during batch drain');
    }
}