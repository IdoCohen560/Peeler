'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
sharp.cache({ files: 0 });
const { convert, capabilities } = require('../src/core/converter.cjs');
const { parseSubtitles, convertSubtitles } = require('../src/core/subtitles.cjs');
async function fixture(t) {
  await fs.mkdir(path.join(__dirname, '../.tmp'), { recursive: true });
  const directory = await fs.mkdtemp(path.join(__dirname, '../.tmp/core-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  return directory;
}
const srt = '1\n00:00:01,200 --> 00:00:03,400\nHello <b>world</b>\n\n2\n00:00:05,000 --> 00:00:06,000\nSecond cue\n';
test('images encode as real formats with dimensions, preserve source, and avoid collisions', async t => {
  const directory = await fixture(t), input = path.join(directory, 'photo.png');
  await sharp({ create: { width: 32, height: 24, channels: 3, background: '#186488' } }).png().toFile(input);
  const original = await fs.readFile(input);
  for (const target of ['jpg', 'webp', 'avif', 'tiff']) {
    const result = await convert({ input, target });
    const meta = await sharp(result.output).metadata();
    assert.equal(meta.width, 32); assert.equal(meta.height, 24);
    assert.equal(meta.format, target === 'jpg' ? 'jpeg' : target === 'avif' ? 'heif' : target);
  }
  const first = await convert({ input, target: 'jpg' });
  assert.match(first.output, /photo \(2\)\.jpg$/);
  assert.deepEqual(await fs.readFile(input), original);
  assert.equal((await fs.readdir(directory)).some(file => file.endsWith('.tmp')), false);
});
test('concurrent conversions reserve separate result names', async t => {
  const directory = await fixture(t), input = path.join(directory, 'captions.srt');
  await fs.writeFile(input, srt);
  const results = await Promise.all(Array.from({ length: 6 }, () => convert({ input, target: 'vtt' })));
  assert.equal(new Set(results.map(result => result.output)).size, 6);
  for (const result of results) assert.equal(parseSubtitles(await fs.readFile(result.output, 'utf8')).length, 2);
});
test('subtitle timing and text survive SRT/VTT roundtrip', () => {
  const vtt = convertSubtitles(srt, 'vtt');
  assert.ok(vtt.startsWith('WEBVTT\n\n'));
  assert.deepEqual(parseSubtitles(convertSubtitles(vtt, 'srt')), parseSubtitles(srt));
  assert.equal(convertSubtitles(srt, 'txt'), 'Hello world\n\nSecond cue\n');
  assert.equal(parseSubtitles('WEBVTT\n\ncue-id\n01:02.000 --> 01:03.000 align:start\nHello')[0].start, '00:01:02.000');
});
test('bad files and unsupported conversions fail without fabricated outputs', async t => {
  const directory = await fixture(t), input = path.join(directory, 'broken.png');
  await fs.writeFile(input, 'not an image');
  await assert.rejects(convert({ input, target: 'jpg' }));
  await assert.rejects(convert({ input, target: '../outside' }), /Unsupported/);
  await assert.rejects(convert({ input: directory, target: 'png' }), /individual files/);
  assert.deepEqual(await fs.readdir(directory), ['broken.png']);
  assert.equal(capabilities('movie.mp4').category, 'Video');
  assert.equal(capabilities('unsupported.unknown').targets.length, 0);
  assert.throws(() => parseSubtitles('not subtitles'), /Invalid/);
  assert.throws(() => parseSubtitles('1\n00:00:04,000 --> 00:00:01,000\nOops'), /before/);
});
test('metadata removal writes a separate decodable image without EXIF', async t => {
  const directory = await fixture(t), input = path.join(directory, 'tagged.jpg');
  await sharp({ create: { width: 20, height: 10, channels: 3, background: 'red' } }).withExif({ IFD0: { Artist: 'Private artist' } }).jpeg().toFile(input);
  assert.ok((await sharp(input).metadata()).exif);
  const result = await convert({ input, target: 'jpg', operation: 'strip-metadata' });
  assert.equal((await sharp(result.output).metadata()).exif, undefined);
  assert.ok((await sharp(input).metadata()).exif);
});
test('image options preserve proportions, flatten transparency, and reject invalid settings', async t => {
  const directory = await fixture(t), input = path.join(directory, 'transparent.png');
  await sharp({ create: { width: 80, height: 40, channels: 4, background: '#00000000' } }).png().toFile(input); const source = await fs.readFile(input);
  const result = await convert({ input, target: 'jpg', imageOptions: { width: 20, height: 20, quality: 70, background: '#ffffff' } });
  const image = await sharp(result.output).raw().toBuffer({ resolveWithObject: true }); assert.equal(image.info.width, 20); assert.equal(image.info.height, 10); assert(image.data[0] > 245 && image.data[1] > 245 && image.data[2] > 245);
  const larger = await convert({ input, target: 'webp', imageOptions: { width: 160 } }); assert.equal((await sharp(larger.output).metadata()).width, 80);
  const copy = await convert({ input, target: 'png', operation: 'optimize-image', imageOptions: { width: 16 } }); assert.match(copy.output, /transparent - edited\.png$/); assert.equal((await sharp(copy.output).metadata()).width, 16);
  for (const imageOptions of [{ quality: 101 }, { width: -1 }, { width: 2.5 }, { width: 20000 }, { background: 'file:///private' }, { unknown: true }]) await assert.rejects(convert({ input, target: 'jpg', imageOptions }));
  assert.deepEqual(await fs.readFile(input), source);
});
