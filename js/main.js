// Main entry point for OK Shuttumani
import { CONFIG } from './config.js';
import { VoxelRenderer } from './voxelRenderer.js';
import { GameEngine } from './game.js';
import { UIManager } from './ui.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  // Handle High DPI displays and crisp pixel scaling
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CONFIG.ARENA.WIDTH * dpr;
    canvas.height = CONFIG.ARENA.HEIGHT * dpr;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Initialize Voxel Renderer
  const voxelRenderer = new VoxelRenderer(ctx, CONFIG.ARENA.WIDTH, CONFIG.ARENA.HEIGHT);

  let uiManager;

  // Initialize Game Engine
  const game = new GameEngine(
    canvas,
    voxelRenderer,
    (newState, payload) => {
      // State transition callback
      if (newState === 'PLAYING') {
        uiManager.showScreen('game');
        uiManager.showPauseModal(false);
      } else if (newState === 'PAUSED') {
        uiManager.showPauseModal(true);
      } else if (newState === 'RESULTS') {
        uiManager.showResults(payload);
      }
    },
    (hudData) => {
      // HUD update callback
      uiManager.updateHUD(hudData);
    }
  );

  // Initialize UI Manager
  uiManager = new UIManager(game);

  // Main Animation / Game Loop
  let lastTimestamp = performance.now();

  function loop(timestamp) {
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1); // clamp delta
    lastTimestamp = timestamp;

    game.update(dt);
    game.render();
    uiManager.updateAvatarShowcase(game.renderer.time);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
});
