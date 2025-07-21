export * from './diffArrayOfObjects';
export * from './getObjectDiff';
export * from './queryClient';
export * from './typesenseStore';

export function splitIfString(val?: string | string[]) {
  if (!val) return [];
  return typeof val === 'string' ? val.split(',') : val;
}

export function getArrayVal(val: string | string[]) {
  return Array.isArray(val) ? val : [val];
}

export function uniqueArr(originalArray: string[]) {
  return [...new Set(originalArray)];
}

export function formatBytes(bytes: number) {
  if (bytes === 0) {
    return '0.00 B';
  }

  let e = Math.floor(Math.log(bytes) / Math.log(1024));
  return (
    (bytes / Math.pow(1024, e)).toFixed(2) + ' ' + ' KMGTP'.charAt(e) + 'B'
  );
}

export function removeStartEndMatches(str: string, matchStr: string) {
  let result = str;

  // Remove from the beginning
  if (result.startsWith(matchStr)) {
    result = result.slice(matchStr.length);
  }

  // Remove from the end
  if (result.endsWith(matchStr)) {
    result = result.slice(0, result.length - matchStr.length);
  }

  return result;
}

export const formatDollar = (
  val: number,
  options: Intl.NumberFormatOptions = {}
) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumSignificantDigits: 1,
    ...options,
  });

  return formatter.format(val);
};
