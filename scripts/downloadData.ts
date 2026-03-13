#!/usr/bin/env npx ts-node

/**
 * Download Inside Airbnb data to data/raw/
 * Usage:
 *   npx ts-node downloadData.ts
 *   npx ts-node downloadData.ts --regions "united-states"
 *   npx ts-node downloadData.ts --regions "united-states,the-netherlands"
 *   npx ts-node downloadData.ts --cities "amsterdam,london,new-york-city"
 *   npx ts-node downloadData.ts --file-types "listings.csv.gz,reviews.csv.gz"
 *   npx ts-node downloadData.ts --concurrency 5
 *   npx ts-node downloadData.ts --dry-run
 *   npx ts-node downloadData.ts --list-regions
 */

import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import * as zlib from 'zlib';

// ── Config ──────────────────────────────────────────────────────────────────

const SOURCE_URL = 'https://insideairbnb.com/get-the-data/';
const OUTPUT_DIR = path.resolve('data/raw');

// Parse CLI args
const args = process.argv.slice(2);
const getArg = (flag: string): string | undefined => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : undefined;
};
const hasFlag = (flag: string): boolean => args.includes(flag);

const REGION_FILTER =
  getArg('--regions')
    ?.toLowerCase()
    .split(',')
    .map((s) => s.trim()) ?? [];
const CITY_FILTER =
  getArg('--cities')
    ?.toLowerCase()
    .split(',')
    .map((s) => s.trim()) ?? [];
const FILE_TYPE_FILTER =
  getArg('--file-types')
    ?.split(',')
    .map((s) => s.trim()) ?? [];
const CONCURRENCY = Number(getArg('--concurrency') ?? '3');
const DRY_RUN = hasFlag('--dry-run');
const LIST_REGIONS = hasFlag('--list-regions');
const SKIP_EXISTING = !hasFlag('--force');

// ── Types ────────────────────────────────────────────────────────────────────

interface DownloadEntry {
  city: string;
  region: string; // e.g. "united-states", "the-netherlands"
  date: string;
  fileName: string;
  url: string;
  description: string;
  localPath: string;
}

// ── HTML Fetching ────────────────────────────────────────────────────────────

async function fetchText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(
        url,
        { headers: { 'User-Agent': 'Mozilla/5.0 (inside-airbnb-downloader)' } },
        (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            return fetchText(res.headers.location!).then(resolve).catch(reject);
          }
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode} for ${url}`));
            return;
          }
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
          res.on('error', reject);
        },
      )
      .on('error', reject);
  });
}

// ── Parse Download Links ─────────────────────────────────────────────────────

/**
 * Extracts the top-level region from a data.insideairbnb.com URL.
 * e.g. https://data.insideairbnb.com/united-states/ny/albany/... → "united-states"
 */
function extractRegion(url: string): string {
  const match = url.match(/data\.insideairbnb\.com\/([^/]+)\//);
  return match ? match[1] : 'unknown';
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '').trim();
}

function parseDownloads(html: string): DownloadEntry[] {
  const entries: DownloadEntry[] = [];

  // Split on <h3> tags to get per-city blocks
  const cityBlocks = html.split(/<h3[^>]*>/i).slice(1);

  for (const block of cityBlocks) {
    const cityMatch = block.match(/^([\s\S]*?)<\/h3>/i);
    if (!cityMatch) continue;
    const city = stripTags(cityMatch[1]).replace(/\s+/g, ' ').trim();

    const dateMatch = block.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i);
    if (!dateMatch) continue;
    const date = stripTags(dateMatch[1]).replace(/\s+/g, ' ').trim();

    const citySlug = city
      .split(',')[0]
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const dateSlug = date.replace(
      /(\d+)\s+(\w+)\s+(\d{4})/,
      (_, d, mon, y) => `${y}-${mon}-${d.padStart(2, '0')}`,
    );

    const linkRegex = /href="(https:\/\/data\.insideairbnb\.com\/[^"]+)"/g;
    const seen = new Set<string>();
    let lm: RegExpExecArray | null;

    while ((lm = linkRegex.exec(block)) !== null) {
      const url = lm[1];
      if (seen.has(url)) continue;
      seen.add(url);

      const fileName = url.split('/').pop()!;
      const region = extractRegion(url);
      const localPath = path.join(
        OUTPUT_DIR,
        `${citySlug}_${dateSlug}_${fileName}`,
      );
      entries.push({
        city,
        region,
        date,
        fileName,
        url,
        description: '',
        localPath,
      });
    }
  }

  return entries;
}

// ── Download File ────────────────────────────────────────────────────────────

async function downloadFile(entry: DownloadEntry): Promise<void> {
  fs.mkdirSync(path.dirname(entry.localPath), { recursive: true });

  const isGzip = entry.fileName.endsWith('.gz');
  // For .gz files, write the decompressed version (strip .gz extension)
  const writePath = isGzip
    ? entry.localPath.replace(/\.gz$/, '')
    : entry.localPath;

  await new Promise<void>((resolve, reject) => {
    const client = entry.url.startsWith('https') ? https : http;
    const request = (url: string) => {
      client
        .get(
          url,
          {
            headers: { 'User-Agent': 'Mozilla/5.0 (inside-airbnb-downloader)' },
          },
          (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
              return request(res.headers.location!);
            }
            if (res.statusCode !== 200) {
              reject(new Error(`HTTP ${res.statusCode}`));
              return;
            }
            const total = Number(res.headers['content-length'] ?? 0);
            let downloaded = 0;
            const file = fs.createWriteStream(writePath);

            res.on('data', (chunk: Buffer) => {
              downloaded += chunk.length;
              if (total > 0) {
                const pct = ((downloaded / total) * 100).toFixed(0);
                process.stdout.write(`\r  ↓ ${entry.fileName} ${pct}%   `);
              }
            });

            const stream = isGzip
              ? pipeline(res, zlib.createGunzip(), file)
              : pipeline(res, file);
            stream
              .then(() => {
                process.stdout.write('\n');
                resolve();
              })
              .catch(reject);
          },
        )
        .on('error', reject);
    };
    request(entry.url);
  });
}

// ── Concurrency Pool ─────────────────────────────────────────────────────────

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let i = 0;
  const next = async (): Promise<void> => {
    const index = i++;
    if (index >= items.length) return;
    await fn(items[index], index);
    await next();
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, next),
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🏠 Inside Airbnb Downloader');
  console.log(`📂 Output: ${OUTPUT_DIR}`);
  if (DRY_RUN) console.log('🔍 Dry run mode — no files will be downloaded\n');

  console.log('⏳ Fetching download page...');
  const html = await fetchText(SOURCE_URL);

  let entries = parseDownloads(html);
  console.log(`✅ Found ${entries.length} files across all cities\n`);

  // --list-regions: print all available regions and exit
  if (LIST_REGIONS) {
    const regions = [...new Set(entries.map((e) => e.region))].sort();
    console.log('Available regions:');
    regions.forEach((r) => {
      const cities = [
        ...new Set(entries.filter((e) => e.region === r).map((e) => e.city)),
      ];
      console.log(`  ${r} (${cities.length} cities)`);
    });
    return;
  }

  // Apply filters
  if (REGION_FILTER.length > 0) {
    entries = entries.filter((e) =>
      REGION_FILTER.some((f) => e.region.includes(f)),
    );
    console.log(
      `🌎 Region filter applied (${REGION_FILTER.join(', ')}): ${entries.length} files remaining`,
    );
  }

  if (CITY_FILTER.length > 0) {
    entries = entries.filter((e) =>
      CITY_FILTER.some((f) => e.city.toLowerCase().includes(f)),
    );
    console.log(`🔎 City filter applied: ${entries.length} files remaining`);
  }

  if (FILE_TYPE_FILTER.length > 0) {
    entries = entries.filter((e) =>
      FILE_TYPE_FILTER.some((f) => e.fileName.includes(f)),
    );
    console.log(
      `🔎 File type filter applied: ${entries.length} files remaining`,
    );
  }

  if (SKIP_EXISTING) {
    const before = entries.length;
    entries = entries.filter((e) => !fs.existsSync(e.localPath));
    const skipped = before - entries.length;
    if (skipped > 0)
      console.log(`⏭️  Skipping ${skipped} already-downloaded files`);
  }

  if (entries.length === 0) {
    console.log('✅ Nothing to download.');
    return;
  }

  console.log(
    `\n📥 Downloading ${entries.length} files (concurrency: ${CONCURRENCY})...\n`,
  );

  if (DRY_RUN) {
    entries.forEach((e) =>
      console.log(`  [dry-run] ${e.region} / ${e.city} → ${e.localPath}`),
    );
    return;
  }

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  await runWithConcurrency(entries, CONCURRENCY, async (entry, i) => {
    console.log(
      `[${i + 1}/${entries.length}] ${entry.region} / ${entry.city} / ${entry.fileName}`,
    );
    try {
      await downloadFile(entry);
      success++;
    } catch (err) {
      failed++;
      const msg = `  ✗ Failed: ${entry.url} — ${(err as Error).message}`;
      errors.push(msg);
      console.error(msg);
    }
  });

  console.log(`\n✅ Done. ${success} downloaded, ${failed} failed.`);
  if (errors.length > 0) {
    console.log('\nFailed downloads:');
    errors.forEach((e) => console.log(e));
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
