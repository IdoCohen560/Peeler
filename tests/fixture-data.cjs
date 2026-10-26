'use strict';
const fs = require('node:fs');
const path = require('node:path');
function rarFixture(name) {
  const lines = fs.readFileSync(path.join(__dirname, 'fixtures/libarchive', `${name}.rar.uu`), 'utf8').split(/\r?\n/), chunks = [];
  for (const line of lines.slice(1)) {
    if (line === 'end') break;
    const length = (line.charCodeAt(0) - 32) & 63, bytes = [];
    for (let i = 1; i + 3 < line.length; i += 4) {
      const a = (line.charCodeAt(i) - 32) & 63, b = (line.charCodeAt(i + 1) - 32) & 63, c = (line.charCodeAt(i + 2) - 32) & 63, d = (line.charCodeAt(i + 3) - 32) & 63;
      bytes.push((a << 2) | (b >> 4), ((b << 4) | (c >> 2)) & 255, ((c << 6) | d) & 255);
    }
    chunks.push(Buffer.from(bytes.slice(0, length)));
  }
  return Buffer.concat(chunks);
}
module.exports = { rarFixture };
