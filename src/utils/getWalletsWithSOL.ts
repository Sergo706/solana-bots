import { Connection, LAMPORTS_PER_SOL, Keypair, PublicKey } from '@solana/web3.js';
import { db } from '../db/connection.js';
import { walletTable } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { decryptPrivateKey, getApiAndRpc } from './utils.js';
import { chunkProcess } from '@riavzon/utils';

export async function getEligibleWallets(password: string, minSolRequired: number) {
    const { rpc } = await getApiAndRpc(password);
    const connection = new Connection(rpc, 'confirmed');
    
   
    const subs = await db.select().from(walletTable).where(eq(walletTable.isMainWallet, false));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const publicKeys = subs.map(s => new PublicKey(s.publicAddress!));

    const balances: number[] = [];
    await chunkProcess(publicKeys, 10, async (chunk) => {
        const infos = await connection.getMultipleAccountsInfo(chunk);
        infos.forEach(i => balances.push(i?.lamports ?? 0));
    });


    const minLamports = minSolRequired * LAMPORTS_PER_SOL;
    const eligible: { wallet: Keypair, balance: number }[] = [];

    subs.forEach((sub, index) => {
        const balance = balances[index] ?? 0;
        if (balance >= minLamports) {
            const decrypted = decryptPrivateKey(sub.privateKeyEncrypted as Buffer, password);
            eligible.push({
                wallet: Keypair.fromSecretKey(decrypted),
                balance: balance
            });
        }
    });

    return eligible;
}