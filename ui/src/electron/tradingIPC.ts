import { ipcMain, safeStorage } from "electron";
import { massBuy } from "@solana-bots/lib/transactions/massBuy";
import { massOutForAllWallets } from "@solana-bots/lib/transactions/massOut";
import { massSell } from "@solana-bots/lib/transactions/massSell";
import { volumeStart } from "@solana-bots/lib/transactions/volumeBot/volumeStart";
import { runCommand } from "citty";
import { volumeStop } from "@solana-bots/lib/transactions/volumeBot/volumeStop";
import { volumeStatus } from "@solana-bots/lib/transactions/volumeBot/volumeStatus";

const sell = (getVault: () => string | null) => { 
      ipcMain.handle('trade:sell', async (_event, targetMintAddress: string, numberOfWallets: number, sellPercentage: number, chunksToProcess: number) => {
        const vault = getVault();
        if (!vault) {
          return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
        }
        try {
          const decryptedPassword = safeStorage.decryptString(
            Buffer.from(vault, 'base64')
          );
          const sell = await massSell(targetMintAddress, numberOfWallets, decryptedPassword, sellPercentage, chunksToProcess);
          return { ok: true, date: new Date().toISOString(), data: sell };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { ok: false, date: new Date().toISOString(), reason: message };
        }
      });
    };

const buy = (getVault: () => string | null) => { 
      ipcMain.handle('trade:buy', async (_event, targetMintAddress: string, solAmountsPerWallet: number, numberOfWallets: number, chunksToProcess: number) => {
        const vault = getVault();
        if (!vault) {
          return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
        }
        try {
          const decryptedPassword = safeStorage.decryptString(
            Buffer.from(vault, 'base64')
          );
          const sell = await massBuy(targetMintAddress, solAmountsPerWallet, numberOfWallets, decryptedPassword, chunksToProcess);
          return { ok: true, date: new Date().toISOString(), data: sell };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { ok: false, date: new Date().toISOString(), reason: message };
        }
      });
    };

const out = (getVault: () => string | null) => { 
      ipcMain.handle('trade:out', async () => {
        const vault = getVault();
        if (!vault) {
          return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
        }
        try {
          const decryptedPassword = safeStorage.decryptString(
            Buffer.from(vault, 'base64')
          );
          const out = await massOutForAllWallets(decryptedPassword);
          return { ok: true, date: new Date().toISOString(), data: out };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { ok: false, date: new Date().toISOString(), reason: message };
        }
      });
    };

 const volumeBots = (getVault: () => string | null) => {
    ipcMain.handle('trade:volume-bot', async (_event, targetMintAddress: string, maxSolPerWallet: number, numberOfWallets: number, ttl?: number) => {
        const vault = getVault();

        if (!vault) return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED'};
        try {
            const decryptedPassword = safeStorage.decryptString(
                Buffer.from(vault, 'base64')
            );  

            const run = await runCommand(volumeStart, {
              rawArgs: [
                `--target=${targetMintAddress}`,
                `--wallets=${String(numberOfWallets)}`,
                `--amount=${String(maxSolPerWallet)}`,
                `--password=${decryptedPassword}`,
                ...(typeof ttl !== 'undefined' ? [`--ttl=${String(ttl)}`] : []),
              ],
            });

            return { ok: true, date: new Date().toISOString(), data: run.result };

        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
          return { ok: false, date: new Date().toISOString(), reason: message };
        }
    });
 };

  const volumeBotsStop = (getVault: () => string | null) => {
    ipcMain.handle('trade:volume-bot:stop', async () => {
        const vault = getVault();
        if (!vault) return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED'};

        try {

            const run = await runCommand(volumeStop, {
                rawArgs: []
            });

            return { ok: true, date: new Date().toISOString(), data: run.result ?? 'Stopped' };

        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
          return { ok: false, date: new Date().toISOString(), reason: message };
        }
    });
 };

const volumeBotsStatus = (getVault: () => string | null) => {
    ipcMain.handle('trade:volume-bot:status', async () => {
        const vault = getVault();
        if (!vault) return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED'};

        try {

            const run = await runCommand(volumeStatus, {
                rawArgs: []
            });

            return { ok: true, date: new Date().toISOString(), data: run.result };

        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
          return { ok: false, date: new Date().toISOString(), reason: message };
        }
    });
 };

 const actions = [
    sell,
    buy,
    out,
    volumeBots,
    volumeBotsStatus,
    volumeBotsStop
 ];

export default actions;