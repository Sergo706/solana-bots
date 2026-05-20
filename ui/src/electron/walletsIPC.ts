/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { ipcMain, safeStorage } from "electron";
import type { GetWallets, WalletsManagementTable } from "@/types/GetWallets";
import { routeOps } from "./utils/spawnOpWorker";

const getWalletsActions = (getVault: () => string | null) => {
  ipcMain.handle('get:wallets:all', async () => {
    const vault = getVault();
    if (!vault) {
      return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
    }
    try {
      const decryptedPassword = safeStorage.decryptString(
        Buffer.from(vault, 'base64')
      );

      const wallets = await routeOps<GetWallets>('get:wallets:all', decryptedPassword);
      return wallets;
    } catch (err) {
      console.error('IPC Handler Caught Error:', err);
      return { ok: false, date: new Date().toISOString(), reason: 'Error getting wallets. Check your password or contact support.' };
    }
  });
};

const getWalletsManagementViewPC = (getVault: () => string | null) => {
  ipcMain.handle('get:wallets:management', async () => {
    const vault = getVault();
    if (!vault) {
      return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
    }
    try {
      const decryptedPassword = safeStorage.decryptString(
        Buffer.from(vault, 'base64')
      );

      const wallets = await routeOps<WalletsManagementTable[]>('get:wallets:management', decryptedPassword);
      return wallets;
    } catch {
      return { ok: false, date: new Date().toISOString(), reason: 'Error getting wallets. Check your password or contact support.' };
    }
  });
};

const getWalletByPubkeyAction = (getVault: () => string | null) => {
  ipcMain.handle('get:wallets:one', async (_event, id: string) => {
    const vault = getVault();
    if (!vault) {
      return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
    }
    try {
      const decryptedPassword = safeStorage.decryptString(
        Buffer.from(vault, 'base64')
      );

      const wallet = await routeOps('get:wallets:one', decryptedPassword, [id]);
      return wallet;
    } catch {
      return { ok: false, date: new Date().toISOString(), reason: 'Error getting wallet. Check your password or contact support.' };
    }
  });
};

const getWalletsBySolAction = (getVault: () => string | null) => {
  ipcMain.handle('get:wallets:bySol', async (_event, reqSol: number) => {
    const vault = getVault();
    if (!vault) {
      return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
    }
    try {
      const decryptedPassword = safeStorage.decryptString(
        Buffer.from(vault, 'base64')
      );

      const wallets = await routeOps('get:wallets:bySol', decryptedPassword, [reqSol]);
      return wallets;
    } catch {
      return { ok: false, date: new Date().toISOString(), reason: 'Error getting wallets. No wallets with this amount of SOL' };
    }
  });
};

const createWalletsAction = (getVault: () => string | null) => {
  ipcMain.handle('create:wallet', async (_event, count: number) => {
    const vault = getVault();
    if (!vault) {
      return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
    }
    try {
      const decryptedPassword = safeStorage.decryptString(
        Buffer.from(vault, 'base64')
      );

      const res = await routeOps<string>('create:wallet', decryptedPassword, [count]);
      return res;
    } catch {
      return { ok: false, date: new Date().toISOString(), reason: 'Error creating wallets.' };
    }
  });
};

const storeMainWalletAction = (getVault: () => string | null) => {
  ipcMain.handle('store:main:wallet', async (_event, path: string) => {
    const vault = getVault();
    if (!vault) {
      return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
    }
    try {
      const decryptedPassword = safeStorage.decryptString(
        Buffer.from(vault, 'base64')
      );

      const res = await routeOps<string>('store:main:wallet', decryptedPassword, [path]);
      return res;
    } catch {
      return { ok: false, date: new Date().toISOString(), reason: 'Invalid secret key format. Ensure it is a JSON array of numbers, a base58 string, base64, or hex. And that the path is valid' };
    }
  });
};

const updateMainWalletAction = (getVault: () => string | null) => {
  ipcMain.handle('update:new:wallet', async (_event, newPrivateKeyWallet: string) => {
    const vault = getVault();
    if (!vault) {
      return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
    }
    try {
      const decryptedPassword = safeStorage.decryptString(
        Buffer.from(vault, 'base64')
      );

      const res = await routeOps<string>('update:new:wallet', decryptedPassword, [newPrivateKeyWallet]);
      return res;
    } catch {
      return { ok: false, date: new Date().toISOString(), reason: 'Error updating new main wallet.' };
    }
  });
};

const drainWallets = (getVault: () => string | null) => {
  ipcMain.handle('drain:wallet', async (
    _event, 
    targetedWallets?: { publicAddress: string; id: number; }[],
    fee?: number
  ) => {
    const vault = getVault();
    if (!vault) {
      return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
    }
    try {
      const decryptedPassword = safeStorage.decryptString(
        Buffer.from(vault, 'base64')
      );

      const drain = await routeOps('drain:wallet', decryptedPassword, [targetedWallets, fee]);
      return drain;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, date: new Date().toISOString(), reason: message };
    }
  });
};

const distributeSols = (getVault: () => string | null) => {
  ipcMain.handle('distribute:wallet', async (
    _event, 
    amountPerWallet: number, 
    targetedWallets?: { publicAddress: string | null }[],
    fee?: number
  ) => {
    const vault = getVault();
    if (!vault) {
      return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
    }
    try {
      const decryptedPassword = safeStorage.decryptString(
        Buffer.from(vault, 'base64')
      );

      const distribute = await routeOps('distribute:wallet', decryptedPassword, [amountPerWallet, targetedWallets, fee]);
      return distribute;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, date: new Date().toISOString(), reason: message };
    }
  });
};

const getAllRawWallets = (getVault: () => string | null) => {
  ipcMain.handle('get:all:raw:wallets', async () => {
    const vault = getVault();
    if (!vault) {
      return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
    }
    try {
      const decryptedPassword = safeStorage.decryptString(
        Buffer.from(vault, 'base64')
      );

      const data = await routeOps('get:all:raw:wallets', decryptedPassword);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, date: new Date().toISOString(), reason: message };
    }
  });
};

const actions = [
  getWalletsActions,
  getWalletByPubkeyAction,
  getWalletsManagementViewPC,
  getWalletsBySolAction,
  createWalletsAction,
  storeMainWalletAction,
  updateMainWalletAction,
  drainWallets,
  distributeSols,
  getAllRawWallets
];

export default actions;