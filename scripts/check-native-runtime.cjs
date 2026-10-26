'use strict';
const { spawnSync } = require('node:child_process');
const electron = require('electron');
const env = { ...process.env, ELECTRON_RUN_AS_NODE: '1' };
const code = `
  (async () => {
    console.log('Loading canvas');
    const canvas = require('@napi-rs/canvas');
    console.log('Creating canvas');
    await canvas.createCanvas(16, 16).encode('png');
    console.log('Importing PDF.js');
    await import('pdfjs-dist/legacy/build/pdf.mjs');
    console.log('Native runtime ready');
  })().catch(error => { console.error(error); process.exitCode = 1; });
`;
const result = spawnSync(electron, ['-e', code], { env: { ...env, DISABLE_SYSTEM_FONTS_LOAD: '1' }, stdio: 'inherit', timeout: 30000 });
if (result.status !== 0) {
  console.error(`Native runtime failed: ${result.signal || result.error?.message || result.status}`);
  if (process.platform === 'linux') {
    const trace = spawnSync('gdb', ['--batch', '-ex', 'run', '-ex', 'bt 16', '--args', electron, '-e', code], { env, stdio: 'inherit', timeout: 30000 });
    if (trace.error) console.error(trace.error.message);
  }
  process.exitCode = 1;
}
