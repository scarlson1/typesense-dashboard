import { useEffect, useState } from 'react';
import { toast, type ToastOptions } from 'react-hot-toast';

type CopiedValue = string | null;
type CopyFn = (
  text: string | any,
  withToast?: boolean,
  toastOptions?: ToastOptions,
) => Promise<boolean>; // Return success

export const useCopyToClipboard = (
  isCopiedTimer: number = 2000,
): [CopiedValue, CopyFn, boolean] => {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timer = setTimeout(() => setIsCopied(false), isCopiedTimer);
    return () => clearTimeout(timer);
  }, [isCopied, isCopiedTimer]);

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
      setIsCopied(true);

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
      // if (!!withToast) toast.error() enable ??
      return false;
    }
  };

  return [copiedText, copy, isCopied];
};
