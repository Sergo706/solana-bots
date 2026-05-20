/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { SerializedWallet } from '@/types/positons';
import {  Keypair } from '@solana/web3.js';

export function toKeyPair(wallet: SerializedWallet): Keypair {
  let secretKeyUint8: Uint8Array;
  
  if (wallet.secretKey instanceof Uint8Array) {
    secretKeyUint8 = wallet.secretKey;
  } 

  else if (Array.isArray(wallet.secretKey)) {
    secretKeyUint8 = Uint8Array.from(wallet.secretKey);
  } 

  else if (wallet.secretKey && typeof wallet.secretKey === 'object') {
    const rawKey = wallet.secretKey as Record<string, unknown>;

    if (rawKey['type'] === 'Buffer' && Array.isArray(rawKey['data'])) {
      secretKeyUint8 = Uint8Array.from(rawKey['data'] as number[]);
    } else {
      //  { "0": 12, "1": 34 }
      const values = Object.values(rawKey);
      secretKeyUint8 = Uint8Array.from(values);
    }
  } 
  else {
    throw new Error('Invalid secretKey structure during worker deserialization.');
  }

  return Keypair.fromSecretKey(secretKeyUint8);
}