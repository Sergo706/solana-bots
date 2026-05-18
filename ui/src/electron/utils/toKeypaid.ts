import type { SerializedWallet } from '@/types/positons';
import {  Keypair } from '@solana/web3.js';

export function toKeyPair(wallet: SerializedWallet): Keypair {
  return Keypair.fromSecretKey(
    wallet.secretKey instanceof Uint8Array
      ? wallet.secretKey
      : Uint8Array.from(wallet.secretKey)
  );
}