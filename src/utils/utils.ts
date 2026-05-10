import consola from 'consola';
import crypto from 'crypto';

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