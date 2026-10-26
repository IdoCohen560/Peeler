'use strict';
const controller = new AbortController();
const send = message => { if (process.connected) process.send(message); };
let started = false;
process.on('message', async message => {
  if (message.type === 'cancel') { controller.abort(); return; }
  if (message.type !== 'run' || started) return;
  started = true;
  let result;
  try {
    await require('./adapters.cjs').runAdapter(message.job, { signal: controller.signal, onProgress: value => send({ type: 'progress', value }) });
    result = { type: 'result', value: true };
  } catch (error) { result = { type: 'result', error: error.message }; }
  if (process.connected) process.send(result, () => process.exit(0)); else process.exit(0);
});
process.on('disconnect', () => { controller.abort(); process.exit(1); });
