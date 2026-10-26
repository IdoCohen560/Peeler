'use strict';
// Global modifier recognition is separate from OS drag/drop payload handling.
function createGesture({ platform = process.platform, open, close, release }) {
  let down, dragging = false, armed = false;
  return {
    down(event) { if (event.button === 1) { down = event; dragging = false; } },
    move(event) { if (down && Math.hypot(event.x - down.x, event.y - down.y) >= 8) dragging = true; },
    key(event) {
      if (event.keycode === 1) { down = undefined; dragging = false; armed = false; close(); return; }
      if (!down || !dragging) return;
      const mode = event.keycode === 42 ? 'convert' : (platform === 'darwin' ? [3675, 3676].includes(event.keycode) : event.keycode === 56) ? 'tools' : undefined;
      if (mode) { armed = true; open(mode); }
    },
    up(event) { if (event.button === 1) { down = undefined; dragging = false; if (armed) release(); armed = false; } }
  };
}
module.exports = { createGesture };
