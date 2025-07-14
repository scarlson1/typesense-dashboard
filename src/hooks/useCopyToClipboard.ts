import { useState } from 'react';
import { toast, type ToastOptions } from 'react-hot-toast';

type CopiedValue = string | null;
type CopyFn = (
  text: string | any,
  withToast?: boolean,
  toastOptions?: ToastOptions
) => Promise<boolean>; // Return success

export const useCopyToClipboard = (): [CopiedValue, CopyFn] => {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy: CopyFn = async (text, withToast, toastOptions) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }
    if (!text) return false;

    // Try to save to clipboard then save it in the state if worked
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);

      if (!!withToast)
        toast.success('copied to clipboard', {
          duration: 2000,
          position: 'bottom-center',
          ...toastOptions,
        });
      return true;
    } catch (error) {
      console.warn('Copy failed', error);
      setCopiedText(null);
      return false;
    }
  };

  return [copiedText, copy];
};
