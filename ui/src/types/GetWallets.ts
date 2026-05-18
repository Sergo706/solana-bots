import type { Keypair, PublicKey } from "@solana/web3.js";
import type { Table } from '@tanstack/vue-table';


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

export interface GetRawWallets {
        mainKey: {
        decryptedPrivate: Uint8Array;
        pubkey: PublicKey;
        meta: {
            id: number;
            createAt: number;
        };
    };
    subKeys: {
        decryptedPrivate: Uint8Array;
        pubkey: PublicKey;
        meta: {
            id: number | undefined;
            createAt: number | undefined;
        };
    }[];
}

export interface WalletsManagementTable extends Wallet {
  openPositions: boolean;
}

export interface UTableRefWallet {
  tableApi: Table<WalletsManagementTable>
}