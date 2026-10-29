# OK Shuttumani

Name inspired from OK Kanmani tamil movie by Mani Ratnam >.<
A cute, whimsical, Minecraft/voxel-inspired friendship arcade game created as a heartfelt birthday gift for friend.

## Live Demo

Play the game here: https://ok-shuttumani.vercel.app/

## Game Concept & Rules

OK Shuttumani is a mobile-first browser arcade game.

1. Posh's Character (Right): Wears a royal lavender/purple and pink saree with a pink/magenta border, long dark brown hair, and large expressive eyes.
2. Iba's Automated Character (Left): Wears a vibrant lime-green saree with a magenta border, long dark brown hair, and large expressive eyes.
3. Heart Collection:
   - Pink Hearts: Represent Iba's love for Posh and are collected by Posh.
   - Purple Hearts: Represent Posh's love for Iba and are collected by Iba.
4. Bestie Sync: A glowing golden heart appears periodically in the arena. When Posh and Iba meet at the golden heart, it triggers Bestie Sync with a golden burst and awards a shared +50 bonus to both scores.
5. Aerial Obstacles: Mischievous voxel pigeons, drifting mushroom clouds, and hot-air balloons. Bumping into an obstacle causes a temporary slowdown of approximately 1.2 seconds without ending the round.
6. 40-Second Round: The results screen reveals the winner or a tie, with custom messages. A five-second voxel envelope-opening animation reveals Iba's personalized birthday letter.

## Running Locally

### Option 1: Using Node.js

1. Open a terminal in the project folder.
2. Run:

   ```bash
   npm start
   ```

3. Open http://localhost:3000 in your browser.

### Option 2: VS Code Live Server

Right-click `index.html` in VS Code and select "Open with Live Server".

## Deployment

The game is deployed on Vercel as a static website. It uses vanilla HTML, CSS, JavaScript, and the HTML5 Canvas API, with no external runtime dependencies.

To deploy updates, redeploy the project through Vercel.

## Project Architecture

- `index.html`: Mobile viewport configuration, HUD, canvas container, overlays, and virtual controls.
- `style.css`: Sunset colour palette, responsive HUD, glassmorphism, and envelope-opening animation.
- `js/config.js`: Round duration, score points, letter text, and results dialogue.
- `js/audio.js`: Built-in Web Audio API chiptune music and sound effects.
- `js/voxelRenderer.js`: 2.5D voxel rendering engine for floating sunset islands, blocky clouds, chibi characters, voxel hearts, and obstacles.
- `js/bot.js`: Bot AI for Iba, including obstacle avoidance and Bestie Sync pursuit.
- `js/game.js`: Core game loop, collision detection, round timer, and scoring.
- `js/ui.js`: Touch virtual joystick, HUD updates, pause handling, results, and birthday letter reveal.
- `server.js`: Lightweight static server for local development.
