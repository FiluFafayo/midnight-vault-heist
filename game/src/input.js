// Keyboard and mouse input for Midnight Vault Heist.
// WASD or arrows to move, Shift to sneak, E to crack a vault or safe,
// 1 for smoke, 2 for EMP, click to toss a coin, P to pause, R to retry.
export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.mouse = { x: 0, y: 0, clicked: null };
    this.pressed = new Set(); // edge-triggered keys, consumed each frame
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (!e.repeat) this.pressed.add(e.key.toLowerCase());
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      this.mouse.y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    });
    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.clicked = {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      };
    });
    window.addEventListener('blur', () => this.keys.clear());
  }

  axis() {
    let x = 0;
    let y = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;
    if (x !== 0 && y !== 0) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }
    return { x, y };
  }

  get sneaking() {
    return this.keys.has('shift');
  }

  get cracking() {
    return this.keys.has('e');
  }

  // True once, on the frame the key went down.
  wasPressed(key) {
    return this.pressed.has(key.toLowerCase());
  }

  takeClick() {
    const c = this.mouse.clicked;
    this.mouse.clicked = null;
    return c;
  }

  endFrame() {
    this.pressed.clear();
  }
}
