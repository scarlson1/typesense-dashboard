import { describe, expect, it } from 'vitest';
import {
  formatBytes,
  formatDollar,
  getArrayVal,
  removeStartEndMatches,
  splitIfString,
  uniqueArr,
} from './index';

describe('splitIfString', () => {
  it('returns an empty array for undefined or empty input', () => {
    expect(splitIfString(undefined)).toEqual([]);
    expect(splitIfString('')).toEqual([]);
  });

  it('splits a comma-separated string', () => {
    expect(splitIfString('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('returns an array argument unchanged', () => {
    expect(splitIfString(['a', 'b'])).toEqual(['a', 'b']);
  });
});

describe('getArrayVal', () => {
  it('wraps a string in an array', () => {
    expect(getArrayVal('a')).toEqual(['a']);
  });

  it('passes arrays through', () => {
    expect(getArrayVal(['a', 'b'])).toEqual(['a', 'b']);
  });
});

describe('uniqueArr', () => {
  it('removes duplicate entries preserving first-seen order', () => {
    expect(uniqueArr(['a', 'a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('returns an empty array unchanged', () => {
    expect(uniqueArr([])).toEqual([]);
  });
});

describe('formatBytes', () => {
  it('returns 0.00 B for zero', () => {
    expect(formatBytes(0)).toBe('0.00 B');
  });

  it('formats kibibytes, mebibytes and gibibytes', () => {
    expect(formatBytes(1024)).toBe('1.00 KB');
    expect(formatBytes(1024 * 1024)).toBe('1.00 MB');
    expect(formatBytes(5 * 1024 * 1024 * 1024)).toBe('5.00 GB');
  });

  it('uses a (double-spaced) bare byte unit below 1 KiB', () => {
    // charAt(0) of ' KMGTP' is a space, so sub-KiB values render "512.00  B".
    expect(formatBytes(512)).toBe('512.00  B');
  });
});

describe('removeStartEndMatches', () => {
  it('strips the match from both the start and the end', () => {
    expect(removeStartEndMatches('__x__', '__')).toBe('x');
  });

  it('strips single-character matches', () => {
    expect(removeStartEndMatches('aXa', 'a')).toBe('X');
  });

  it('leaves the string untouched when there is no match', () => {
    expect(removeStartEndMatches('abc', 'z')).toBe('abc');
  });
});

describe('formatDollar', () => {
  it('formats a whole-dollar value with a currency symbol', () => {
    expect(formatDollar(5)).toBe('$5');
    expect(formatDollar(0)).toBe('$0');
  });

  it('rounds to one significant digit by default', () => {
    // Default options set maximumSignificantDigits: 1.
    expect(formatDollar(1234.5)).toBe('$1,000');
  });

  it('honors overriding number-format options', () => {
    expect(
      formatDollar(1234.5, { maximumSignificantDigits: 21 })
    ).toBe('$1,234.5');
  });
});
