'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createGesture } = require('../src/desktop/gesture.cjs');
function fixture(platform) {
  const calls = [];
  const gesture = createGesture({ platform, open: mode => calls.push(mode), close: () => calls.push('close'), release: () => calls.push('release') });
  return { gesture, calls, drag() { gesture.down({ button: 1, x: 0, y: 0 }); gesture.move({ x: 30, y: 0 }); } };
}
test('only left modifier keys during a drag arm the Windows/Linux wheel', () => {
  for (const platform of ['win32', 'linux']) {
    const f = fixture(platform);
    f.gesture.key({ keycode: 42 }); assert.deepEqual(f.calls, []);
    f.gesture.down({ button: 1, x: 0, y: 0 }); f.gesture.key({ keycode: 42 }); assert.deepEqual(f.calls, []);
    f.drag(); f.gesture.key({ keycode: 54 }); f.gesture.key({ keycode: 3640 }); assert.deepEqual(f.calls, []);
    f.gesture.key({ keycode: 42 }); f.gesture.key({ keycode: 56 }); assert.deepEqual(f.calls, ['convert', 'tools']);
    f.gesture.up({ button: 1 }); assert.equal(f.calls.at(-1), 'release');
    f.gesture.key({ keycode: 42 }); assert.equal(f.calls.length, 3);
  }
});
test('Mac uses Left Shift and Command, Escape cancels the gesture', () => {
  const f = fixture('darwin'); f.drag(); f.gesture.key({ keycode: 56 }); assert.deepEqual(f.calls, []);
  f.gesture.key({ keycode: 42 }); f.gesture.key({ keycode: 3675 }); assert.deepEqual(f.calls, ['convert', 'tools']);
  f.gesture.key({ keycode: 1 }); f.gesture.key({ keycode: 42 }); assert.deepEqual(f.calls, ['convert', 'tools', 'close']);
});
