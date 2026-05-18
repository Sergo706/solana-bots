import { MiniCache } from '@riavzon/utils';
import { apiAndRpcTable, walletTable } from '@solana-bots/db';
import { db } from '@solana-bots/db/connection';
import { eq } from 'drizzle-orm';


const cache = new MiniCache(100, 1000 * 60 * 60 * 10);

export async function checkConfigStatus() {
    const cached = cache.get('SUCCESS');
    if (cached) return cached;

    const [wallet] = await db.select().from(walletTable).where(eq(walletTable.isMainWallet, true));
    const [apiRpc] = await db.select({encryptedApiKey: apiAndRpcTable.encryptedApiKey, rpc: apiAndRpcTable.rpc}).from(apiAndRpcTable);

    if ((!wallet?.privateKeyEncrypted || !wallet.publicAddress) || (!apiRpc?.encryptedApiKey || !apiRpc.rpc)) {
        return {
            ok: false,
            date: new Date().toISOString(),
            reason: 'needs starting'
        };
    }

    cache.set('SUCCESS', {
        ok: true,
        date: new Date().toISOString(),
        data: 'SUCCESS'
    }, 1000 * 60 * 60 * 10);

    return {
        ok: true,
        date: new Date().toISOString(),
        data: 'SUCCESS'
    };
}