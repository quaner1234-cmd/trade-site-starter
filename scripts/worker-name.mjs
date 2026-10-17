#!/usr/bin/env node
// One canonical Cloudflare Worker name, read from wrangler.jsonc by CI.
// The preview worker is always <name>-preview and never the production worker.
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function workerNameFromConfig(source) {
  const name = source.match(/^\s*"name"\s*:\s*"([^"]+)"/m)?.[1];
  if (!name || name === 'trade-site-starter') {
    throw new Error('Change the default Worker name in wrangler.jsonc before deploying.');
  }
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(name) || name.length > 55) {
    throw new Error('Worker name must be lower-case, alphanumeric/hyphen, at most 55 characters (room for -preview).');
  }
  return name;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = join(dirname(fileURLToPath(import.meta.url)), '..');
    process.stdout.write(workerNameFromConfig(readFileSync(join(root, 'wrangler.jsonc'), 'utf8')));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
