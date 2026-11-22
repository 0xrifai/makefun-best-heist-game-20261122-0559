// input.js — keyboard and mouse, in one place.
// WASD or arrows move; 1 / Q smoke bomb, 2 / E camera jammer; M mute, P pause,
// R restart the level, Enter confirms on menus. Clicking the play area sets a
// move target; clicking a HUD tool button fires that tool.

export function makeInput() {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    pressed: new Set(), // keys pressed since the last frame was consumed
    click: null, // {x, y} in canvas pixels, consumed by the game loop
    toolClick: null, // 'smoke' | 'jammer' when a HUD button was clicked
  };
}

const KEYMAP = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
};

export function bindInput(input, canvas, onFirstGesture) {
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    const dir = KEYMAP[e.code];
    if (dir) input[dir] = true;
    if (!e.repeat) input.pressed.add(e.code);
    if (onFirstGesture) onFirstGesture();
  });
  window.addEventListener('keyup', (e) => {
    const dir = KEYMAP[e.code];
    if (dir) input[dir] = false;
  });
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    input.click = { x, y };
    if (onFirstGesture) onFirstGesture();
  });
  window.addEventListener('blur', () => {
    input.up = input.down = input.left = input.right = false;
  });
}

// Returns true once per physical press; the game loop clears it each frame.
export function wasPressed(input, code) {
  return input.pressed.has(code);
}

export function endFrame(input) {
  input.pressed.clear();
  input.click = null;
  input.toolClick = null;
}
