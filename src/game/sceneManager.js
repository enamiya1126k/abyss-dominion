export class SceneManager {
  constructor(root) {
    if (!(root instanceof HTMLElement)) throw new TypeError("Scene root is invalid.");
    this.root = root;
    this.scenes = new Map();
    this.listeners = new Set();
  }

  register(name, render) {
    this.scenes.set(name, render);
  }

  show(name) {
    const render = this.scenes.get(name);
    if (!render) throw new Error(`Unknown scene: ${name}`);
    this.root.innerHTML = render();
    this.listeners.forEach((listener) => listener(name));
  }

  onChange(listener) {
    this.listeners.add(listener);
  }
}
