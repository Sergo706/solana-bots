import type { Results } from "@riavzon/utils";
import type { GetRawWallets, GetWallets, Wallet, WalletsWithSOL } from '@/types/GetWallets';
import type { BuyResponse, SellResponseMain } from "./TradesResponse";
import type { SerializedWallet } from "./positons";

export interface PasswordAPI {
  savePassword: (password: string) => Promise<Results<string>>
  saveRpcAndAPi: (api: string, rpc = 'https://api.mainnet.solana.com') => Promise<Results<string>>
  checkStartStatus: () => Promise<Results<"SUCCESS">>
  checkPasswordStatus: () => Promise<boolean>;
}


export interface WalletsAPI {
    getWallets: () => Promise<Results<GetWallets>>,
    getWallet: (id: string) => Promise<Results<Wallet>>,
    getWalletsManagementView: () => Promise<Results<WalletsManagementTable[]>>,
    getAllRawWallets: () => Promise<Results<GetRawWallets>>
    getByRequiredSol: (minRequiredSol: number) => Promise<Results<WalletsWithSOL>>,
    createWallet: (count: number) => Promise<Results<string>>,
    storeMainWallet: (path: string) => Promise<Results<string>>,
    updateMainWallet: (newPrivateKeyWallet: string) => Promise<Results<string>>,
    drainWalletsToMain: (targetedWallets?: { publicAddress: string; id: number; }[], fee = 5000) => Promise<Results<string>>,
    distributeFunds: (amount: number, targetedWallets?: { publicAddress: string | null }[], fee = 5000) => Promise<Results<{
    sent: string;
    lastSignature: string;
}>>
}

export interface TradingAPI {
sell: (targetMintAddress: string, numberOfWallets: number, sellPercentage = 0, chunksToProcess = 1, chosenWallets?: SerializedWallet[], targetedPositionsToSell?: number[]) => Promise<Results<SellResponseMain>>
buy: (targetMintAddress: string, solAmountsPerWallet: number, numberOfWallets: number, chunksToProcess = 1, chosenWallets?: SerializedWallet[]) => Promise<Results<BuyResponse>>

out: () => Promise<Results<SellResponseMain>>
volumeBot: (targetMintAddress: string, maxSolPerWallet: number, numberOfWallets: number, ttl?: number) => Promise<Results>
volumeBotStop: () => Promise<Results<string>>
volumeBotStatus: () =>Promise<Results>
getPositions: () => Promise<Results<Positions[]>>    
getPositionsView: () => Promise<Results<TradingTerminalData[]>>
}

declare global {
  interface Window {
    password: PasswordAPI
    tradesApi: TradingAPI
    walletsApi: WalletsAPI
  }
}
