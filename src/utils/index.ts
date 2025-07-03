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
