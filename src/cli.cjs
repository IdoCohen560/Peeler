#!/usr/bin/env node
'use strict';
const { convert } = require('./core/converter.cjs');
const [input, target, outputDirectory] = process.argv.slice(2);
if (!input || !target) { console.error('Usage: npm run convert -- <input> <target-extension> [output-directory]'); console.error('Supported targets depend on the input. Open npm start to see available conversions and fidelity notes.'); process.exitCode = 1; }
else convert({ input, target, outputDirectory }).then(result => console.log(result.output)).catch(error => { console.error(error.message); process.exitCode = 1; });
