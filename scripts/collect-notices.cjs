'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
const sections = ['Peeler third-party package notices\nGenerated from the installed production dependency tree. Binary codec source/distribution obligations are additionally described in THIRD_PARTY_NOTICES.md.'];
for (const [location, metadata] of Object.entries(lock.packages)) {
  if (!location || metadata.dev) continue;
  const directory = path.join(root, location);
  if (!fs.existsSync(directory)) continue;
  const pkg = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
  const heading = `${pkg.name} ${pkg.version}\nLicense: ${typeof pkg.license === 'string' ? pkg.license : JSON.stringify(pkg.license) || 'see package notices'}`;
  const notices = [];
  for (const sub of ['', 'lib']) {
    const base = path.join(directory, sub); if (!fs.existsSync(base) || !fs.statSync(base).isDirectory()) continue;
    for (const name of fs.readdirSync(base)) {
      const file = path.join(base, name);
      if (/^(license|licence|copying|notice)([._-]|$)/i.test(name) && fs.statSync(file).isFile()) notices.push(`${sub ? `${sub}/` : ''}${name}\n${fs.readFileSync(file, 'utf8')}`);
    }
  }
  sections.push(`${heading}\n${notices.join('\n\n') || 'No top-level license file in this installed package; consult its published package/repository.'}`);
}
fs.writeFileSync(path.join(root, 'THIRD_PARTY_LICENSES.txt'), sections.join('\n\n' + '='.repeat(72) + '\n\n') + '\n');
console.log(`Collected notices for ${sections.length - 1} installed production packages.`);
