
export const minimize = () => { window.electronWindowApi.minimize(); };
export const maximize = () => { window.electronWindowApi.maximize(); };
export const close = () => { window.electronWindowApi.close(); };
export const quit = () => {window.electronWindowApi.quitApp();};
export const toggleFullScreen = () => { window.electronWindowApi.toggleFullScreen(); };
export const newWindow = () => {window.electronWindowApi.newWindow();};
export const reload = () => {window.electronWindowApi.reload();};
export const zoomIn = () => {window.electronWindowApi.zoomIn();};
export const zoomOut = () => {window.electronWindowApi.zoomOut();};
export const resetZoom = () => {window.electronWindowApi.resetZoom();};
export const toggleDevTools = () => { window.electronWindowApi.toggleDevTools(); };
export const goToAbout = () => { window.electronWindowApi.openWebsite('https://riavzon.com'); };




export const logo = new URL('../assets/public/solana-bots.webp', import.meta.url).href;
