import crypto from 'crypto';


export const encryptPrivateKey = (privateKey: Uint8Array, password: string): Buffer => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(password.padEnd(32)), iv);
  const encrypted = Buffer.concat([cipher.update(privateKey), cipher.final()]);
  return Buffer.concat([iv, encrypted]);
};

export const decryptPrivateKey = (encrypted: Buffer, password: string): Uint8Array => {
  const iv = encrypted.subarray(0, 16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(password.padEnd(32)), iv);
  return new Uint8Array(Buffer.concat([decipher.update(encrypted.subarray(16)), decipher.final()]));
};