'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
async function main() {
  const file = path.join(__dirname, '../.tmp/external-fixtures/example.heic');
  const expected = '7f8b363e4936c0666a25f64f3a92fda10bd8e5453be4592530b65a55dd98f3f2';
  const hash = data => crypto.createHash('sha256').update(data).digest('hex');
  if (await fs.readFile(file).then(data => hash(data) === expected).catch(() => false)) { console.log('HEIC fixture already verified.'); return; }
  const url = 'https://raw.githubusercontent.com/strukturag/libheif/12a259a5882dd99d45ec5fc77e296a3b620d1e2e/examples/example.heic';
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok || Number(response.headers.get('content-length')) > 5_000_000) throw new Error(`Fixture download failed: ${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  if (data.length > 5_000_000 || hash(data) !== expected) throw new Error('HEIC fixture hash mismatch.');
  await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, data);
  console.log('Downloaded and hash-verified the upstream HEIC sample for development tests.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
