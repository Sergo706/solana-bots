import { getAllWallets } from "../utils/getWallets.js";
import consola from "consola";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { db } from "../db/connection.js";
import { walletTable } from "../db/index.js";
import { eq } from "drizzle-orm";
import { decryptPrivateKey, getApiAndRpc } from "../utils/utils.js";



export async function getAllWalletsView(password: string) {
    const { rpc } = await getApiAndRpc(password);
    
    const connection = new Connection(rpc, "confirmed");
    const keys = await getAllWallets(password);
    const mainBalance = await connection.getBalance(keys.mainKey.pubkey);
    
    const mainKeyData = {
        id: keys.mainKey.meta.id,
        created_at: keys.mainKey.meta.createAt,
        publickey: keys.mainKey.pubkey.toBase58(),
        balanceOfSOL: mainBalance / LAMPORTS_PER_SOL
    };

    const subKeysData = await Promise.all((keys.subKeys).map(async (s) => {
        const bal = await connection.getBalance(s.pubkey);
        return {
            id: s.meta.id,
            created_at: s.meta.createAt,
            publickey: s.pubkey.toBase58(),
            balanceOfSOL: bal / LAMPORTS_PER_SOL
        };
    }));

    consola.box({ main: mainKeyData, subs: subKeysData });
    return;
}


export async function getByPubkey(password: string, pubkey: string | PublicKey) { 
    try {
        const { rpc } = await getApiAndRpc(password);
        const connection = new Connection(rpc, "confirmed");

        const keyStr = typeof pubkey === 'string' ? pubkey : pubkey.toBase58();
        const [target] = await db.select().from(walletTable).where(eq(walletTable.publicAddress, keyStr));

        if (target?.privateKeyEncrypted || target?.publicAddress) {
            consola.error('There is not configured wallets matching this pubkey.');
            process.exit(1);
         } 

         
        const decryptedWallet = decryptPrivateKey(target?.privateKeyEncrypted as Buffer, password);
        const mainWallet = Keypair.fromSecretKey(decryptedWallet);
        const mainBalance = await connection.getBalance(mainWallet.publicKey);
        const data = {
            id: target?.id,
            created_at: target?.createdAt,
            publickey: keyStr,
            balanceOfSOL: mainBalance / LAMPORTS_PER_SOL
        };
        consola.box({ main: data });
        return;

    } catch (err) {
        consola.box('Error getting data', err);
        process.exit(1);
    }
}