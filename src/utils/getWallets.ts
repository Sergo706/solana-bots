import consola from "consola";
import { db } from "../db/connection.js";
import { walletTable } from "../db/index.js";
import { eq } from "drizzle-orm";
import { decryptPrivateKey } from "./utils.js";
import { Keypair } from "@solana/web3.js";

export async function getAllWallets(password: string) {
  try {

  const [main] = await db.select().from(walletTable).where(eq(walletTable.isMainWallet, true));
  const subKeys = await db.select().from(walletTable).where(eq(walletTable.isMainWallet, false));
  
    if (subKeys.length === 0 && main?.privateKeyEncrypted || main?.publicAddress) {
        consola.error('There is not configured wallets in the database yet.');
        process.exit(1);
    } 
    

    const subWalletDecryptedKeyPair = subKeys.map((sub) => {
            const decryptedWallet = decryptPrivateKey(sub.privateKeyEncrypted as Buffer, password);
            const subWallet = Keypair.fromSecretKey(decryptedWallet);
            return subWallet;
    });

    const decryptedWallet = decryptPrivateKey(main?.privateKeyEncrypted as Buffer, password);
    const mainWallet = Keypair.fromSecretKey(decryptedWallet);

    return {
        mainKey: {
            decryptedPrivate: mainWallet.secretKey,
            pubkey: mainWallet.publicKey,
            meta: {
                id: main?.id,
                createAt: main?.createdAt
            }
        },
        subKeys: subWalletDecryptedKeyPair.map((w, i) => ({
            decryptedPrivate: w.secretKey,
            pubkey: w.publicKey,
            meta: {
                id: subKeys[i]?.id,
                createAt: subKeys[i]?.createdAt
            }
        }))
    };
  }  catch(err) {
        consola.error('error getting keys', err);
        process.exit(1);
  }
}