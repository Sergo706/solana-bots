import type { VolumeBotEvent } from '@/types/VolumeBots';
import type { Results } from '@riavzon/utils';
import { ipcMain, safeStorage, BrowserWindow, utilityProcess, app } from 'electron';
import path from 'node:path';
import readline from 'node:readline';
import fs from 'node:fs';
let workerThread: ReturnType<typeof utilityProcess.fork> | null = null;

export function setupVolumeBotBridge(mainWindow: BrowserWindow, getVault: () => string | null) {
  
 // eslint-disable-next-line @typescript-eslint/require-await
 ipcMain.handle('trade:volume-bot', async (_event, targetMintAddress: string, maxSolPerWallet: number, numberOfWallets: number, interval?: number, shouldMassOut = true, ttl?: number): Promise<Results> => {
    const vault = getVault();
    if (!vault) return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED'};

    if (workerThread) {
        workerThread.kill();
        workerThread = null;
    }

    try {
       const decryptedPassword = safeStorage.decryptString(
            Buffer.from(vault, 'base64')
        );  
      const currentDir = import.meta.dirname;
      const cliScriptPath = app.isPackaged ? path.join(process.resourcesPath, 'app.asar', 'dist-worker', 'worker.mjs') : 
        path.join(currentDir, '..', '..', 'dist-worker', 'worker.mjs');

      if (!fs.existsSync(cliScriptPath)) {
        return { ok: false, date: new Date().toISOString(), reason: `Worker file missing at: ${cliScriptPath}` };
      }  

      workerThread = utilityProcess.fork(cliScriptPath, [], {
        env: {
          ...process.env,
          SOLANA_BOTS_INTERNAL: 'volume-worker',
          TARGET_MINT: targetMintAddress,
          AMOUNT: String(maxSolPerWallet),
          WALLETS: String(numberOfWallets),
          PASSWORD: decryptedPassword,
          INTERVAL: String(interval ?? 0),
          MASS_OUT: String(shouldMassOut),
          TTL: ttl ? String(ttl) : ""
        },
        stdio: 'pipe'
      });
      
      if (workerThread.stdout) {
        const stdoutReader = readline.createInterface({ input: workerThread.stdout });
        
        stdoutReader.on('line', (line) => {
          const cleanLine = line.trim();
          if (!cleanLine) return;

          if (cleanLine.startsWith('__BOT_METRIC__:')) {
            try {
              const event = JSON.parse(cleanLine.replace('__BOT_METRIC__:', '')) as VolumeBotEvent;
              switch (event.type) {
                case 'stats':
                  mainWindow.webContents.send('volume-bot:stats', event.payload);
                  break;
                case 'log':
                  mainWindow.webContents.send('volume-bot:log', event.payload);
                  break;
                case 'activity':
                  mainWindow.webContents.send('volume-bot:activity', event.payload);
                  break;
                case 'ready':
                  mainWindow.webContents.send('volume-bot:ready', event.payload);
                  break;
                case 'status':
                  mainWindow.webContents.send('volume-bot:status', event.payload);
                  break;
              }
            } catch (err) {
              console.error('Failed to parse bot metric line:', err);
              return { 
                 ok: false,
                 date: new Date().toISOString(),
                 reason: err instanceof Error ? err.message : String(err) 
            };

            }
          } else {
            mainWindow.webContents.send('volume-bot:raw-console', cleanLine);
          }
        });
      }

      
      workerThread.on('exit', () => {
        mainWindow.webContents.send('volume-bot:status', { status: 'stopped', stoppedAt: Date.now() });
        workerThread = null;
      });

      return { ok: true, date: new Date().toISOString(), data: 'SUCCESS'};
    } catch (err) {
      return { 
        ok: false,
        date: new Date().toISOString(),
        reason: err instanceof Error ? err.message : String(err) 
    };
    }
  });

  // eslint-disable-next-line @typescript-eslint/require-await
  ipcMain.handle('trade:volume-bot:stop', async (): Promise<Results> => {
    if (workerThread) {
      const kill = workerThread.kill(); 
      workerThread = null;
      if (kill) {
        return { 
          ok: true,
          date: new Date().toISOString(),
          data: 'Successfully stopped volume bot' 
        };
      } else {
        return {
          ok: false,
          date: new Date().toISOString(),
          reason: 'Error stopping the volume bot'
        };
      }
    }
    return { 
        ok: false, 
        date: new Date().toISOString(),
        reason: 'NOT_RUNNING' 
    };
  });
}