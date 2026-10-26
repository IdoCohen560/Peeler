'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const png2icons = require('png2icons');
async function main() {
  const root = path.join(__dirname, '..'), assets = path.join(root, 'assets/branding');
  const source = path.join(assets, 'peeler-logo-master.png');
  for (const size of [16, 24, 32, 48, 64, 128, 256, 512, 1024]) {
    await sharp(source).resize(size, size).png().toFile(path.join(assets, `peeler-${size}.png`));
  }
  const master = await fs.readFile(path.join(assets, 'peeler-1024.png'));
  const ico = png2icons.createICO(master, png2icons.BICUBIC2, 0, false, true);
  const icns = png2icons.createICNS(master, png2icons.BICUBIC2, 0);
  if (!ico || !icns) throw new Error('Could not encode application icons.');
  await fs.writeFile(path.join(assets, 'peeler.ico'), ico);
  await fs.writeFile(path.join(assets, 'peeler.icns'), icns);
  await fs.mkdir(path.join(root, 'src/renderer/branding'), { recursive: true });
  for (const size of [64, 512]) await fs.copyFile(path.join(assets, `peeler-${size}.png`), path.join(root, `src/renderer/branding/peeler-${size}.png`));
  await sharp(source).resize(40, 40).png().toFile(path.join(root, 'src/desktop/tray.png'));
  await sharp(source).resize(40, 40).negate({ alpha: false }).png().toFile(path.join(root, 'src/desktop/tray-light.png'));
  console.log('Generated Peeler PNG sizes, Windows ICO, macOS ICNS, and tray assets.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
