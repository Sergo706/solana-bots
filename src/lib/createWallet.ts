import { Keypair } from "@solana/web3.js";
import { db } from "../db/connection.js";
import { encryptPrivateKey } from "../utils/encrypt.js";
import { walletTable } from "../db/index.js";
import consola from "consola";
import fs from 'node:fs';
import path from "node:path";


export async function createWallet(password: string) {
    const newWallet = Keypair.generate();
    const encP = encryptPrivateKey(newWallet.secretKey, password);

   await db.insert(walletTable).values({
        publicAddress: newWallet.publicKey.toBase58(),
        privateKeyEncrypted: encP,
        isMainWallet: false
    });

    consola.success('New Wallet created successfully', newWallet.publicKey);
    return;
}

export async function storeMain(password: string, secretPath: string) {
    const filePath = path.resolve(process.cwd(), secretPath);
    const secretKeyString = fs.readFileSync(filePath, "utf8");

    if (!secretKeyString) {
        consola.error(`File path didn't found at ${secretPath}`);
        process.exit(1);
    }

    try {
        const secretKeyArray = JSON.parse(secretKeyString) as number[];
        const secretKey = Uint8Array.from(secretKeyArray);
        
        const pub = Keypair.fromSecretKey(secretKey);
        const encP = encryptPrivateKey(pub.secretKey, password);

        await db.insert(walletTable).values({
            publicAddress: pub.publicKey.toBase58(),
            privateKeyEncrypted: encP,
            isMainWallet: true
        });

        consola.success('Main Wallet stored successfully', pub.publicKey.toBase58());
    } catch {
        consola.error("Invalid secret key format. Ensure it is a JSON array of numbers.");
        process.exit(1);
    }
}
