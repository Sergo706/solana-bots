import { contextBridge, ipcRenderer } from 'electron';


contextBridge.exposeInMainWorld('password', {
    savePassword: (password: string) => ipcRenderer.invoke('save-password', password),
    saveRpcAndAPi: (api: string, rpc = 'https://api.mainnet.solana.com') => ipcRenderer.invoke('api:rpc:save', api, rpc)
});


contextBridge.exposeInMainWorld('walletsApi', {
    getWallets: () => ipcRenderer.invoke('get:wallets:all'),
    getWallet: (id: string) => ipcRenderer.invoke('get:wallets:one', id),
    getByRequiredSol: (minRequiredSol: number) => ipcRenderer.invoke('get:wallets:bySol', minRequiredSol),
    createWallet: (count: number) => ipcRenderer.invoke('create:wallet', count),
    storeMainWallet: (path: string) => ipcRenderer.invoke('store:main:wallet', path),
    drainWalletsToMain: (fee = 5000) => ipcRenderer.invoke('drain:wallet', fee),
    distributeFunds: (amount: number, fee = 5000) => ipcRenderer.invoke('distribute:wallet', amount, fee)
});



contextBridge.exposeInMainWorld('tradesApi', {
sell: (targetMintAddress: string, numberOfWallets: number, sellPercentage = 0, chunksToProcess = 1) => 
        ipcRenderer.invoke('trade:sell', targetMintAddress, numberOfWallets, sellPercentage, chunksToProcess),
buy: (targetMintAddress: string, solAmountsPerWallet: number, numberOfWallets: number, chunksToProcess = 2) => 
        ipcRenderer.invoke('trade:buy', targetMintAddress, solAmountsPerWallet, numberOfWallets, chunksToProcess),
out: () =>  ipcRenderer.invoke('trade:out'),

volumeBot: (targetMintAddress: string, maxSolPerWallet: number, numberOfWallets: number, ttl?: number) => 
            ipcRenderer.invoke('trade:volume-bot', targetMintAddress, maxSolPerWallet, numberOfWallets, ttl),
volumeBotStop: () => ipcRenderer.invoke(`trade:volume-bot:stop`),
volumeBotStatus: () => ipcRenderer.invoke(`trade:volume-bot:status`)
});


// ai

// rug assessment

