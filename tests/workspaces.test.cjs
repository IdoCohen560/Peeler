'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { allocateWorkspace, releaseWorkspace, recoverWorkspaces } = require('../src/core/workspaces.cjs');
test('recovery removes abandoned jobs while retaining live jobs and unrelated files', async t => {
  await fs.mkdir(path.join(__dirname, '../.tmp'), { recursive: true }); const root = await fs.mkdtemp(path.join(__dirname, '../.tmp/recovery-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const live = await allocateWorkspace(root), abandoned = await allocateWorkspace(root), invalid = path.join(root, 'job-ABCDEF'); await fs.mkdir(invalid);
  await fs.writeFile(path.join(abandoned, 'lease.json'), JSON.stringify({ peelerJob: 1, name: path.basename(abandoned), pid: 2147483647 }));
  await fs.writeFile(path.join(abandoned, 'result.tmp'), 'incomplete');
  await fs.writeFile(path.join(root, 'original.txt'), 'keep'); await fs.writeFile(path.join(invalid, 'lease.json'), '{}');
  assert.equal(await recoverWorkspaces(root), 1); assert(await fs.stat(live)); assert.equal(await fs.readFile(path.join(root, 'original.txt'), 'utf8'), 'keep'); assert(await fs.stat(invalid));
  assert.equal(await recoverWorkspaces(root), 0); await releaseWorkspace(live);
});
