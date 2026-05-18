export interface Positions {
    id: number;
    walletAddress: string;
    targetMintAddress: string;
    solAmounts: bigint | null
    tokenAmount: bigint | null;
    walletRemainingBalance: bigint | null
    updatedAt: Date | null
}


export interface SerializedWallet {
  publicKey: string
  secretKey: Uint8Array
}