'use strict';
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const path = require('node:path');
function ffmpegPath() {
  const executable = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
  const managed = [process.env.PEELER_FFMPEG_PATH, path.join(process.resourcesPath || path.join(path.dirname(process.execPath), 'resources'), 'ffmpeg', executable), path.join(__dirname, '../../tools/ffmpeg', executable)];
  const selected = managed.find(file => file && path.isAbsolute(file) && fs.existsSync(file));
  if (selected) return selected;
  const file = require('ffmpeg-static');
  return file && file.replace(/app\.asar([\\/])/, 'app.asar.unpacked$1');
}
function available() { const file = ffmpegPath(); return !!file && fs.existsSync(file); }
const audio = {
  mp3: ['-c:a', 'libmp3lame', '-q:a', '2', '-f', 'mp3'],
  m4a: ['-c:a', 'aac', '-b:a', '192k', '-f', 'ipod'],
  wav: ['-c:a', 'pcm_s16le', '-f', 'wav'],
  flac: ['-c:a', 'flac', '-f', 'flac'],
  ogg: ['-c:a', 'libvorbis', '-q:a', '5', '-f', 'ogg'],
  opus: ['-c:a', 'libopus', '-b:a', '128k', '-f', 'opus'],
  aiff: ['-c:a', 'pcm_s16be', '-f', 'aiff'],
  wma: ['-c:a', 'wmav2', '-b:a', '192k', '-f', 'asf']
};
const video = {
  mp4: ['-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-movflags', '+faststart', '-f', 'mp4'],
  mov: ['-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-f', 'mov'],
  mkv: ['-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-f', 'matroska'],
  webm: ['-c:v', 'libvpx-vp9', '-deadline', 'realtime', '-cpu-used', '6', '-b:v', '0', '-crf', '35', '-pix_fmt', 'yuv420p', '-c:a', 'libopus', '-f', 'webm'],
  avi: ['-c:v', 'mpeg4', '-q:v', '5', '-c:a', 'libmp3lame', '-f', 'avi'],
  wmv: ['-c:v', 'wmv2', '-c:a', 'wmav2', '-f', 'asf'],
  gif: ['-vf', 'fps=12,scale=min(640\\,iw):-2:flags=lanczos', '-an', '-f', 'gif']
};
function runFFmpeg(args, { signal, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    if (!available()) return reject(new Error('The bundled FFmpeg engine is missing. Run npm install again.'));
    const child = spawn(ffmpegPath(), ['-hide_banner', '-nostdin', '-y', '-loglevel', 'error', ...args], { windowsHide: true, shell: false, signal });
    let errors = '', progress = '';
    child.stderr.on('data', chunk => { errors = (errors + chunk.toString()).slice(-8000); });
    child.stdout.on('data', chunk => { progress += chunk.toString(); const lines = progress.split('\n'); progress = lines.pop(); for (const line of lines) if (line.startsWith('out_time=')) onProgress?.({ phase: 'Encoding', time: line.slice(9).trim() }); });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve() : reject(new Error(signal?.aborted ? 'Conversion cancelled.' : `FFmpeg failed: ${errors.trim().slice(-1200) || `exit ${code}`}`)));
  });
}
async function convertMedia({ input, format, temporary, category }, options) {
  const args = ['-protocol_whitelist', 'file,pipe', '-i', input, '-map_metadata', '-1', '-map_chapters', '-1'];
  if (category === 'Audio' || format === 'mp3') args.push('-map', '0:a:0', '-vn', ...audio[format]);
  else { args.push('-map', '0:v:0', '-map', '0:a:0?', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', ...video[format]); }
  args.push('-threads', '2', '-progress', 'pipe:1', temporary);
  await runFFmpeg(args, options);
}
module.exports = { available, ffmpegPath, runFFmpeg, convertMedia, audio, video };
