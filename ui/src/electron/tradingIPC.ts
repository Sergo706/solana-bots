import { ipcMain, safeStorage } from "electron";
import type { SerializedWallet } from "@/types/positons";
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { Results } from "@riavzon/utils";
import type { Stats } from "@/types/VolumeBots";
import { routeOps } from "./utils/spawnOpWorker";

const dataDir =
  process.platform === "win32"
    ? path.join(process.env["APPDATA"] ?? path.join(os.homedir(), 'AppData', 'Roaming'), "SolanaBot")
    : path.join(os.homedir(), ".solana-bot");

const sell = (getVault: () => string | null) => { 
      ipcMain.handle('trade:sell', async (_event, targetMintAddress: string, numberOfWallets: number, sellPercentage: number, chunksToProcess: number, chosenWallets?: SerializedWallet[], targetedPositionsToSell?: number[]) => {
        const vault = getVault();
        if (!vault) {
          return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
        } 
        try {
          const decryptedPassword = safeStorage.decryptString(
            Buffer.from(vault, 'base64')
          );

          const res = await routeOps('trade:sell', decryptedPassword, [targetMintAddress, numberOfWallets, sellPercentage, chunksToProcess, chosenWallets, targetedPositionsToSell]);
          
          return res;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { ok: false, date: new Date().toISOString(), reason: message };
        }
      });
    };

const buy = (getVault: () => string | null) => { 
      ipcMain.handle('trade:buy', async (_event, targetMintAddress: string, solAmountsPerWallet: number, numberOfWallets: number, chunksToProcess: number, chosenWallets?: SerializedWallet[]) => {
        const vault = getVault();
        if (!vault) {
          return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
        }
        try {
          const decryptedPassword = safeStorage.decryptString(
            Buffer.from(vault, 'base64')
          );

          const res = await routeOps('trade:buy', decryptedPassword, [targetMintAddress, solAmountsPerWallet, numberOfWallets, chunksToProcess, chosenWallets]);
          
          return res;
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

          const res = await routeOps('trade:out', decryptedPassword);

          return res;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { ok: false, date: new Date().toISOString(), reason: message };
        }
      });
    };


export const volumeBotsStatus = (getVault: () => string | null) => {
  const STATS_FILE_UI = path.join(dataDir, "volumeBot.ui.json");
    ipcMain.handle('trade:volume-bot:status', async (): Promise<Results<Stats>> => {
        const vault = getVault();
        if (!vault) return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };

        try {
            try {
                await fs.access(STATS_FILE_UI);
            } catch {
                return { 
                    ok: true, 
                    date: new Date().toISOString(), 
                    data: {
                        cycleRuns: 0,
                        totalBuys: 0,
                        totalSells: 0,
                        errors: 0,
                        status: 'stopped',
                        target: '',
                        currentAction: 'idle',
                        pl: 0,
                        lastRun: new Date().toISOString()
                    } 
                };
            }

            const fileContent = await fs.readFile(STATS_FILE_UI, 'utf-8');
            const uiStats = JSON.parse(fileContent) as Stats;

            return { 
                ok: true, 
                date: new Date().toISOString(), 
                data: uiStats 
            };

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
    volumeBotsStatus
 ];

export default actions;