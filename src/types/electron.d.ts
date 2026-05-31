// Shape of the API exposed by electron/preload.ts via contextBridge. Optional
// because the web build has no preload — guard reads with `if (window.electron)`.
export {};

declare global {
  interface Window {
    electron?: {
      platform: string;
      getAppVersion: () => Promise<string>;
    };
  }
}
