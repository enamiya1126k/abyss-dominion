import { GAME_VERSION } from "./game/config.js";
import { SceneManager } from "./game/sceneManager.js";
import { SaveManager } from "./game/saveManager.js";
import { InputManager } from "./game/inputManager.js";
import { ExploreScene } from "./game/exploreScene.js";

const sceneRoot = document.querySelector("#sceneRoot");
const nav = document.querySelector(".bottom-navigation");
const fps = document.querySelector("#fpsDisplay");
document.querySelector("#versionDisplay").textContent = `v${GAME_VERSION}`;

const save = new SaveManager();
const input = new InputManager();
const scenes = new SceneManager(sceneRoot);
let exploreScene = null;

const homeTemplate = () => `
<section class="scene is-active foundation-scene">
  <div class="foundation-content">
    <div class="panel foundation-hero">
      <p class="app-eyebrow">EXPLORE BUILD</p>
      <h2>地下探索</h2>
      <p class="sub">迷路を自由に探索し、宝箱と階段を探す。</p>
      <button id="startExploreBtn" class="bigButton">探索開始</button>
    </div>
    <div class="foundation-grid">
      <article class="card"><span class="sub">現在階層</span><strong>${save.data.floor}</strong></article>
      <article class="card"><span class="sub">最高到達</span><strong>${save.data.maxFloor}</strong></article>
      <article class="card"><span class="sub">GOLD</span><strong>${save.data.gold}</strong></article>
      <article class="card"><span class="sub">魔晶石</span><strong>${save.data.magicCrystals}</strong></article>
    </div>
  </div>
</section>`;

const placeholder = (title) => `
<section class="scene is-active foundation-scene">
  <div class="foundation-content">
    <div class="panel">
      <p class="app-eyebrow">COMING NEXT</p>
      <h2>${title}</h2>
      <p class="sub">次のアップデートで実装する。</p>
    </div>
  </div>
</section>`;

scenes.register("home", homeTemplate);
scenes.register("monsters", () => placeholder("モンスター"));
scenes.register("equipment", () => placeholder("装備"));
scenes.register("shop", () => placeholder("ショップ"));
scenes.register("settings", () => placeholder("設定"));
scenes.register("explore", () => `
<section class="scene is-active explore-scene">
  <div class="explore-hud">
    <span>FLOOR <b id="exploreFloor">${save.data.floor}</b></span>
    <span>タップ移動 / ドラッグ / ピンチ</span>
  </div>
  <canvas id="dungeonCanvas" class="dungeon-canvas"></canvas>
  <canvas id="minimapCanvas" class="minimap-canvas"></canvas>
  <button id="leaveExploreBtn" class="leave-explore">帰還</button>
</section>`);

scenes.onChange((name) => {
  exploreScene?.stop();
  exploreScene = null;

  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle(
      "is-active",
      button.dataset.nav === name || (name === "explore" && button.dataset.nav === "home")
    );
  });

  if (name === "home") {
    document.querySelector("#startExploreBtn")?.addEventListener("click", () => scenes.show("explore"));
  }

  if (name === "explore") {
    document.querySelector("#leaveExploreBtn")?.addEventListener("click", () => scenes.show("home"));
    exploreScene = new ExploreScene({
      canvas: document.querySelector("#dungeonCanvas"),
      minimapCanvas: document.querySelector("#minimapCanvas"),
      inputManager: input,
      onFloorClear: () => {
        save.update({
          floor: save.data.floor + 1,
          maxFloor: Math.max(save.data.maxFloor, save.data.floor + 1),
        });
        exploreScene?.stop();
        exploreScene = new ExploreScene({
          canvas: document.querySelector("#dungeonCanvas"),
          minimapCanvas: document.querySelector("#minimapCanvas"),
          inputManager: input,
          onFloorClear: () => scenes.show("explore"),
        });
        scenes.show("explore");
      },
    });
    exploreScene.start();
  }
});

nav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-nav]");
  if (button) scenes.show(button.dataset.nav);
});

window.addEventListener("abyss:toast", (event) => {
  const root = document.querySelector("#toastRoot");
  root.textContent = event.detail;
  root.classList.add("toast-visible");
  clearTimeout(window.__abyssToastTimer);
  window.__abyssToastTimer = setTimeout(() => {
    root.classList.remove("toast-visible");
  }, 1200);
});

let frames = 0;
let started = performance.now();
function fpsLoop(now) {
  frames++;
  if (now - started >= 500) {
    fps.textContent = `${Math.round(frames * 1000 / (now - started))} FPS`;
    frames = 0;
    started = now;
  }
  requestAnimationFrame(fpsLoop);
}

scenes.show("home");
requestAnimationFrame(fpsLoop);
