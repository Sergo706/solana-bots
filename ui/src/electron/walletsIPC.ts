/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { getAllWalletsView, getByPubkey } from "@solana-bots/lib/reads";
import { ipcMain, safeStorage } from "electron";
import { getEligibleWallets } from "@solana-bots/utils/getWalletsWithSOL";
import { createWallet, storeMain } from "@solana-bots/lib/createWallet";
import { drainWalletsToMain } from "@solana-bots/lib/drainWallets";
import { distributeGas } from "@solana-bots/lib/split";

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
      const wallets = await getAllWalletsView(decryptedPassword);
      return { ok: true, date: new Date().toISOString(), data: wallets };
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

      const wallet = await getByPubkey(decryptedPassword, id);
      return { ok: true, date: new Date().toISOString(), data: wallet };
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

      const wallets = await getEligibleWallets(decryptedPassword, reqSol);
      return { ok: true, date: new Date().toISOString(), data: wallets };
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

      for (let i = 0; i < count; i++) {
        await createWallet(decryptedPassword);
      }

      return { ok: true, date: new Date().toISOString(), data: `Successfully created ${count} wallets` };
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

      await storeMain(decryptedPassword, path);
      return { ok: true, date: new Date().toISOString(), data: `Successfully stored main wallet!` };
    } catch {
      return { ok: false, date: new Date().toISOString(), reason: 'Invalid secret key format. Ensure it is a JSON array of numbers, a base58 string, base64, or hex. And that the path is valid' };
    }
  });
};


const drainWallets = (getVault: () => string | null) => {
  ipcMain.handle('drain:wallet', async (_event, fee: number) => {
    const vault = getVault();
    if (!vault) {
      return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
    }

    try {
      const decryptedPassword = safeStorage.decryptString(
        Buffer.from(vault, 'base64')
      );

      const drain = await drainWalletsToMain(decryptedPassword, fee);
      if (!drain.ok) {
            return {
                ok: true,
                date: new Date().toISOString(),
                reason: drain.reason ?? 'Error draining wallets'
            };
      }
      return { ok: true, date: new Date().toISOString(), data: `Successfully drained wallets to main wallet!` };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, date: new Date().toISOString(), reason: message };
    }
  });
};

const distributeSols = (getVault: () => string | null) => {
  ipcMain.handle('distribute:wallet', async (_event, amountPerWallet: number, fee: number) => {
    const vault = getVault();
    if (!vault) {
      return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
    }

    try {
      const decryptedPassword = safeStorage.decryptString(
        Buffer.from(vault, 'base64')
      );

      const distribute = await distributeGas(decryptedPassword, amountPerWallet, fee);

      return { ok: true, date: new Date().toISOString(), data: distribute.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, date: new Date().toISOString(), reason: message };
    }
  });
};

const actions = [
  getWalletsActions,
  getWalletByPubkeyAction,
  getWalletsBySolAction,
  createWalletsAction,
  storeMainWalletAction,
  drainWallets,
  distributeSols
];

export default actions;