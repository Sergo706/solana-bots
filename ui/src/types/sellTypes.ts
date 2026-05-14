export interface Sell {
        ok: true,
        date: string,
        data: {
            positionsClosed: null | number,
            walletsCount: number,
            failedWallets: [{
                pubkey: string,
                reason: string
            }]
        }
}