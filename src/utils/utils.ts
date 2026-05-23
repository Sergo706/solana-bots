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
  saltLen: 32,
  params: { N: 16384, r: 8, p: 1 }
};

export const encryptPrivateKey = (privateKey: Uint8Array, password: string): Buffer => {
  try {
    const iv = crypto.randomBytes(12);
    const salt = crypto.randomBytes(SCRYPT_CONFIG.saltLen);
    const key = crypto.scryptSync(password, salt, SCRYPT_CONFIG.keyLen, SCRYPT_CONFIG.params);
    
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(privateKey), cipher.final()]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]);
  } catch (err) {
    throw new Error(`Encryption failed: ${(err as Error).message}`);
  }
};

export const decryptPrivateKey = (encrypted: Buffer, password: string): Uint8Array => {
  try {

    const saltLen = SCRYPT_CONFIG.saltLen;
    const ivLen = 12; 
    const tagLen = 16;
    const minLength = saltLen + ivLen + tagLen;

    if (encrypted.length < minLength) {
      throw new Error('Invalid encrypted data format');
    }

    let offset = 0;
    const salt = encrypted.subarray(offset, offset += saltLen);
    const iv = encrypted.subarray(offset, offset += ivLen);
    const tag = encrypted.subarray(offset, offset += tagLen);
    const ciphertext = encrypted.subarray(offset);

    const key = crypto.scryptSync(password, salt, SCRYPT_CONFIG.keyLen, SCRYPT_CONFIG.params);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    return new Uint8Array(Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]));
  } catch (error: unknown) {
    const err = error instanceof Error ? error : null;
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ERR_CRYPTO_OPERATION_FAILED' || err?.message.toLowerCase().includes('unsupported state')) {
      throw new Error('Incorrect password or data');
    }
    consola.log(`Decryption failure`);
    throw error;
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
      throw new Error('No api key or rpc found');
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



