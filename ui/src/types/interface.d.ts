import type { Results } from "@riavzon/utils";
import type { GetWallets, Wallet, WalletsWithSOL } from '@/types/GetWallets';

export interface PasswordAPI {
  savePassword: (password: string) => Promise<Results<string>>
  saveRpcAndAPi: (api: string, rpc = 'https://api.mainnet.solana.com') => Promise<Results<string>>
}
export interface WalletsAPI {
    getWallets: () => Promise<GetWallets>,
    getWallet: (id: string) => Promise<Wallet>,
    getByRequiredSol: (minRequiredSol: number) => Promise<WalletsWithSOL>,
    createWallet: (count: number) => Promise<Results<string>>,
    storeMainWallet: (path: string) => Promise<Results<string>>,
    drainWalletsToMain: (fee = 5000) => Promise<Results<string>>,
    distributeFunds: (amount: number, fee = 5000) => Promise<Results<{
    sent: string;
    lastSignature: string;
}>>
}

declare global {
  interface Window {
    password: PasswordAPI
    walletsApi: WalletsAPI
  }
}
