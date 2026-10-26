'use strict';
// Execute real conversion regression tests instead of checking source strings.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const result = spawnSync(process.execPath, ['--test', path.join(__dirname, 'tests/core.test.cjs')], { stdio: 'inherit' });
process.exitCode = result.status ?? 1;
