'use strict';
const { fork, spawn } = require('node:child_process');
const path = require('node:path');
function runJob(job, { signal, onProgress, timeoutMs = 300000 } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Error('Conversion cancelled.'));
    const child = fork(path.join(__dirname, 'worker.cjs'), [], { execPath: process.execPath, execArgv: ['--max-old-space-size=768'], env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }, windowsHide: true, detached: process.platform !== 'win32', stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
    let settled = false, reason, forced, diagnostic = '';
    child.stderr.on('data', chunk => { diagnostic = (diagnostic + chunk.toString()).slice(-2000); });
    const finish = (error, result) => {
      if (settled) return; settled = true; clearTimeout(timer); clearTimeout(forced); signal?.removeEventListener('abort', abort);
      error ? reject(error) : resolve(result);
    };
    const stop = message => {
      if (settled || reason) return; reason = message;
      if (child.connected) child.send({ type: 'cancel' });
      forced = setTimeout(() => {
        if (process.platform === 'win32') {
          const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, shell: false, stdio: 'ignore' });
          killer.on('error', () => child.kill());
        } else { try { process.kill(-child.pid, 'SIGKILL'); } catch { child.kill('SIGKILL'); } }
      }, 1500);
    };
    const abort = () => stop('Conversion cancelled.');
    const timer = setTimeout(() => stop('Conversion exceeded the five-minute time limit.'), timeoutMs);
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
    child.on('message', message => {
      if (message.type === 'progress' && !reason) onProgress?.(message.value);
      if (message.type === 'result') child.result = message;
    });
    child.on('error', error => finish(error));
    child.on('exit', (code, signal) => {
      const result = child.result;
      finish(reason ? new Error(reason) : result?.error ? new Error(result.error) : code !== 0 || !result ? new Error(`Conversion engine exited unexpectedly (${signal || `exit ${code}`}). ${diagnostic}`) : null, result?.value);
    });
    child.send({ type: 'run', job });
  });
}
module.exports = { runJob };
