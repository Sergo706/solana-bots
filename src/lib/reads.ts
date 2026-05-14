import { getAllWallets } from "../utils/getWallets.js";
import consola from "consola";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { db } from "../db/connection.js";
import { walletTable } from "../db/index.js";
import { eq } from "drizzle-orm";
import { decryptPrivateKey, getApiAndRpc, sleep } from "../utils/utils.js";


export async function getAllWalletsView(password: string) {
    const { rpc } = await getApiAndRpc(password);
    
    const keys = await getAllWallets(password);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!keys.mainKey && keys.subKeys.length === 0) {
        consola.warn("No wallets found in the database for this password.");
        return;
    }

    const connection = new Connection(rpc, "confirmed");
    const mainBalance = await connection.getBalance(keys.mainKey.pubkey);
    await sleep(1000);
    
    const mainKeyData = {
        id: keys.mainKey.meta.id,
        created_at: keys.mainKey.meta.createAt,
        publickey: keys.mainKey.pubkey.toBase58(),
        balanceOfSOL: mainBalance / LAMPORTS_PER_SOL
    };

    console.log(`Found ${String(keys.subKeys.length)} sub-wallets in DB.`);

    const publicKeys = keys.subKeys.map(w => w.pubkey);
    const accountsInfo = await connection.getMultipleAccountsInfo(publicKeys);

        const walletData = keys.subKeys.map((wallet, index) => {
            const acct = accountsInfo[index];
            const lamports = acct?.lamports ?? 0;
        return {
            id: wallet.meta.id,
            created_at: wallet.meta.createAt,
            publickey: wallet.pubkey.toBase58(),
            balanceOfSOL: lamports / LAMPORTS_PER_SOL
            };
        });

    consola.box({ main: mainKeyData, subs: walletData });
    return { main: mainKeyData, subs: walletData };
}


export async function getByPubkey(password: string, pubkey: string | PublicKey) { 
    try {
        const { rpc } = await getApiAndRpc(password);
        const connection = new Connection(rpc, "confirmed");

        const keyStr = typeof pubkey === 'string' ? pubkey : pubkey.toBase58();
        const [target] = await db.select().from(walletTable).where(eq(walletTable.publicAddress, keyStr));

        if (!target || (!target.privateKeyEncrypted && !target.publicAddress)) {
            consola.error('There are no configured wallets matching this pubkey.');
            throw new Error('There are no configured wallets matching this pubkey.');
         } 

         
        const decryptedWallet = decryptPrivateKey(target.privateKeyEncrypted as Buffer, password);
        const mainWallet = Keypair.fromSecretKey(decryptedWallet);
        const mainBalance = await connection.getBalance(mainWallet.publicKey);
        const data = {
            id: target.id,
            created_at: target.createdAt,
            publickey: keyStr,
            balanceOfSOL: mainBalance / LAMPORTS_PER_SOL
        };
        consola.box({ main: data });
        return { main: data };

    } catch (err) {
        consola.box('Error getting data', err);
        throw new Error(`Error Getting data`);
    }
}