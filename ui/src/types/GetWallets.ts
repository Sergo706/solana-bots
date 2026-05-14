import type { Keypair } from "@solana/web3.js";

export interface Wallet {
    id: number;
    created_at: number;
    publickey: string;
    balanceOfSOL: number;
}            

export interface GetWallets {
    main: Wallet,
    subs: Wallet[]
}

export interface WalletsWithSOL {
    wallet: Keypair;
    balance: number;
}