export * from './diffArrayOfObjects';
export * from './getObjectDiff';
export * from './mapboxStore';
export * from './queryClient';
export * from './typesenseStore';
export * from './uiStore';

/**
 * Drop keys whose value is `undefined`, `null`, or an empty string — useful for
 * building create/upsert payloads from form state, where blank optional fields
 * (e.g. an unset `api_key` or `system_prompt`) should be omitted rather than
 * sent as empty values. Preserves falsy-but-meaningful values like `0`/`false`.
 */
export function pruneEmpty<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null && v !== '',
    ),
  ) as Partial<T>;
}

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
