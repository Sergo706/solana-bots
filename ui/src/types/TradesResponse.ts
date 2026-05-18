export interface BuyResponse {
    ok: boolean;
    date: string;
    data: {
        positionsOpened: number;
        walletsCount: number;
        failedWallets: {
            pubkey: string;
            reason: string;
        }[];
    };
}

export interface SellResponseOne {
    ok: boolean;
    date: string;
    data: {
        positionsClosed: number;
        walletsCount: number;
        failedWallets: {
            pubkey: string;
            reason: string;
        }[];
    };
}
export interface SellResponseTwo {
    ok: boolean
    date: string
    data: string
}

export type SellResponseMain = SellResponseOne | SellResponseTwo