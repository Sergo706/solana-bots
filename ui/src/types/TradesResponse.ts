export interface BuyResponse {
        positionsOpened: number;
        walletsCount: number;
        failedWallets: {
            pubkey: string;
            reason: string;
        }[];
        walletsSpent: {
            pubkey: string;
            spent: number;
            received: number;
        }[];
}

export interface SellResponseOne {
        positionsClosed: number;
        walletsCount: number;
        failedWallets: {
            pubkey: string;
            reason: string;
        }[];
         walletsSpent: {
            pubkey: string;
            spent: number;
            received: number;
        }[];
}



export type SellResponseMain = SellResponseOne