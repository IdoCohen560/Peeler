'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
function workspaceRoot() { return process.env.PEELER_WORK_ROOT || path.join(__dirname, '../../.tmp/jobs'); }
async function allocateWorkspace(root = workspaceRoot()) {
  await fs.mkdir(root, { recursive: true });
  const directory = await fs.mkdtemp(path.join(root, 'job-'));
  try { await fs.writeFile(path.join(directory, 'lease.json'), JSON.stringify({ peelerJob: 1, name: path.basename(directory), pid: process.pid }), { flag: 'wx' }); }
  catch (error) { await fs.rm(directory, { recursive: true, force: true }); throw error; }
  return directory;
}
async function releaseWorkspace(directory) { await fs.rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
async function recoverWorkspaces(root = workspaceRoot()) {
  const entries = await fs.readdir(root, { withFileTypes: true }).catch(error => { if (error.code === 'ENOENT') return []; throw error; });
  let removed = 0;
  for (const entry of entries.slice(0, 1000)) {
    if (!entry.isDirectory() || entry.isSymbolicLink() || !/^job-[a-zA-Z0-9]{6}$/.test(entry.name)) continue;
    const directory = path.join(root, entry.name), marker = path.join(directory, 'lease.json');
    try {
      const stat = await fs.lstat(marker); if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 512) continue;
      const lease = JSON.parse(await fs.readFile(marker, 'utf8'));
      if (lease.peelerJob !== 1 || lease.name !== entry.name || !Number.isSafeInteger(lease.pid) || lease.pid < 1) continue;
      try { process.kill(lease.pid, 0); continue; } catch (error) { if (error.code !== 'ESRCH') continue; }
      await releaseWorkspace(directory); removed++;
    } catch { /* A malformed marker or busy folder is retained rather than guessed at. */ }
  }
  return removed;
}
module.exports = { workspaceRoot, allocateWorkspace, releaseWorkspace, recoverWorkspaces };
