import type { SerializedWallet } from '@/types/positons';
import type { Activity, LogEntry, Stats, Status } from '@/types/VolumeBots';
import { contextBridge, ipcRenderer } from 'electron';


contextBridge.exposeInMainWorld('password', {
    savePassword: (password: string) => ipcRenderer.invoke('save-password', password),
    saveRpcAndAPi: (api: string, rpc = 'https://api.mainnet.solana.com') => ipcRenderer.invoke('api:rpc:save', api, rpc),
    checkStartStatus: () => ipcRenderer.invoke('start'),
    checkPasswordStatus: () => ipcRenderer.invoke('password-status'),
});


contextBridge.exposeInMainWorld('walletsApi', {
    getWallets: () => ipcRenderer.invoke('get:wallets:all'),
    getWallet: (id: string) => ipcRenderer.invoke('get:wallets:one', id),
    getWalletsManagementView: () => ipcRenderer.invoke('get:wallets:management'),
    getAllRawWallets: () => ipcRenderer.invoke('get:all:raw:wallets'),
    getByRequiredSol: (minRequiredSol: number) => ipcRenderer.invoke('get:wallets:bySol', minRequiredSol),
    createWallet: (count: number) => ipcRenderer.invoke('create:wallet', count),
    storeMainWallet: (path: string) => ipcRenderer.invoke('store:main:wallet', path),
    updateMainWallet: (newPrivateKeyWallet: string) => ipcRenderer.invoke('update:new:wallet', newPrivateKeyWallet),
    drainWalletsToMain: (targetedWallets?: { publicAddress: string; id: number; }[], fee = 5000) => ipcRenderer.invoke('drain:wallet', targetedWallets, fee),
    distributeFunds: (amount: number, targetedWallets?: { publicAddress: string | null }[], fee = 5000) => ipcRenderer.invoke('distribute:wallet', amount, targetedWallets, fee)
});



contextBridge.exposeInMainWorld('tradesApi', {
sell: (targetMintAddress: string, numberOfWallets: number, sellPercentage = 0, chunksToProcess = 1, chosenWallets?: SerializedWallet[], targetedPositionsToSell?: number[]) => 
        ipcRenderer.invoke('trade:sell', targetMintAddress, numberOfWallets, sellPercentage, chunksToProcess, chosenWallets, targetedPositionsToSell),
buy: (targetMintAddress: string, solAmountsPerWallet: number, numberOfWallets: number, chunksToProcess = 2, chosenWallets?: SerializedWallet[]) => 
        ipcRenderer.invoke('trade:buy', targetMintAddress, solAmountsPerWallet, numberOfWallets, chunksToProcess, chosenWallets),
out: () =>  ipcRenderer.invoke('trade:out'),

volumeBot: (targetMintAddress: string, maxSolPerWallet: number, numberOfWallets: number, interval?: number, shouldMassOut = true, ttl?: number) => 
            ipcRenderer.invoke('trade:volume-bot', targetMintAddress, maxSolPerWallet, numberOfWallets, interval, shouldMassOut, ttl),
volumeBotStop: () => ipcRenderer.invoke(`trade:volume-bot:stop`),
volumeBotStatus: () => ipcRenderer.invoke(`trade:volume-bot:status`),


onRawConsoleUpdate: (cb: (text: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, value: string) => { cb(value); };
    ipcRenderer.on('volume-bot:raw-console', listener);
    return () => ipcRenderer.removeListener('volume-bot:raw-console', listener);
},

 onVolumeBotLog: (cb: (log: LogEntry) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, log: LogEntry) => { cb(log); };
    ipcRenderer.on('volume-bot:log', listener);
    return () => ipcRenderer.removeListener('volume-bot:log', listener);
  },

  onVolumeBotStats: (cb: (stats: Stats) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, stats: Stats) => { cb(stats); };
    ipcRenderer.on('volume-bot:stats', listener);
    return () => ipcRenderer.removeListener('volume-bot:stats', listener);
  },

  onVolumeBotActivity: (cb: (activity: Activity) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, activity: Activity) => { cb(activity); };
    ipcRenderer.on('volume-bot:activity', listener);
    return () => ipcRenderer.removeListener('volume-bot:activity', listener);
  },

  onVolumeBotStatus: (cb: (status: Status) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, status: Status) => { cb(status); };
    ipcRenderer.on('volume-bot:status', listener);
    return () => ipcRenderer.removeListener('volume-bot:status', listener);
  },

  onVolumeBotReady: (cb: (payload: { pid: number }) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: { pid: number }) => { cb(payload); };
    ipcRenderer.on('volume-bot:ready', listener);
    return () => ipcRenderer.removeListener('volume-bot:ready', listener);
  },

    getPositions: () => ipcRenderer.invoke('get:positions'),
    getPositionsView: () => ipcRenderer.invoke('get:trading:terminal:view'),
});


// ai

// rug assessment

