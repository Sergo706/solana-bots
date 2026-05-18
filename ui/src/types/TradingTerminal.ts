import type { Wallet } from "./GetWallets";
import type { Positions } from "./positons";
import type { Table } from '@tanstack/vue-table';

export interface Agg {
  ok: boolean;
  positionsClosed: number;
  walletsCount: number;
  failedWallets: { pubkey: string; reason: string }[];
  messages: string[];
}

export interface TradingTerminalData {
    id: number;
    mint: string;
    walletsIn: number;
    totalSolIn: number | bigint;
    wallets: Wallet[]
    positionOpenedAt: Date; // get all wallets  to sell of this specific wallets in this specific position. 
}

export interface ManageTrades { // make sell of this specific wallet or this specific position
    positions: Positions[]
}

export interface UTableRef {
  tableApi: Table<TradingTerminalData>
}

export interface UTableRefPosition {
  tableApi: Table<Positions>
}
// A mass sell/out/buy of a mint
// A targeted sell/out/buy with a specific set of wallets.
