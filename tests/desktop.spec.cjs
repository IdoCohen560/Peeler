const { test, expect, _electron: electron } = require('@playwright/test');
const path = require('node:path');
const fs = require('node:fs/promises');
async function launchApp(env, testInfo, extraArgs = []) {
  const profile = testInfo.outputPath('profile');
  await fs.mkdir(profile, { recursive: true });
  return electron.launch({ args: [...(process.env.PEELER_EXECUTABLE ? [] : [path.join(__dirname, '..')]), ...extraArgs], ...(process.env.PEELER_EXECUTABLE ? { executablePath: process.env.PEELER_EXECUTABLE } : {}), env: { ...env, PEELER_TEST_PROFILE: profile, PEELER_WORK_ROOT: env.PEELER_WORK_ROOT || path.join(__dirname, '../.tmp/jobs') } });
}
test('Quit Peeler button exits the entire background app', async ({}, testInfo) => {
  const env = { ...process.env, PEELER_SHOW_WINDOW: '1', PEELER_DISABLE_HOOK: '1' }; delete env.ELECTRON_RUN_AS_NODE;
  const app = await launchApp(env, testInfo);
  let exited = false; app.once('close', () => { exited = true; });
  try {
    const page = await app.firstWindow(), closed = app.waitForEvent('close');
    await page.getByRole('button', { name: 'Quit Peeler', exact: true }).click();
    await closed;
  } finally { if (!exited) await app.close(); }
});
test('chosen output folder applies to conversions, survives window reopen, and can be reset', async ({}, testInfo) => {
  const directory = testInfo.outputPath('files'), destination = path.join(directory, 'converted'); await fs.mkdir(destination, { recursive: true });
  const input = path.join(directory, 'captions.srt'), original = '1\n00:00:00,000 --> 00:00:01,000\nOriginal caption\n'; await fs.writeFile(input, original);
  const env = { ...process.env, PEELER_SHOW_WINDOW: '1', PEELER_DISABLE_HOOK: '1' }; delete env.ELECTRON_RUN_AS_NODE;
  const app = await launchApp(env, testInfo);
  try {
    const page = await app.firstWindow();
    await app.evaluate(({ dialog }, folder) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [folder] }); }, destination);
    await page.getByRole('button', { name: 'Choose output folder', exact: true }).click(); await expect(page.locator('#destination-label')).toContainText(destination);
    await app.evaluate(({ dialog }, input) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [input] }); }, input);
    await page.getByRole('button', { name: 'Add files', exact: true }).click(); await page.getByRole('button', { name: 'Convert files', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Show file' })).toHaveCount(1);
    expect(await fs.readFile(path.join(destination, 'captions.vtt'), 'utf8')).toContain('Original caption'); expect(await fs.readFile(input, 'utf8')).toBe(original);
    await page.reload(); await expect(page.locator('#destination-label')).toContainText(destination);
    await page.getByRole('button', { name: 'Use original folders', exact: true }).click(); await expect(page.locator('#destination-label')).toHaveText('Save beside each original');
    await app.evaluate(({ dialog }, folder) => { dialog.showOpenDialog = async () => ({ canceled: true, filePaths: [folder] }); }, destination);
    await page.getByRole('button', { name: 'Choose output folder', exact: true }).click(); await expect(page.locator('#destination-label')).toHaveText('Save beside each original');
    await page.screenshot({ path: testInfo.outputPath('destination.png'), fullPage: true });
  } finally { await app.close(); }
});
test('image size and quality choices reach the conversion worker', async ({}, testInfo) => {
  const directory = testInfo.outputPath('images'); await fs.mkdir(directory, { recursive: true }); const input = path.join(directory, 'photo.png');
  await require('sharp')({ create: { width: 100, height: 60, channels: 3, background: 'red' } }).png().toFile(input);
  const env = { ...process.env, PEELER_SHOW_WINDOW: '1', PEELER_DISABLE_HOOK: '1' }; delete env.ELECTRON_RUN_AS_NODE;
  const app = await launchApp(env, testInfo);
  try {
    const page = await app.firstWindow(); await app.evaluate(({ dialog }, file) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [file] }); }, input);
    await page.getByRole('button', { name: 'Add files', exact: true }).click(); await page.getByRole('button', { name: 'Output format for photo.png' }).click();
    await page.getByLabel('Max width (px)').fill('25'); await page.getByLabel('Lossy quality', { exact: true }).fill('70');
    await page.screenshot({ path: testInfo.outputPath('image-options.png') });
    await page.getByRole('button', { name: 'Save image copy', exact: true }).click(); await page.getByRole('button', { name: 'Convert files', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Show file' })).toHaveCount(1);
    const meta = await require('sharp')(path.join(directory, 'photo - edited.png')).metadata(); expect(meta.width).toBe(25); expect(meta.height).toBe(15);
    expect((await require('sharp')(input).metadata()).width).toBe(100);
  } finally { await app.close(); }
});
test('closing the optional window keeps the host alive and --quit stops it', async ({}, testInfo) => {
  const env = { ...process.env, PEELER_SHOW_WINDOW: '1', PEELER_DISABLE_HOOK: '1' }; delete env.ELECTRON_RUN_AS_NODE;
  const app = await launchApp(env, testInfo);
  let exited = false; app.once('close', () => { exited = true; });
  try {
    const page = await app.firstWindow(); await page.close();
    expect(await app.evaluate(({ app, BrowserWindow }) => app.isReady() && BrowserWindow.getAllWindows().length === 0)).toBe(true);
    const closed = app.waitForEvent('close');
    const peer = require('node:child_process').spawn(process.env.PEELER_EXECUTABLE || require('electron'), [...(process.env.PEELER_EXECUTABLE ? [] : [path.join(__dirname, '..')]), '--quit'], { env: { ...env, PEELER_TEST_PROFILE: testInfo.outputPath('profile') }, windowsHide: true, stdio: 'ignore' });
    await new Promise((resolve, reject) => { peer.on('error', reject); peer.on('exit', code => code === 0 ? resolve() : reject(new Error(`Quit command exited ${code}`))); });
    await closed;
  } finally { if (!exited) await app.close(); }
});
test('quitting during conversion cleans up without changing the source', async ({}, testInfo) => {
  const directory = path.join(__dirname, '../.tmp', `quit-job-${Date.now()}`); await fs.mkdir(directory, { recursive: true });
  const input = path.join(directory, 'pages.pdf'), source = await require('../src/core/pdf.cjs').textPDF('', { pages: Array.from({ length: 12 }, (_, index) => `Page ${index + 1}`) });
  await fs.writeFile(input, source);
  const env = { ...process.env, PEELER_SHOW_WINDOW: '1', PEELER_DISABLE_HOOK: '1' }; delete env.ELECTRON_RUN_AS_NODE;
  const app = await launchApp(env, testInfo); let exited = false; app.once('close', () => { exited = true; });
  try {
    const page = await app.firstWindow();
    await app.evaluate(({ dialog }, file) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [file] }); }, input);
    await page.getByRole('button', { name: 'Add files', exact: true }).click();
    await page.getByRole('button', { name: 'Output format for pages.pdf' }).click();
    await page.getByRole('button', { name: 'PNG pages (ZIP)', exact: true }).click();
    await page.getByRole('button', { name: 'Convert files', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Cancel batch', exact: true })).toBeVisible();
    const closed = app.waitForEvent('close'); await page.getByRole('button', { name: 'Quit Peeler', exact: true }).click(); await closed;
    expect(await fs.readFile(input)).toEqual(source);
    expect(await fs.readdir(directory)).toEqual(['pages.pdf']);
  } finally { if (!exited) await app.close(); await fs.rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
});
test('desktop imports, chooses formats, converts a batch and isolates the renderer', async ({}, testInfo) => {
  const directory = path.join(__dirname, '../.tmp/desktop');
  await fs.mkdir(directory, { recursive: true });
  const input = path.join(directory, 'demo.srt');
  await fs.writeFile(input, '1\n00:00:01,000 --> 00:00:02,000\nA real subtitle\n');
  const image = path.join(directory, 'photo.png');
  const broken = path.join(directory, 'broken.png');
  await require('sharp')({ create: { width: 12, height: 10, channels: 3, background: '#123456' } }).png().toFile(image);
  await fs.writeFile(broken, 'invalid image');
  const env = { ...process.env, PEELER_SHOW_WINDOW: '1', PEELER_DISABLE_HOOK: '1' }; delete env.ELECTRON_RUN_AS_NODE;
  const app = await launchApp(env, testInfo);
  try {
    const page = await app.firstWindow();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await expect(page.getByRole('heading', { name: 'Convert files', exact: true })).toBeVisible();
    await app.evaluate(({ dialog }, files) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: files }); }, [input, image, broken]);
    await page.getByRole('button', { name: 'Add files', exact: true }).click();
    await expect(page.locator('#count')).toHaveText('3 files');
    await page.getByRole('button', { name: 'Output format for demo.srt' }).click();
    await page.getByRole('button', { name: 'TXT', exact: true }).click();
    await page.getByRole('button', { name: 'Convert files', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Show file' })).toHaveCount(2);
    await expect(page.locator('.file-state.error')).toContainText('unsupported image format');
    expect(await fs.readFile(path.join(directory, 'demo.txt'), 'utf8')).toBe('A real subtitle\n');
    expect((await require('sharp')(await fs.readFile(path.join(directory, 'photo.jpg'))).metadata()).format).toBe('jpeg');
    expect(await page.evaluate(() => typeof require)).toBe('undefined');
    await page.screenshot({ path: testInfo.outputPath('converted.png') });
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.screenshot({ path: testInfo.outputPath(`screen-${width}.png`), fullPage: true });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    expect(errors).toEqual([]);
  } finally { await app.close(); await fs.rm(directory, { recursive: true, force: true }); }
});
test('all ten categories convert through the desktop IPC and worker boundary', async ({}, testInfo) => {
  const directory = path.join(__dirname, '../.tmp', `desktop-all-${Date.now()}`);
  await fs.mkdir(directory, { recursive: true });
  const files = [];
  const add = async (name, data) => { const file = path.join(directory, name); await fs.writeFile(file, data); files.push(file); return file; };
  await add('image.png', await require('sharp')({ create: { width: 16, height: 12, channels: 3, background: 'red' } }).png().toBuffer());
  const media = require('../src/core/media.cjs');
  const video = path.join(directory, 'video.mp4');
  await media.runFFmpeg(['-f', 'lavfi', '-i', 'color=red:size=32x32:rate=4', '-t', '0.3', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-f', 'mp4', video]); files.push(video);
  const audio = path.join(directory, 'audio.wav'); await media.runFFmpeg(['-f', 'lavfi', '-i', 'sine=duration=0.3', '-f', 'wav', audio]); files.push(audio);
  await add('report.pdf', await require('../src/core/pdf.cjs').textPDF('Desktop PDF fixture'));
  await add('document.txt', 'A real document');
  const Presentation = require('pptxgenjs'), presentation = new Presentation(); presentation.addSlide().addText('Desktop slide', { x: 1, y: 1, w: 4, h: 1 });
  await add('slides.pptx', await presentation.write({ outputType: 'nodebuffer' }));
  await add('spreadsheet.csv', 'Name,Value\nTea,12\n');
  await add('book.epub', await require('../src/core/text-formats.cjs').writeText('Desktop ebook', 'epub'));
  await add('captions.srt', '1\n00:00:00,000 --> 00:00:01,000\nCaption\n');
  await add('archive.zip', await require('../src/core/archives.cjs').writeArchive([{ name: 'hello.txt', data: Buffer.from('Archive fixture') }], 'zip'));
  const env = { ...process.env, PEELER_SHOW_WINDOW: '1', PEELER_DISABLE_HOOK: '1' }; delete env.ELECTRON_RUN_AS_NODE;
  const app = await launchApp(env, testInfo);
  try {
    const page = await app.firstWindow();
    await app.evaluate(({ dialog }, files) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: files }); }, files);
    await page.getByRole('button', { name: 'Add files', exact: true }).click();
    await expect(page.locator('#count')).toHaveText('10 files');
    const slides = page.getByRole('button', { name: 'Output format for slides.pptx' });
    await slides.focus(); await page.keyboard.press('Shift');
    await expect(page.locator('#format-dialog')).toBeVisible(); await expect(page.locator('#format-note')).toContainText(require('../src/core/office.cjs').available() ? 'Office rendering' : 'Text-only');
    await page.keyboard.press('Escape'); await expect(page.locator('#format-dialog')).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Convert files', exact: true })).toBeInViewport();
    await page.getByRole('button', { name: 'Convert files', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Show file' })).toHaveCount(10, { timeout: 30000 });
    await expect(page.locator('.file-state.error')).toHaveCount(0);
    await expect(page.locator('#summary')).toHaveText('10 converted · 0 ready');
    expect(await fs.readFile(path.join(directory, 'report.txt'), 'utf8')).toContain('Desktop PDF fixture');
    await page.screenshot({ path: testInfo.outputPath('all-ten-categories.png'), fullPage: true });
  } finally { await app.close(); await fs.rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
});
test('Windows wheel holds dropped files for browsing, cancellation, and explicit conversion', async ({}, testInfo) => {
  test.skip(process.platform !== 'win32', 'Windows native hook startup integration; other OS hooks need native-machine checks.');
  const directory = path.join(__dirname, '../.tmp', `wheel-${Date.now()}`); await fs.mkdir(directory, { recursive: true });
  const input = path.join(directory, 'wheel-image.png');
  await fs.writeFile(input, await require('sharp')({ create: { width: 18, height: 14, channels: 3, background: 'blue' } }).png().toBuffer());
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE; delete env.PEELER_SHOW_WINDOW; delete env.PEELER_DISABLE_HOOK;
  const app = await launchApp(env, testInfo);
  try {
    await expect.poll(() => app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().length)).toBe(0);
    await expect.poll(() => app.evaluate(({ app }) => process.getBuiltinModule('module').createRequire(`${app.getAppPath()}/package.json`)('uiohook-napi').uIOhook.listenerCount('keydown'))).toBeGreaterThan(0);
    await testInfo.attach('background-processes.json', { body: JSON.stringify(await app.evaluate(({ app }) => app.getAppMetrics()), null, 2), contentType: 'application/json' });
    const openWheel = () => app.evaluate(({ app }) => {
      const require = process.getBuiltinModule('module').createRequire(`${app.getAppPath()}/package.json`);
      const hook = require('uiohook-napi').uIOhook;
      hook.emit('mousedown', { button: 1, x: 0, y: 0 }); hook.emit('mousemove', { x: 30, y: 0 }); hook.emit('keydown', { keycode: 42 });
    });
    await openWheel();
    const page = await app.firstWindow();
    await expect(page.locator('.petal')).toHaveCount(8);
    await expect(page.getByText('Convert', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'JPG', exact: true }).hover();
    await expect(page.getByRole('button', { name: 'JPG', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.screenshot({ path: testInfo.outputPath('conversion-wheel.png') });
    await page.evaluate(() => { const input = document.createElement('input'); input.type = 'file'; input.id = 'fixture'; input.hidden = true; document.body.append(input); });
    const cdp = await page.context().newCDPSession(page);
    const { root } = await cdp.send('DOM.getDocument'); const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#fixture' });
    await cdp.send('DOM.setFileInputFiles', { nodeId, files: [input] });
    const dropFile = () => page.evaluate(() => {
      const target = document.querySelector('.petal[data-value="jpg"]'), rect = target.getBoundingClientRect(), dataTransfer = new DataTransfer();
      for (const file of document.querySelector('#fixture').files) dataTransfer.items.add(file);
      target.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer, clientX: (rect.left + rect.right) / 2, clientY: (rect.top + rect.bottom) / 2 }));
    });
    await dropFile();
    await expect(page.getByText('1 file ready', { exact: true })).toBeVisible();
    await app.evaluate(({ app }) => process.getBuiltinModule('module').createRequire(`${app.getAppPath()}/package.json`)('uiohook-napi').uIOhook.emit('mouseup', { button: 1 }));
    await page.waitForTimeout(600); // Exceeds the native drag-release dismissal timer.
    expect(await fs.readdir(directory)).toEqual(['wheel-image.png']);
    expect(await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().filter(window => window.isVisible()).length)).toBe(1);
    await page.getByRole('button', { name: 'Tools', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Strip metadata', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Formats', exact: true }).click();
    await expect(page.getByRole('button', { name: 'JPG', exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('drop-then-choose.png') });
    await page.getByRole('button', { name: 'Cancel conversion', exact: true }).click();
    await expect.poll(() => app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().filter(window => window.isVisible()).length)).toBe(0);
    expect(await fs.readdir(directory)).toEqual(['wheel-image.png']);
    await openWheel(); await expect(page.getByRole('button', { name: 'JPG', exact: true })).toBeVisible();
    await dropFile(); await expect(page.getByText('1 file ready', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'JPG', exact: true }).click();
    await expect.poll(async () => { try { return (await fs.stat(path.join(directory, 'wheel-image.jpg'))).size; } catch { return 0; } }).toBeGreaterThan(0);
    expect((await require('sharp')(await fs.readFile(path.join(directory, 'wheel-image.jpg'))).metadata()).format).toBe('jpeg');
    expect(await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().filter(window => window.isVisible()).length)).toBe(0);
    await openWheel(); await dropFile(); await expect(page.getByText('1 file ready', { exact: true })).toBeVisible();
    const pickerOpened = app.waitForEvent('window'); await page.getByRole('button', { name: 'More options', exact: true }).click();
    const picker = await pickerOpened; await expect(picker.locator('#format-dialog')).toBeVisible();
    await expect(picker.getByLabel('Max width (px)')).toBeVisible(); await picker.getByLabel('Max width (px)').fill('9');
    await picker.getByRole('button', { name: 'JPG', exact: true }).click();
    expect(await fs.readdir(directory)).toEqual(['wheel-image.jpg', 'wheel-image.png']);
    await picker.getByRole('button', { name: 'Convert files', exact: true }).click();
    await expect.poll(async () => { try { return (await require('sharp')(path.join(directory, 'wheel-image (2).jpg')).metadata()).width; } catch { return 0; } }).toBe(9);
    await picker.screenshot({ path: testInfo.outputPath('wheel-more-options.png') });
  } finally { await app.close(); await fs.rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
});
test('Office and RAR engines work through the packaged conversion boundary', async ({}, testInfo) => {
  test.skip(!require('../src/core/office.cjs').available(), 'Provision the Office engine for this integration test.'); test.setTimeout(120000);
  const directory = testInfo.outputPath('engine-files'); await fs.mkdir(directory, { recursive: true });
  const Presentation = require('pptxgenjs'), presentation = new Presentation(); presentation.addSlide().addText('Packaged Office rendering', { x: 1, y: 1, w: 7, h: 1 });
  const slideInput = path.join(directory, 'slides.pptx'); await fs.writeFile(slideInput, await presentation.write({ outputType: 'nodebuffer' }));
  const archiveInput = path.join(directory, 'download.rar'); await fs.writeFile(archiveInput, require('./fixture-data.cjs').rarFixture('test_read_format_rar5_compressed'));
  const env = { ...process.env, PEELER_SHOW_WINDOW: '1', PEELER_DISABLE_HOOK: '1' }; delete env.ELECTRON_RUN_AS_NODE;
  const app = await launchApp(env, testInfo);
  try {
    const engines = await app.evaluate(({ app }) => { const require = process.getBuiltinModule('module').createRequire(`${app.getAppPath()}/package.json`); return { office: require('./src/core/office.cjs').officePath(), media: require('./src/core/media.cjs').ffmpegPath() }; });
    await testInfo.attach('engine-paths.json', { body: JSON.stringify(engines, null, 2), contentType: 'application/json' });
    if (process.env.PEELER_EXECUTABLE && process.platform === 'win32') { expect(engines.office).toContain(path.join('resources', 'office')); expect(engines.media).toContain(path.join('resources', 'ffmpeg')); }
    const page = await app.firstWindow(); await app.evaluate(({ dialog }, files) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: files }); }, [slideInput, archiveInput]);
    await page.getByRole('button', { name: 'Add files', exact: true }).click();
    await page.getByRole('button', { name: 'Output format for slides.pptx' }).click(); await expect(page.locator('#format-note')).toContainText('Office rendering');
    await page.getByRole('button', { name: 'PNG pages (ZIP)', exact: true }).click();
    await page.getByRole('button', { name: 'Convert files', exact: true }).click(); await expect(page.getByRole('button', { name: 'Show file' })).toHaveCount(2, { timeout: 60000 });
    await expect(page.locator('.file-state.error')).toHaveCount(0);
    const pages = await require('../src/core/archives.cjs').readZip(await fs.readFile(path.join(directory, 'slides.png.zip'))); expect(pages.length).toBe(1);
    const files = await require('../src/core/archives.cjs').readZip(await fs.readFile(path.join(directory, 'download.zip'))); expect(files[0].name).toBe('test.bin'); expect(files[0].data.length).toBe(1200);
    await page.screenshot({ path: testInfo.outputPath('office-rar.png'), fullPage: true });
  } finally { await app.close(); }
});
test('restarting after a host crash recovers the abandoned Office job', async ({}, testInfo) => {
  test.skip(!require('../src/core/office.cjs').available(), 'Office engine required.');
  const directory = path.join(__dirname, '../.tmp', `host-crash-${Date.now()}`), workRoot = path.join(directory, 'jobs'); await fs.mkdir(directory, { recursive: true });
  const input = path.join(directory, 'source.pptx'), Presentation = require('pptxgenjs'), slides = new Presentation();
  for (let i = 0; i < 30; i++) slides.addSlide().addText(`Crash fixture ${i}`, { x: 1, y: 1, w: 6, h: 1 });
  const original = await slides.write({ outputType: 'nodebuffer' }); await fs.writeFile(input, original);
  const env = { ...process.env, PEELER_SHOW_WINDOW: '1', PEELER_DISABLE_HOOK: '1', PEELER_WORK_ROOT: workRoot }; delete env.ELECTRON_RUN_AS_NODE;
  const app = await launchApp(env, testInfo); let restarted;
  try {
    const page = await app.firstWindow(); await app.evaluate(({ dialog }, file) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [file] }); }, input);
    await page.getByRole('button', { name: 'Add files', exact: true }).click(); await page.getByRole('button', { name: 'Convert files', exact: true }).click();
    await expect.poll(async () => {
      const folders = await fs.readdir(workRoot).catch(() => []);
      return (await Promise.all(folders.map(folder => fs.stat(path.join(workRoot, folder, 'profile/user')).then(() => true).catch(() => false)))).some(Boolean);
    }).toBe(true);
    const hostPid = await app.evaluate(() => process.pid); process.kill(hostPid, 'SIGKILL');
    await expect.poll(async () => {
      try { const marker = JSON.parse(await fs.readFile(path.join(workRoot, (await fs.readdir(workRoot))[0], 'lease.json'), 'utf8')); try { process.kill(marker.pid, 0); return false; } catch (error) { return error.code === 'ESRCH'; } } catch { return false; }
    }).toBe(true);
    await app.close().catch(() => {});
    restarted = await launchApp(env, testInfo); await restarted.firstWindow(); await expect.poll(() => fs.readdir(workRoot)).toEqual([]);
    expect(await fs.readFile(input)).toEqual(original); expect((await fs.readdir(directory)).sort()).toEqual(['jobs', 'source.pptx']);
  } finally { if (restarted) await restarted.close(); await app.close().catch(() => {}); await fs.rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
});
