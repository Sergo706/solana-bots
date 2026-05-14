/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { app, BrowserWindow, session, ipcMain, safeStorage } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { fileURLToPath } from 'node:url';
import walletActions from './walletsIPC';
import { rpcAndAPI } from '@solana-bots/utils/utils';
import tradingActions from './tradingIPC';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let vault: string | null = null;

if (started) {
  vault = null;
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        "default-src 'self' 'unsafe-inline' data:; " +
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:5173; " +
        "connect-src 'self' https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com ws://localhost:5173 http://localhost:5173;"
      ]
    }
  });
});

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};
app.disableHardwareAcceleration();

void app.whenReady().then(() => { 
  createWindow();

  ipcMain.handle('save-password', (_event, password: string) => {
      if (!safeStorage.isEncryptionAvailable()) {
         return { ok: false, date: new Date().toISOString(), reason: 'OS_NOT_SUPPORTED' };
      }
      try {
        const encrypted = safeStorage.encryptString(password);
        vault = encrypted.toString('base64'); 

        return {
            ok: true, date: new Date().toISOString(), data: 'Password saved' 
        };

      } catch {
        return { ok: false, date: new Date().toISOString(), reason: 'ENCRYPTION_FAILED' };
     }
});

  ipcMain.handle('api:rpc:save', async (_event, api: string, rpc: string) => {
    if (!vault) {
      return { ok: false, date: new Date().toISOString(), reason: 'UNAUTHORIZED' };
    }

    try {
      const decryptedPassword = safeStorage.decryptString(
        Buffer.from(vault, 'base64')
      );

      const save = await rpcAndAPI(api, rpc, decryptedPassword);
      return save;
      
      } catch {
        return { ok: false, date: new Date().toISOString(), reason: 'Error saving rpc or jupiter api key' };
     }
});

    walletActions.forEach((action) => { action(() => vault); });
    tradingActions.forEach((action) => { action(() => vault); });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    vault = null;
    app.quit();
  }
});