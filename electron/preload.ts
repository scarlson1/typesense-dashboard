import { contextBridge, ipcRenderer } from 'electron';

// Minimal, read-only surface exposed to the renderer. With contextIsolation on,
// the renderer reads this via `window.electron` (see src/types/electron.d.ts).
const api = {
  platform: process.platform,
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:version'),
} as const;

export type ElectronApi = typeof api;

contextBridge.exposeInMainWorld('electron', api);
