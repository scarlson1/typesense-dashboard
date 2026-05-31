import { app, BrowserWindow, ipcMain, session, shell } from 'electron';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// In development electron-vite serves the renderer and exposes its URL here.
// In production this is undefined and we load the built index.html from disk.
const RENDERER_DEV_URL = process.env['ELECTRON_RENDERER_URL'];

/**
 * Inject permissive CORS headers on every HTTP(S) response so the Typesense JS
 * client (renderer fetch/XHR) can talk directly to any user-supplied Typesense
 * host — local or plain-HTTP — without the server running with `--enable-cors`
 * and without TLS. This is the desktop payoff over the browser build, which is
 * blocked by mixed-content / CORS (see README "Web" section). `webSecurity`
 * stays enabled for everything else.
 */
const relaxTypesenseCors = (): void => {
  session.defaultSession.webRequest.onHeadersReceived(
    { urls: ['http://*/*', 'https://*/*'] },
    (details, callback) => {
      const responseHeaders = {
        ...details.responseHeaders,
        'access-control-allow-origin': ['*'],
        'access-control-allow-methods': [
          'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        ],
        'access-control-allow-headers': ['*'],
      };

      // CORS preflight must resolve 2xx. A Typesense started without
      // `--enable-cors` answers OPTIONS with a non-2xx, which would fail the
      // preflight even with the headers above, so normalize the status here.
      if (details.method === 'OPTIONS') {
        callback({ responseHeaders, statusLine: 'HTTP/1.1 200 OK' });
        return;
      }

      callback({ responseHeaders });
    },
  );
};

const createWindow = (): void => {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      // The preload is shipped as ESM (package.json "type": "module"); ESM
      // preload scripts require the sandbox to be off. Isolation + no node
      // integration still keep the renderer locked down.
      sandbox: false,
    },
  });

  win.once('ready-to-show', () => win.show());

  // Open target=_blank / window.open links in the user's browser, never a
  // new Electron window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  if (RENDERER_DEV_URL) {
    void win.loadURL(RENDERER_DEV_URL);
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'));
  }
};

void app.whenReady().then(() => {
  relaxTypesenseCors();

  ipcMain.handle('app:version', () => app.getVersion());

  createWindow();

  app.on('activate', () => {
    // macOS: re-create a window when the dock icon is clicked and none are open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Quit on Windows/Linux; macOS apps stay alive until Cmd+Q.
  if (process.platform !== 'darwin') app.quit();
});
