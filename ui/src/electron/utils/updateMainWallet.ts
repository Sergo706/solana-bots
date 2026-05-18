import { db } from "@solana-bots/db/connection";
import { walletTable } from "@solana-bots/db";
import bs58 from 'bs58';
import { Keypair } from "@solana/web3.js";
import { encryptPrivateKey } from "@solana-bots/utils/utils";
import consola from "consola";
import { and, eq } from "drizzle-orm";
import { getAllWallets } from "@solana-bots/utils/getWallets";
import type { Results } from "@riavzon/utils";

async function validatePassword(password: string) {
    return await getAllWallets(password);
}

export async function updateMainWallet(password: string, newSecretWallet: string): Promise<Results<string>> {
    let old;
    try {
         old = await validatePassword(password);
        } catch {
            return {
                ok: false,
                date: new Date().toISOString(),
                reason: 'Invalid password'
        };
    }

    try {
        const trimmed = newSecretWallet.trim();
        let secretKeyBytes: Uint8Array;

        try {
            const parsed = JSON.parse(trimmed) as number[] | string;
            if (Array.isArray(parsed) && parsed.every((n) => typeof n === 'number')) {
                secretKeyBytes = Uint8Array.from(parsed);

            } else if (typeof parsed === 'string') {
                secretKeyBytes = bs58.decode(parsed);
            } else {
                return {
                    ok: false,
                    date: new Date().toISOString(),
                    reason: 'Unsupported secret format'
                };
            }

        } catch {
            secretKeyBytes = bs58.decode(trimmed);
        }

        const pub = Keypair.fromSecretKey(secretKeyBytes);
        const encP = encryptPrivateKey(pub.secretKey, password);

        await db.transaction(async (tx) => { 
            const oldAddress = old.mainKey.pubkey.toBase58();
            const newPublicAddress = pub.publicKey.toBase58();

            //  User submitted their existing main wallet key string
            if (newPublicAddress === oldAddress) {
                await tx.update(walletTable)
                    .set({
                        privateKeyEncrypted: encP,
                        isMainWallet: true
                    })
                    .where(eq(walletTable.publicAddress, newPublicAddress));
                return; 
            }

            const existing = await tx.select().from(walletTable).where(eq(walletTable.publicAddress, newPublicAddress));

            await tx.delete(walletTable)
            .where(and(
                eq(walletTable.isMainWallet, true),
                eq(walletTable.publicAddress, oldAddress)
            ));
            
            if (existing.length > 0) {
                await tx.update(walletTable)
                .set({
                    privateKeyEncrypted: encP,
                    isMainWallet: true
                })
                .where(eq(walletTable.publicAddress, newPublicAddress));
            } else {
                await tx.insert(walletTable)
                .values({
                    publicAddress: newPublicAddress,
                    privateKeyEncrypted: encP,
                    isMainWallet: true
                });
            }

        });
        
        consola.success('Main Wallet stored and rotated successfully', pub.publicKey.toBase58());
        return {
            ok: true,
            date: new Date().toISOString(),
            data: `New main wallet updated successfully. ${pub.publicKey.toBase58()}`
        }; 
    } catch (err) {
        consola.error(err);
        return {
            ok: false,
            date: new Date().toISOString(),
            reason: 'Invalid password or new key format'
        };
    }
}