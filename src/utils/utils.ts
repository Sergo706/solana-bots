import consola from 'consola';
import crypto from 'crypto';
import { db } from '../db/connection.js';
import { apiAndRpcTable } from '../db/index.js';
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  clusterApiUrl
} from "@solana/web3.js";
import { getAllWallets } from './getWallets.js';

const SCRYPT_CONFIG = {
  keyLen: 32,
  saltLen: 16,
  params: { N: 16384, r: 8, p: 1 }
};

export const encryptPrivateKey = (privateKey: Uint8Array, password: string): Buffer => {
try {

  const iv = crypto.randomBytes(16);
  const salt = crypto.randomBytes(SCRYPT_CONFIG.saltLen);
  const key = crypto.scryptSync(password, salt, SCRYPT_CONFIG.keyLen, SCRYPT_CONFIG.params);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  const encrypted = Buffer.concat([cipher.update(privateKey), cipher.final()]);

  return Buffer.concat([salt, iv, encrypted]);
} catch (err) {
    consola.error(`Encryption failed:`, err);
    process.exit(1);
}
};


export const decryptPrivateKey = (encrypted: Buffer, password: string): Uint8Array => {
try {
    if (encrypted.length < 32) {
        consola.error('Invalid encrypted data format');
        process.exit(1);
    }

    const salt = encrypted.subarray(0, 16);
    const iv = encrypted.subarray(16, 32);
    const ciphertext = encrypted.subarray(32);
    const key = crypto.scryptSync(password, salt, SCRYPT_CONFIG.keyLen, SCRYPT_CONFIG.params);

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    return new Uint8Array(Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]));
} catch (error: unknown) {
    const isErrLike = (e: unknown): e is { message?: string; code?: string } =>
      typeof e === 'object' && e !== null && ('message' in e || 'code' in e);

    if (isErrLike(error) && (error.message?.includes('bad decrypt') || error.code === 'ERR_OSSL_EVP_BAD_DECRYPT')) {
        consola.error('Incorrect password');
    }

    if (isErrLike(error) && typeof error.message === 'string') {
        consola.error('Incorrect password', error);
    }
     consola.error('Decryption error', error);
     process.exit(1);
  }
};


export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const toNumb = (val: unknown) =>  {
const numb = parseInt(String(val), 10);
  if (isNaN(numb)) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    consola.error(`${val} is not a valid number`);
     process.exit(1);
  }
  return numb;
};


export const rpcAndAPI = async (apiKey: string, rpc = 'https://api.mainnet.solana.com', password: string) => {
    const [data] = await db.select().from(apiAndRpcTable);
    const buf = Buffer.from(apiKey.trim(), 'utf8');
    const encBuf = encryptPrivateKey(buf, password);

   if (data) {
      consola.info('Updating rpc and api key');
      await db.update(apiAndRpcTable).set({
        encryptedApiKey: encBuf,
        rpc
    });
    } else {
          consola.info('Saving new rpc and api key');
          await db.insert(apiAndRpcTable).values({
            encryptedApiKey: encBuf,
            rpc
          });

    }

    consola.success('Saved encrypted api key, and rpc');
    return {ok: true, date: new Date().toISOString(), data: 'Saved encrypted api key, and rpc'};
};


export const getApiAndRpc = async (password: string) => {
   const [data] = await db.select().from(apiAndRpcTable);

   if (!data) {
      consola.error('No api key or rpc found');
      process.exit(1);
   }

   const dec = decryptPrivateKey(data.encryptedApiKey as Buffer, password);

   const rawKey = Buffer.from(dec).toString('utf-8').trim();
   return {
      rpc: data.rpc,
      rawKey
   };
};



export const getAirDrop = async (password: string) => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const keys = await getAllWallets(password);

  const receiver = new PublicKey(keys.mainKey.pubkey);
  const airdropAmt = 5 * LAMPORTS_PER_SOL;
  try {
    const sig = await connection.requestAirdrop(receiver, airdropAmt);
    consola.success('Airdrop succeeded!', sig);
    return;
  } catch (err) {
       consola.fail('Airdrop failed!', err);
  }

};



