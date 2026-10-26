'use strict';
// A deliberately bounded subset: ordinary SRT/WebVTT cues, not VTT styling/regions.
function parseSubtitles(text) {
  const blocks = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim().split(/\n{2,}/);
  const cues = [];
  const stamp = '(?:\\d{2,}:)?\\d{2}:\\d{2}[.,]\\d{3}';
  const timing = new RegExp(`^(${stamp}) --> (${stamp})(?:[ \\t]+.*)?$`);
  for (const block of blocks) {
    const lines = block.split('\n');
    if (/^(WEBVTT|NOTE|STYLE|REGION)(?:\s|$)/.test(lines[0])) continue;
    const index = lines.findIndex(line => timing.test(line));
    if (index < 0 || !lines[index + 1]) throw new Error('Invalid subtitle cue or unsupported subtitle syntax.');
    const [, start, end] = lines[index].match(timing);
    const normalize = value => (value.split(':').length === 2 ? '00:' : '') + value.replace(',', '.');
    const seconds = value => normalize(value).split(':').reduce((total, part) => total * 60 + Number(part), 0);
    if (seconds(end) < seconds(start)) throw new Error('A subtitle cue ends before it starts.');
    cues.push({ start: normalize(start), end: normalize(end), text: lines.slice(index + 1).join('\n') });
  }
  if (!cues.length) throw new Error('No subtitle cues found.');
  return cues;
}
function convertSubtitles(text, target) {
  const cues = parseSubtitles(text);
  if (target === 'txt') return cues.map(cue => cue.text.replace(/<[^>]*>/g, '')).join('\n\n') + '\n';
  const stamp = value => target === 'srt' ? value.replace('.', ',') : value;
  return (target === 'vtt' ? 'WEBVTT\n\n' : '') + cues.map((cue, index) =>
    `${target === 'srt' ? `${index + 1}\n` : ''}${stamp(cue.start)} --> ${stamp(cue.end)}\n${cue.text}`
  ).join('\n\n') + '\n';
}
module.exports = { parseSubtitles, convertSubtitles };
