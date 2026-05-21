import { ipcMain, BrowserWindow, shell, app } from "electron";




export function setupWindowIpcApi(createWindow: () => void) {
     ipcMain.on('file:quit', () => { app.quit(); });
     ipcMain.on('window-min', (event) => { 
         const win = BrowserWindow.fromWebContents(event.sender);
         if (win) win.minimize(); 
     });
     ipcMain.on('window-close', (event) => { 
         const win = BrowserWindow.fromWebContents(event.sender);
         if (win) win.close(); 
     });
     ipcMain.on('window-max', (event) => {
         const win = BrowserWindow.fromWebContents(event.sender);
         if (win) {
            if (win.isMaximized()) {
              win.unmaximize();
             } else {
               win.maximize();
             }
         }
     });

          
     ipcMain.on('open-external', (_event, url: string) => {
       void shell.openExternal(url);
     });

     ipcMain.on('file:new-window', () => {
        createWindow(); 
    });

    ipcMain.on('view:reload', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) win.webContents.reload();
    });

    ipcMain.on('view:toggle-fullscreen', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) win.setFullScreen(!win.isFullScreen());
    });

    ipcMain.on('view:zoom-in', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) win.webContents.setZoomLevel(win.webContents.getZoomLevel() + 0.5);
    });

    ipcMain.on('view:zoom-out', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) win.webContents.setZoomLevel(win.webContents.getZoomLevel() - 0.5);
    });

    ipcMain.on('view:reset-zoom', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) win.webContents.setZoomLevel(0);
    });

    ipcMain.on('view:toggle-devtools', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) win.webContents.toggleDevTools();
    });
}