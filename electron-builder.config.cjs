'use strict';
const fs = require('node:fs');
const path = require('node:path');
// Package the project-managed engine when provisioned; do not copy a system installation.
module.exports = { ...require('./package.json').build, extraResources: [['libreoffice', 'office'], ['ffmpeg', 'ffmpeg']].filter(([source]) => fs.existsSync(path.join(__dirname, 'tools', source))).map(([source, destination]) => ({ from: `tools/${source}`, to: destination, filter: source === 'ffmpeg' ? ['ffmpeg', 'ffmpeg.exe', 'LICENSE', 'README.txt'] : ['**/*'] })) };
