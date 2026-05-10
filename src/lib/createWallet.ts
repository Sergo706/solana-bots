import { Keypair } from "@solana/web3.js";
import { db } from "../db/connection.js";
import { encryptPrivateKey } from "../utils/utils.js";
import { walletTable } from "../db/index.js";
import consola from "consola";
import fs from 'node:fs';
import path from "node:path";
import bs58 from 'bs58';
import { eq } from "drizzle-orm";

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
    const [main] = await db.select().from(walletTable).where(eq(walletTable.isMainWallet, true));

    if (main?.privateKeyEncrypted || main?.publicAddress) {
        consola.error(`MAIN wallet already exists!`);
        process.exit(1);
    }
    
    const filePath = path.resolve(process.cwd(), secretPath);
    const secretKeyString = fs.readFileSync(filePath, "utf8");

    if (!secretKeyString) {
        consola.error(`File path didn't found at ${secretPath}`);
        process.exit(1);
    }

    try {
        const trimmed = secretKeyString.trim();
        let secretKeyBytes: Uint8Array;

        try {
            const parsed = JSON.parse(trimmed)  as number[] | string;
            if (Array.isArray(parsed) && parsed.every((n) => typeof n === 'number')) {
                secretKeyBytes = Uint8Array.from(parsed);

            } else if (typeof parsed === 'string') {
                secretKeyBytes = bs58.decode(parsed);
            } else {
                throw new Error('Unsupported JSON secret format');
            }

        } catch {
            secretKeyBytes = bs58.decode(trimmed);
        }

        const pub = Keypair.fromSecretKey(secretKeyBytes);
        const encP = encryptPrivateKey(pub.secretKey, password);

        await db.insert(walletTable).values({
            publicAddress: pub.publicKey.toBase58(),
            privateKeyEncrypted: encP,
            isMainWallet: true
        });

        consola.success('Main Wallet stored successfully', pub.publicKey.toBase58());
        return;
    } catch (err) {
        consola.error("Invalid secret key format. Ensure it is a JSON array of numbers, a base58 string, base64, or hex.");
        consola.error(err);
        process.exit(1);
    }
}