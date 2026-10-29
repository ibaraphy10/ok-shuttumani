# OK Shuttumani 💖✨

A cute, whimsical, Minecraft/voxel-inspired friendship arcade game created as a heartfelt birthday gift for Posh by Iba.

---

## 🎮 Game Concept & Rules

OK Shuttumani is a mobile-first browser arcade game:
1. **Posh's Character (Right)**: Wears a royal lavender/purple and pink saree with a pink/magenta border, long dark brown hair, and large expressive eyes.
2. **Iba's Automated Character (Left)**: Wears a vibrant lime-green saree with a magenta border, long dark brown hair, and large expressive eyes.
3. **Heart Collection**:
   - **Pink Hearts**: Represent Iba's love for Posh (collected by Posh!).
   - **Purple Hearts**: Represent Posh's love for Iba (collected by Iba!).
4. **Bestie Sync ⭐**:
   - A glowing golden heart appears periodically in the arena.
   - When Posh and Iba meet at the golden heart, it triggers **Bestie Sync** with a golden burst and awards a shared **+50 bonus** to both scores!
5. **Aerial Obstacles**:
   - Mischievous voxel pigeons, drifting mushroom clouds, and hot-air balloons.
   - Bumping into an obstacle causes a gentle temporary slowdown (~1.2s) without ending the run.
6. **40-Second Round**:
   - Results screen reveals the actual winner or mutual obsession tie with custom messages.
   - A cute 5-second voxel envelope opening animation reveals Iba's personalized birthday letter!

---

## 🚀 Running Locally

### Option 1: Using Node.js (Recommended)
1. Open terminal in this folder:
   ```bash
   npm start
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Option 2: VS Code Live Server
Right-click `index.html` in VS Code and select **"Open with Live Server"**.

---

## 🌐 Deploying to Vercel (100% Free & Instant)

This game is built with zero-dependency vanilla HTML5/Canvas/CSS/JS, making static deployment to Vercel seamless:

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial OK Shuttumani Game"
   git branch -M main
   git remote add origin https://github.com/<your-username>/ok-shuttumani.git
   git push -u origin main
   ```
2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **Add New Project** and select your GitHub repository.
   - Framework Preset: **Other** (leave Root Directory as `./` and Build Command empty).
   - Click **Deploy**.
3. Your live link will be generated (e.g. `https://ok-shuttumani.vercel.app`) ready for Posh to play on her phone!

---

## 🎨 Project Architecture
- `index.html`: Mobile viewport configuration, HUD, canvas container, overlays, and virtual controls.
- `style.css`: Sunset palette (`#ff9671`, `#ffc75f`, `#e492c6`, `#ffd152`), responsive HUD, glassmorphism, envelope opening animation.
- `js/config.js`: Round duration (40s), score points, letter text, results dialogue.
- `js/audio.js`: Built-in Web Audio API chiptune music and sound effects (zero external audio files needed).
- `js/voxelRenderer.js`: 2.5D voxel rendering engine for floating sunset islands, blocky clouds, chibi characters, voxel hearts, and obstacles.
- `js/bot.js`: Fair, predictable bot AI for Iba with obstacle avoidance and sync pursuit.
- `js/game.js`: Core game loop, collision detection, round timer, scoring.
- `js/ui.js`: Touch virtual joystick, HUD meter updates, pause handling, results, and letter reveal.
- `server.js`: Zero-dependency static server for local development.
