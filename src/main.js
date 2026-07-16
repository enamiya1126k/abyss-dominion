import { GAME_VERSION } from "./game/config.js";
import { SceneManager } from "./game/sceneManager.js";
import { SaveManager } from "./game/saveManager.js";
import { InputManager } from "./game/inputManager.js";
import { Camera } from "./game/camera.js";

const root = document.querySelector("#sceneRoot");
const nav = document.querySelector(".bottom-navigation");
const fps = document.querySelector("#fpsDisplay");
document.querySelector("#versionDisplay").textContent = `v${GAME_VERSION}`;

const save = new SaveManager();
const input = new InputManager();
const camera = new Camera();
const scenes = new SceneManager(root);

const page = (title, text) => `
<section class="scene is-active foundation-scene">
  <div class="foundation-content">
    <div class="panel">
      <p class="app-eyebrow">FOUNDATION BUILD</p>
      <h2>${title}</h2>
      <p class="sub">${text}</p>
    </div>
  </div>
</section>`;

scenes.register("home", () => `
<section class="scene is-active foundation-scene">
  <div class="foundation-content">
    <div class="panel foundation-hero">
      <p class="app-eyebrow">v${GAME_VERSION}</p>
      <h2>基盤システム起動</h2>
      <p class="sub">シーン・入力・カメラ・セーブ・FPS計測が接続済み。</p>
      <button id="exploreTestBtn" class="bigButton">探索入力テスト</button>
    </div>
    <div class="foundation-grid">
      <article class="card"><span class="sub">現在階層</span><strong>${save.data.floor}</strong></article>
      <article class="card"><span class="sub">最高到達</span><strong>${save.data.maxFloor}</strong></article>
      <article class="card"><span class="sub">GOLD</span><strong>${save.data.gold}</strong></article>
      <article class="card"><span class="sub">魔晶石</span><strong>${save.data.magicCrystals}</strong></article>
    </div>
  </div>
</section>`);

scenes.register("monsters", () => page("モンスター", "検索・編成・育成をここへ追加する。"));
scenes.register("equipment", () => page("装備", "武器・防具・アクセサリーをここへ追加する。"));
scenes.register("shop", () => page("ショップ", "購入・売却・安全部屋をここへ追加する。"));
scenes.register("settings", () => page("設定", "演出・速度・セーブ設定をここへ追加する。"));
scenes.register("explore", () => `
<section class="scene is-active foundation-scene">
  <div class="foundation-content">
    <div class="panel">
      <p class="app-eyebrow">INPUT TEST</p>
      <h2>探索入力テスト</h2>
      <div class="camera-readout">
        <span>X <b id="camX">0</b></span>
        <span>Y <b id="camY">0</b></span>
        <span>ZOOM <b id="camZ">1.00</b></span>
      </div>
      <div id="inputArea" class="input-test-area">1本指ドラッグ<br>2本指ピンチ<br>ダブルタップで復帰</div>
      <button id="homeBtn" class="bigButton">ホームへ</button>
    </div>
  </div>
</section>`);

function updateCamera() {
  document.querySelector("#camX")?.replaceChildren(document.createTextNode(camera.x.toFixed(0)));
  document.querySelector("#camY")?.replaceChildren(document.createTextNode(camera.y.toFixed(0)));
  document.querySelector("#camZ")?.replaceChildren(document.createTextNode(camera.zoom.toFixed(2)));
}

scenes.onChange((name) => {
  document.querySelectorAll(".nav-button").forEach((b) => {
    b.classList.toggle("is-active", b.dataset.nav === name || (name === "explore" && b.dataset.nav === "home"));
  });

  if (name === "home") {
    document.querySelector("#exploreTestBtn")?.addEventListener("click", () => scenes.show("explore"));
  }

  if (name === "explore") {
    document.querySelector("#homeBtn")?.addEventListener("click", () => scenes.show("home"));
    const area = document.querySelector("#inputArea");
    input.attach(area, {
      onPan: ({ deltaX, deltaY }) => { camera.panBy(-deltaX, -deltaY); updateCamera(); },
      onPinch: ({ scale }) => { camera.zoomBy(scale); updateCamera(); },
      onDoubleTap: () => { camera.reset(); updateCamera(); }
    });
    updateCamera();
  }
});

nav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-nav]");
  if (button) scenes.show(button.dataset.nav);
});

let frames = 0;
let started = performance.now();
function loop(now) {
  frames++;
  if (now - started >= 500) {
    fps.textContent = `${Math.round(frames * 1000 / (now - started))} FPS`;
    frames = 0;
    started = now;
  }
  requestAnimationFrame(loop);
}

window.addEventListener("beforeunload", () => {
  save.flush();
  input.detach();
});

scenes.show("home");
requestAnimationFrame(loop);
