// Voxel Art Renderer for OK Shuttumani
// Renders sunset fantasy floating island, chibi voxel characters, collectibles, and obstacles

import { CONFIG } from './config.js';

export class VoxelRenderer {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.time = 0;

    // Background floating clouds
    this.bgClouds = [
      { x: 30, y: 70, speed: 8, scale: 0.9, color: 'rgba(255, 230, 240, 0.75)' },
      { x: 220, y: 130, speed: 5, scale: 1.2, color: 'rgba(235, 205, 245, 0.7)' },
      { x: 120, y: 390, speed: 7, scale: 0.8, color: 'rgba(255, 220, 225, 0.65)' },
      { x: 310, y: 440, speed: 6, scale: 1.0, color: 'rgba(240, 210, 250, 0.6)' },
    ];

    // Island pastel flowers & crystal blossom shrubs (no green grass/trees)
    this.decorations = [
      { x: 55, y: 65, type: 'flower', color: '#ff7597' },
      { x: 345, y: 75, type: 'flower', color: '#ffd152' },
      { x: 50, y: 460, type: 'flower', color: '#f8a5c2' },
      { x: 350, y: 450, type: 'flower', color: '#c996cc' },
      { x: 42, y: 250, type: 'tree', leafColor: '#fca5be', trunkColor: '#5c3d4e' },
      { x: 355, y: 270, type: 'tree', leafColor: '#d8b2e5', trunkColor: '#5c3d4e' },
    ];
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
  }

  update(dt) {
    this.time += dt;

    // Drifting clouds
    this.bgClouds.forEach(cloud => {
      cloud.x += cloud.speed * dt;
      if (cloud.x > this.width + 80) {
        cloud.x = -80;
      }
    });
  }

  // Draw an isometric / pseudo-3D voxel block
  drawVoxelBlock(x, y, w, h, depth, topColor, frontColor, rightColor) {
    const ctx = this.ctx;

    // Front Face
    ctx.fillStyle = frontColor;
    ctx.fillRect(x, y, w, h);

    // Top Face (trapezoid / angled)
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + depth, y - depth * 0.7);
    ctx.lineTo(x + w + depth, y - depth * 0.7);
    ctx.lineTo(x + w, y);
    ctx.closePath();
    ctx.fill();

    // Right Face
    ctx.fillStyle = rightColor;
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w + depth, y - depth * 0.7);
    ctx.lineTo(x + w + depth, y + h - depth * 0.7);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
  }

  // Render the sunset sky with atmospheric softness on distant scenery
  renderBackground() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Warm Sunset Sky Gradient (Peach -> Soft Gold -> Sunset Pink -> Soft Lavender -> Twilight Purple)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#ff9671');   // Warm peach
    skyGrad.addColorStop(0.30, '#ffc75f'); // Soft golden sunlight
    skyGrad.addColorStop(0.60, '#f9be9b'); // Warm peach-pink glow
    skyGrad.addColorStop(0.82, '#e492c6'); // Dreamy sunset pink-lavender
    skyGrad.addColorStop(1, '#a17fe0');    // Soft lavender dusk atmosphere
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Distant scenery rendered with gentle atmospheric softness / blur
    ctx.save();
    const hasFilter = typeof ctx.filter !== 'undefined';
    if (hasFilter) {
      ctx.filter = 'blur(1.6px)';
    }

    // Golden Sunset Sun (blocky voxel style with soft halo)
    const sunX = w * 0.5;
    const sunY = 55;
    const sunPulse = Math.sin(this.time * 1.5) * 2;
    ctx.fillStyle = 'rgba(255, 248, 220, 0.35)';
    ctx.fillRect(sunX - 34 - sunPulse, sunY - 34 - sunPulse, 68 + sunPulse * 2, 68 + sunPulse * 2);
    ctx.fillStyle = '#fff4cc';
    ctx.fillRect(sunX - 22, sunY - 22, 44, 44);

    // Floating Clouds (distant, gentle)
    this.bgClouds.forEach(cloud => {
      this.drawVoxelCloud(cloud.x, cloud.y, cloud.scale, cloud.color);
    });

    // Distant floating mini islands in background (pastel tops, zero green)
    this.drawMiniFloatingIsland(w * 0.15, 110, 38, 14);
    this.drawMiniFloatingIsland(w * 0.85, 140, 44, 16);

    ctx.restore();
    if (hasFilter) {
      ctx.filter = 'none';
    }
  }

  drawVoxelCloud(x, y, scale = 1, color = 'rgba(255, 235, 245, 0.8)') {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;

    // Blocky cloud clusters
    ctx.fillRect(-24, 0, 48, 14);
    ctx.fillRect(-16, -10, 32, 10);
    ctx.fillRect(-6, -18, 16, 8);
    ctx.fillRect(8, 6, 20, 8);
    ctx.fillRect(-28, 4, 12, 8);

    // Subtle cloud highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(-14, -8, 24, 4);

    ctx.restore();
  }

  drawMiniFloatingIsland(x, y, w, h) {
    const ctx = this.ctx;
    ctx.save();
    // Pastel lavender-pink surface (no green)
    ctx.fillStyle = '#e5b8d8';
    ctx.fillRect(x - w / 2, y, w, 4);
    ctx.fillStyle = '#ffd6c9';
    ctx.fillRect(x - w / 2, y, w, 1);

    // Tapered terracotta-mauve underside
    ctx.fillStyle = '#5c3850';
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y + 4);
    ctx.lineTo(x + w / 2, y + 4);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();

    // Cute tiny crystal tip
    ctx.fillStyle = '#f8b4d9';
    ctx.fillRect(x - 1, y + h - 2, 2, 3);
    ctx.restore();
  }

  // Render the Main Floating Arena Island - Dreamy Pastel Voxel Platform
  renderIsland(arena) {
    const ctx = this.ctx;
    const ax = arena.PADDING;
    const ay = arena.PADDING + 10;
    const aw = arena.WIDTH - arena.PADDING * 2;
    const ah = arena.HEIGHT - arena.PADDING * 2 - 20;

    // 1. Soft Floating Island Shadow below platform
    ctx.fillStyle = 'rgba(50, 18, 45, 0.24)';
    ctx.beginPath();
    ctx.ellipse(ax + aw / 2, ay + ah + 24, aw * 0.52, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle warm sunset halo glow around floating island
    ctx.strokeStyle = 'rgba(255, 230, 210, 0.35)';
    ctx.lineWidth = 4;
    ctx.strokeRect(ax - 3, ay - 3, aw + 6, ah + 6);

    // 2. Underside: Tapered 3D voxel floating island in rich warm mauve & terracotta
    const dirtTop = ay + ah;
    ctx.fillStyle = '#54314c'; // Rich warm terracotta-mauve core
    ctx.fillRect(ax + 8, dirtTop, aw - 16, 12);
    ctx.fillStyle = '#42243c'; // Shaded lower rock
    ctx.fillRect(ax + 24, dirtTop + 12, aw - 48, 10);
    ctx.fillStyle = '#30172c'; // Deep core underside
    ctx.fillRect(ax + 54, dirtTop + 22, aw - 108, 8);

    // Hanging pastel glowing crystal shards & vines (replaces green moss!)
    ctx.fillStyle = '#f8b4d9'; // Soft pink crystal
    ctx.fillRect(ax + 36, dirtTop + 8, 5, 14);
    ctx.fillStyle = '#e8c2f8'; // Lavender crystal
    ctx.fillRect(ax + 105, dirtTop + 10, 6, 17);
    ctx.fillStyle = '#ffd4c7'; // Peach crystal
    ctx.fillRect(ax + aw - 75, dirtTop + 8, 5, 13);
    ctx.fillStyle = '#f8b4d9';
    ctx.fillRect(ax + aw - 130, dirtTop + 11, 4, 15);

    // 3. Island Rim - Soft warm cream & peach boundary step (clearly defines boundary)
    ctx.fillStyle = '#ffdcc7'; // Warm peach outer step
    ctx.fillRect(ax - 2, ay - 2, aw + 4, ah + 6);
    ctx.fillStyle = '#f5cbbe';
    ctx.fillRect(ax - 1, ay + ah - 1, aw + 2, 4);

    // 4. Dreamy Pastel Surface (Muted lavender, dusty pink, and soft peach tones)
    // Smooth layered pastel gradient base
    const surfaceGrad = ctx.createLinearGradient(ax, ay, ax + aw, ay + ah);
    surfaceGrad.addColorStop(0, '#f8ded4');    // Soft peach top-left
    surfaceGrad.addColorStop(0.45, '#eec4da'); // Dusty pink center
    surfaceGrad.addColorStop(1, '#dab8e5');    // Muted lavender bottom-right
    ctx.fillStyle = surfaceGrad;
    ctx.fillRect(ax, ay, aw, ah);

    // Sunlit warm peach & cream highlight on top & left rim
    ctx.fillStyle = '#fff2e8';
    ctx.fillRect(ax, ay, aw, 4);
    ctx.fillRect(ax, ay, 4, ah);

    // Soft gentle lavender shadow along bottom & right inner edge
    ctx.fillStyle = '#c79ecf';
    ctx.fillRect(ax, ay + ah - 4, aw, 4);
    ctx.fillRect(ax + aw - 4, ay, 4, ah);

    // 5. Subtle Minecraft-inspired voxel block geometry (Minimal texture, NO chessboard)
    // Softly shaded voxel paving blocks with very gentle 1px bevel / 4% opacity tint
    const blockSize = 28;
    const cols = Math.floor(aw / blockSize);
    const rows = Math.floor(ah / blockSize);
    const offX = (aw - cols * blockSize) / 2;
    const offY = (ah - rows * blockSize) / 2;

    ctx.save();
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const bx = ax + offX + i * blockSize;
        const by = ay + offY + j * blockSize;
        // Subtle block highlight top-left
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(bx + 1, by + 1, blockSize - 2, 1);
        ctx.fillRect(bx + 1, by + 1, 1, blockSize - 2);

        // Subtle block shadow bottom-right
        ctx.fillStyle = 'rgba(100, 45, 95, 0.05)';
        ctx.fillRect(bx + 1, by + blockSize - 2, blockSize - 2, 1);
        ctx.fillRect(bx + blockSize - 2, by + 1, 1, blockSize - 2);

        // Staggered delicate pastel pixel speck
        if ((i * 3 + j * 5) % 4 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
          ctx.fillRect(bx + 10, by + 10, 3, 3);
        }
      }
    }
    ctx.restore();

    // 6. Clearly defined subtle outline to establish arena boundaries
    ctx.strokeStyle = '#ffdfba'; // Soft golden-peach boundary
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ax, ay, aw, ah);

    ctx.strokeStyle = 'rgba(215, 170, 225, 0.5)';
    ctx.lineWidth = 1.0;
    ctx.strokeRect(ax + 1.5, ay + 1.5, aw - 3, ah - 3);

    // Render Corner Pastel Trees & Flowers
    this.decorations.forEach(dec => {
      if (dec.type === 'flower') {
        this.drawVoxelFlower(dec.x, dec.y, dec.color);
      } else if (dec.type === 'tree') {
        this.drawVoxelTree(dec.x, dec.y, dec.leafColor, dec.trunkColor);
      }
    });
  }

  drawVoxelFlower(x, y, color) {
    const ctx = this.ctx;
    ctx.fillStyle = '#b58ebb'; // Soft pastel lavender stem (no green!)
    ctx.fillRect(x + 2, y + 4, 2, 6);
    ctx.fillStyle = color;     // Dusty pink / golden petals
    ctx.fillRect(x, y, 6, 4);
    ctx.fillStyle = '#fffdf5'; // Warm cream center
    ctx.fillRect(x + 2, y + 1, 2, 2);
  }

  drawVoxelTree(x, y, leafColor, trunkColor = '#5c3d4e') {
    const ctx = this.ctx;
    // Rosewood trunk
    ctx.fillStyle = trunkColor;
    ctx.fillRect(x - 2, y, 6, 12);
    // Pastel Blossom / Crystal foliage
    ctx.fillStyle = leafColor;
    ctx.fillRect(x - 8, y - 14, 18, 14);
    ctx.fillStyle = '#fff5f8'; // Warm cream sunlit rim
  }

  // ==========================================
  // CHARACTER RENDERING (IBA & POSH)
  // Matching character-reference.png specifications
  // ==========================================

  drawCharacter(char, isPlayer = false) {
    const ctx = this.ctx;
    const { x, y, name, direction, isMoving, isStunned, stunType, isCelebrating, hasSpeedBoost, recoilX = 0, recoilY = 0 } = char;

    ctx.save();
    ctx.translate(x + recoilX, y + recoilY);

    // Movement & Idle bobbing animation (faster if speed boosted)
    const animSpeed = hasSpeedBoost ? 20 : 14;
    const bob = isMoving ? Math.sin(this.time * animSpeed) * 3 : Math.sin(this.time * 4) * 1.5;
    const legSwing = isMoving ? Math.sin(this.time * animSpeed) * 4 : 0;
    const armSwing = isMoving ? Math.sin(this.time * animSpeed) * 4 : 0;

    // Flip horizontally when facing left
    const facingLeft = direction && direction.x < -0.1;
    if (facingLeft) {
      ctx.scale(-1, 1);
    }

    // 1. Drop shadow on arena platform
    ctx.fillStyle = 'rgba(50, 20, 50, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 13, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Speed Boost Radiant Aura (Golden-pink pulse)
    if (hasSpeedBoost) {
      const auraPulse = Math.sin(this.time * 12) * 3;
      ctx.fillStyle = 'rgba(255, 215, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(0, 2, 18 + auraPulse, 20 + auraPulse, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 107, 157, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Stunned indicator (comic stars or puff cloud floating above head)
    if (isStunned) {
      if (stunType === 'mushroom') {
        // Soft purple spore cloud over head
        ctx.fillStyle = 'rgba(186, 104, 200, 0.7)';
        ctx.beginPath();
        ctx.arc(-6, -26, 6, 0, Math.PI * 2);
        ctx.arc(6, -26, 6, 0, Math.PI * 2);
        ctx.arc(0, -30, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Comic stars spinning
        const starAngle = this.time * 8;
        ctx.fillStyle = '#ffd152';
        for (let s = 0; s < 3; s++) {
          const sx = Math.cos(starAngle + (s * Math.PI * 2) / 3) * 14;
          const sy = -28 + Math.sin(starAngle + (s * Math.PI * 2) / 3) * 5;
          ctx.fillRect(sx - 2, sy - 2, 4, 4);
          ctx.fillStyle = (s % 2 === 0) ? '#ff6b9d' : '#ffd152';
        }
      }
    }

    // Celebration jump (synchronized joyful jump for Bestie Sync)
    const jumpOffset = isCelebrating ? -Math.abs(Math.sin(this.time * 14)) * 14 : bob;

    // Golden glow during Bestie Sync
    if (isCelebrating) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.translate(0, jumpOffset);

    if (name === 'Iba') {
      this.drawIbaVoxel(legSwing, armSwing, isCelebrating);
    } else {
      this.drawPoshVoxel(legSwing, armSwing, isCelebrating);
    }

    ctx.restore();

    // Name badge & indicator above character (includes speed boost tag if active)
    this.drawNameTag(x + recoilX, y + jumpOffset - 30, name, isPlayer, hasSpeedBoost);
  }

  // Draw IBA: Green/lime saree with magenta border, long dark brown hair, large expressive brown eyes
  drawIbaVoxel(legSwing, armSwing, isCelebrating) {
    const ctx = this.ctx;

    // --- LEGS / FEET ---
    ctx.fillStyle = '#e0a96d'; // Skin tone
    ctx.fillRect(-7, 10 + legSwing, 4, 6);
    ctx.fillRect(3, 10 - legSwing, 4, 6);
    ctx.fillStyle = '#b76e79'; // Cute sandals
    ctx.fillRect(-8, 14 + legSwing, 6, 3);
    ctx.fillRect(2, 14 - legSwing, 6, 3);

    // --- LONG DARK BROWN HAIR (BACK LAYER) ---
    ctx.fillStyle = '#3a2012'; // Rich dark brown
    ctx.fillRect(-12, -18, 24, 26);
    ctx.fillRect(-10, 8, 20, 6); // Extra long hair hanging down back

    // --- SAREE BODY & PLEATS (Green/Lime Saree with Magenta Border) ---
    // Saree base (lime/green)
    ctx.fillStyle = '#52b75a';
    ctx.fillRect(-9, -2, 18, 14);

    // Saree shading
    ctx.fillStyle = '#429e4a';
    ctx.fillRect(-9, 5, 18, 7);

    // Magenta border trim at hem
    ctx.fillStyle = '#e8397a';
    ctx.fillRect(-9, 10, 18, 3);
    // Gold zari highlight line
    ctx.fillStyle = '#ffe082';
    ctx.fillRect(-9, 9, 18, 1);

    // Saree Pallu (draped diagonally across body in magenta/gold)
    ctx.fillStyle = '#e8397a';
    ctx.beginPath();
    ctx.moveTo(-9, -2);
    ctx.lineTo(8, 6);
    ctx.lineTo(8, 10);
    ctx.lineTo(-9, 2);
    ctx.closePath();
    ctx.fill();

    // Cute green blouse sleeve
    ctx.fillStyle = '#52b75a';
    ctx.fillRect(-11, -2, 3, 5);

    // --- ARMS & HANDS ---
    ctx.fillStyle = '#e0a96d'; // Skin
    const armY = isCelebrating ? -8 : 0;
    // Left arm
    ctx.fillRect(-11, 2 + armSwing + armY, 3, 6);
    // Right arm (waving / holding)
    ctx.fillRect(8, 2 - armSwing + armY, 3, 6);
    // Golden bangles
    ctx.fillStyle = '#ffd152';
    ctx.fillRect(-11, 4 + armSwing + armY, 3, 2);
    ctx.fillRect(8, 4 - armSwing + armY, 3, 2);

    // --- HEAD & FACE (Cute Chibi Proportions) ---
    // Skin face cube
    ctx.fillStyle = '#fad4af';
    ctx.fillRect(-10, -20, 20, 18);

    // Long dark brown hair (front bangs & side locks)
    ctx.fillStyle = '#3a2012';
    ctx.fillRect(-11, -22, 22, 6);   // Top bangs
    ctx.fillRect(-11, -16, 3, 14);   // Left lock
    ctx.fillRect(8, -16, 3, 14);    // Right lock

    // Small golden jhumka / earring
    ctx.fillStyle = '#ffd152';
    ctx.fillRect(-12, -10, 2, 4);
    ctx.fillRect(10, -10, 2, 4);

    // Tiny cute bindi (magenta)
    ctx.fillStyle = '#e8397a';
    ctx.fillRect(-1, -15, 2, 2);

    // Large Expressive Brown Eyes (chibi sparkle)
    // Eye whites
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-7, -13, 5, 6);
    ctx.fillRect(2, -13, 5, 6);

    // Rich Brown Irises
    ctx.fillStyle = '#4a2511';
    ctx.fillRect(-6, -13, 4, 5);
    ctx.fillRect(3, -13, 4, 5);

    // Cute Eye Highlights / Catchlights
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, -13, 2, 2);
    ctx.fillRect(3, -13, 2, 2);
    ctx.fillRect(-4, -10, 1, 1);
    ctx.fillRect(5, -10, 1, 1);

    // Rosy blushing cheeks
    ctx.fillStyle = 'rgba(255, 105, 140, 0.55)';
    ctx.fillRect(-8, -7, 4, 2);
    ctx.fillRect(4, -7, 4, 2);

    // Sweet smile
    ctx.fillStyle = '#7a3b3b';
    ctx.fillRect(-2, -6, 4, 2);
  }

  // Draw POSH: Purple and pink saree with pink/magenta border, long dark brown hair, large expressive brown eyes
  drawPoshVoxel(legSwing, armSwing, isCelebrating) {
    const ctx = this.ctx;

    // --- LEGS / FEET ---
    ctx.fillStyle = '#e0a96d'; // Skin tone
    ctx.fillRect(-7, 10 + legSwing, 4, 6);
    ctx.fillRect(3, 10 - legSwing, 4, 6);
    ctx.fillStyle = '#8d58b3'; // Cute purple sandals
    ctx.fillRect(-8, 14 + legSwing, 6, 3);
    ctx.fillRect(2, 14 - legSwing, 6, 3);

    // --- LONG DARK BROWN HAIR (BACK LAYER) ---
    ctx.fillStyle = '#331c0e'; // Rich dark brown
    ctx.fillRect(-12, -18, 24, 26);
    ctx.fillRect(-10, 8, 20, 6); // Extra long hair hanging down

    // --- SAREE BODY & PLEATS (Purple & Pink with Pink/Magenta Border) ---
    // Base saree in royal lavender/purple
    ctx.fillStyle = '#8e56b8';
    ctx.fillRect(-9, -2, 18, 14);

    // Saree pleated contrast (vibrant pink accents)
    ctx.fillStyle = '#ff6b9d';
    ctx.fillRect(-4, 0, 8, 12);

    // Border trim at hem (magenta/pink)
    ctx.fillStyle = '#d81b60';
    ctx.fillRect(-9, 10, 18, 3);
    // Silver / Gold shimmer line
    ctx.fillStyle = '#fff9c4';
    ctx.fillRect(-9, 9, 18, 1);

    // Saree Pallu (draped diagonally across body in pink & purple)
    ctx.fillStyle = '#ff6b9d';
    ctx.beginPath();
    ctx.moveTo(-9, -2);
    ctx.lineTo(8, 6);
    ctx.lineTo(8, 10);
    ctx.lineTo(-9, 2);
    ctx.closePath();
    ctx.fill();

    // Purple blouse sleeve
    ctx.fillStyle = '#7b3ea6';
    ctx.fillRect(-11, -2, 3, 5);

    // --- ARMS & HANDS ---
    ctx.fillStyle = '#e0a96d'; // Skin
    const armY = isCelebrating ? -8 : 0;
    // Left arm
    ctx.fillRect(-11, 2 + armSwing + armY, 3, 6);
    // Right arm
    ctx.fillRect(8, 2 - armSwing + armY, 3, 6);
    // Pink bangles
    ctx.fillStyle = '#ff6b9d';
    ctx.fillRect(-11, 4 + armSwing + armY, 3, 2);
    ctx.fillRect(8, 4 - armSwing + armY, 3, 2);

    // --- HEAD & FACE ---
    ctx.fillStyle = '#fad4af';
    ctx.fillRect(-10, -20, 20, 18);

    // Long dark brown hair (front bangs & side locks)
    ctx.fillStyle = '#331c0e';
    ctx.fillRect(-11, -22, 22, 6);   // Top hair
    ctx.fillRect(-11, -16, 3, 14);   // Left lock
    ctx.fillRect(8, -16, 3, 14);    // Right lock

    // Small pink floral hair clip / earring
    ctx.fillStyle = '#ff6b9d';
    ctx.fillRect(-12, -10, 2, 4);
    ctx.fillRect(10, -10, 2, 4);

    // Tiny pink bindi
    ctx.fillStyle = '#d81b60';
    ctx.fillRect(-1, -15, 2, 2);

    // Large Expressive Brown Eyes
    // Eye whites
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-7, -13, 5, 6);
    ctx.fillRect(2, -13, 5, 6);

    // Rich Brown Irises
    ctx.fillStyle = '#4a2511';
    ctx.fillRect(-6, -13, 4, 5);
    ctx.fillRect(3, -13, 4, 5);

    // Catchlights
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, -13, 2, 2);
    ctx.fillRect(3, -13, 2, 2);
    ctx.fillRect(-4, -10, 1, 1);
    ctx.fillRect(5, -10, 1, 1);

    // Cute rosy cheeks
    ctx.fillStyle = 'rgba(255, 90, 130, 0.6)';
    ctx.fillRect(-8, -7, 4, 2);
    ctx.fillRect(4, -7, 4, 2);

    // Bright cheerful smile
    ctx.fillStyle = '#7a3b3b';
    ctx.fillRect(-2, -6, 4, 2);
  }

  drawNameTag(x, y, name, isPlayer, hasSpeedBoost = false) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';

    // Player is Posh (You), automated character is simply Iba
    const label = isPlayer ? `${name} (You)` : name;
    const textWidth = ctx.measureText(label).width;

    ctx.fillStyle = isPlayer ? 'rgba(141, 88, 179, 0.88)' : 'rgba(88, 179, 104, 0.88)';
    ctx.fillRect(x - textWidth / 2 - 6, y - 11, textWidth + 12, 15);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, x, y);

    // Cute indicator arrow pointing to player character
    if (isPlayer) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(x - 3, y + 5);
      ctx.lineTo(x + 3, y + 5);
      ctx.lineTo(x, y + 8);
      ctx.closePath();
      ctx.fill();
    }

    // Small readable SPEED BOOST! indicator while effect is active
    if (hasSpeedBoost) {
      const boostText = '⚡ SPEED BOOST! ⚡';
      ctx.font = '900 9px sans-serif';
      const bWidth = ctx.measureText(boostText).width;
      const by = y - 18;

      ctx.fillStyle = 'rgba(255, 193, 7, 0.95)';
      ctx.fillRect(x - bWidth / 2 - 5, by - 9, bWidth + 10, 13);
      ctx.strokeStyle = '#ff6b9d';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - bWidth / 2 - 5, by - 9, bWidth + 10, 13);

      ctx.fillStyle = '#3e1f38';
      ctx.fillText(boostText, x, by);
    }

    ctx.restore();
  }

  // Standalone Avatar Preview for Dashboard "Meet the Besties" cards
  renderAvatarToContext(targetCtx, name, width, height, animTime = 0) {
    targetCtx.clearRect(0, 0, width, height);
    targetCtx.save();
    targetCtx.translate(width / 2, height / 2 + 6);

    const bob = Math.sin(animTime * 3) * 1.5;
    targetCtx.translate(0, bob);

    // Drop shadow
    targetCtx.fillStyle = 'rgba(40, 20, 45, 0.18)';
    targetCtx.beginPath();
    targetCtx.ellipse(0, 16, 12, 5, 0, 0, Math.PI * 2);
    targetCtx.fill();

    // Temporarily swap this.ctx to targetCtx to reuse the character drawing code
    const originalCtx = this.ctx;
    this.ctx = targetCtx;

    if (name === 'Iba') {
      this.drawIbaVoxel(0, 0, false);
    } else {
      this.drawPoshVoxel(0, 0, false);
    }

    this.ctx = originalCtx;
    targetCtx.restore();
  }

  // ==========================================
  // COLLECTIBLES (3D VOXEL HEARTS)
  // ==========================================

  drawHeart(heart) {
    const ctx = this.ctx;
    const { x, y, type, floatOffset } = heart;

    const bob = Math.sin(this.time * 5 + floatOffset) * 3;
    const drawY = y + bob;

    ctx.save();
    ctx.translate(x, drawY);

    if (type === 'gold') {
      this.drawGoldenSyncHeart();
    } else {
      const isPink = type === 'pink';
      const mainColor = isPink ? '#ff4081' : '#ab47bc';
      const topColor = isPink ? '#ff80ab' : '#ce93d8';
      const shadowColor = isPink ? '#c51162' : '#7b1fa2';

      this.drawVoxelHeart(mainColor, topColor, shadowColor);
    }

    ctx.restore();
  }

  drawVoxelHeart(main, top, shadow) {
    const ctx = this.ctx;
    // 3D Voxel Heart Shape
    // Top highlight lobes
    ctx.fillStyle = top;
    ctx.fillRect(-8, -8, 6, 3);
    ctx.fillRect(2, -8, 6, 3);

    // Main body
    ctx.fillStyle = main;
    ctx.fillRect(-10, -5, 20, 6);
    ctx.fillRect(-8, 1, 16, 4);
    ctx.fillRect(-5, 5, 10, 3);
    ctx.fillRect(-2, 8, 4, 3);

    // Left sparkle highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-7, -4, 3, 3);

    // Shadow on right side
    ctx.fillStyle = shadow;
    ctx.fillRect(5, -2, 3, 4);
    ctx.fillRect(3, 2, 3, 3);
  }

  drawGoldenSyncHeart() {
    const ctx = this.ctx;
    // Glowing halo pulse
    const haloSize = 22 + Math.sin(this.time * 8) * 3;
    ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, haloSize, 0, Math.PI * 2);
    ctx.fill();

    // Golden voxel heart
    ctx.fillStyle = '#fff59d'; // top highlight
    ctx.fillRect(-9, -10, 7, 4);
    ctx.fillRect(2, -10, 7, 4);

    ctx.fillStyle = '#ffd54f'; // golden yellow
    ctx.fillRect(-12, -6, 24, 7);
    ctx.fillRect(-9, 1, 18, 5);
    ctx.fillRect(-6, 6, 12, 4);
    ctx.fillRect(-3, 10, 6, 3);

    ctx.fillStyle = '#ffffff'; // sparkle
    ctx.fillRect(-8, -5, 4, 4);

    // Sync Banner above
    ctx.font = '900 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e65100';
    ctx.fillText('BESTIE SYNC!', 0, -14);
  }

  // ==========================================
  // OBSTACLES & BONUS OBJECTS
  // ==========================================

  drawObstacle(obs) {
    const ctx = this.ctx;
    const { x, y, type, vx } = obs;

    ctx.save();
    ctx.translate(x, y);

    if (type === 'pigeon') {
      this.drawVoxelPigeon(vx);
    } else if (type === 'mushroomCloud') {
      this.drawMushroomCloud();
    } else if (type === 'balloon') {
      this.drawHotAirBalloon();
    }

    ctx.restore();
  }

  // Mischievous Pigeon: Recognisable flying silhouette with flapping wings and wind puffs
  drawVoxelPigeon(vx = 1) {
    const ctx = this.ctx;
    const facingLeft = vx < 0;
    if (facingLeft) ctx.scale(-1, 1);

    const wingFlap = Math.sin(this.time * 18) * 6;
    const headBob = Math.sin(this.time * 18) * 1.5;

    // Wind / flight trail behind pigeon
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(-18, -1, 5, 2);
    ctx.fillRect(-22, -4, 4, 2);

    // Drop shadow
    ctx.fillStyle = 'rgba(50, 20, 50, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (Blue-gray voxel block)
    ctx.fillStyle = '#78909c';
    ctx.fillRect(-10, -5, 18, 12);
    ctx.fillStyle = '#b0bec5'; // Belly highlight
    ctx.fillRect(-6, -2, 12, 7);

    // Iridescent lavender-magenta neck ring (distinctive pigeon feature)
    ctx.fillStyle = '#ba68c8';
    ctx.fillRect(4, -8 + headBob, 5, 5);

    // Tail feathers
    ctx.fillStyle = '#455a64';
    ctx.fillRect(-15, -4, 6, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-16, -3, 2, 4);

    // Head
    ctx.fillStyle = '#607d8b';
    ctx.fillRect(7, -12 + headBob, 9, 9);

    // Big expressive cartoon eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, -10 + headBob, 4, 4);
    ctx.fillStyle = '#ff5722';
    ctx.fillRect(12, -9 + headBob, 3, 3);
    ctx.fillStyle = '#263238';
    ctx.fillRect(13, -9 + headBob, 2, 2);

    // Orange Beak
    ctx.fillStyle = '#ff9800';
    ctx.fillRect(16, -8 + headBob, 5, 4);
    ctx.fillStyle = '#ffb74d';
    ctx.fillRect(16, -8 + headBob, 5, 2);

    // Little pink feet tucked underneath
    ctx.fillStyle = '#ff80ab';
    ctx.fillRect(-2, 7, 3, 3);
    ctx.fillRect(3, 7, 3, 3);

    // Wings (Flapping with 3D voxel layers & white tips)
    ctx.fillStyle = '#546e7a';
    ctx.fillRect(-5, -9 + wingFlap, 12, 5);
    ctx.fillStyle = '#37474f';
    ctx.fillRect(-7, -7 + wingFlap, 14, 3);
    ctx.fillStyle = '#ffffff'; // White wing feather accents
    ctx.fillRect(-7, -8 + wingFlap, 3, 3);
  }

  // Floating Mushroom Puff: Whimsical lavender mushroom cloud with warning spores
  drawMushroomCloud() {
    const ctx = this.ctx;
    const bob = Math.sin(this.time * 4) * 3;
    const wobble = Math.sin(this.time * 6) * 0.08;
    ctx.translate(0, bob);
    ctx.rotate(wobble);

    // Drop shadow
    ctx.fillStyle = 'rgba(50, 20, 50, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Drifting sleepy/warning spore dots around puff
    const spore1 = Math.sin(this.time * 3) * 10;
    const spore2 = Math.cos(this.time * 3.5) * 12;
    ctx.fillStyle = 'rgba(206, 147, 216, 0.65)';
    ctx.fillRect(-18 + spore1 * 0.3, -16 + spore2 * 0.3, 3, 3);
    ctx.fillRect(16 - spore2 * 0.3, -12 + spore1 * 0.3, 3, 3);

    // Stem / Puff column (bubbly cloud vapor)
    ctx.fillStyle = '#ede7f6';
    ctx.fillRect(-6, 0, 12, 12);
    ctx.fillStyle = '#d1c4e9';
    ctx.fillRect(-4, 4, 8, 8);

    // Cap (Rich whimsical violet & lavender - clearly distinct from white bg clouds)
    ctx.fillStyle = '#9c27b0'; // Deep violet base
    ctx.fillRect(-18, -12, 36, 13);
    ctx.fillStyle = '#ba68c8'; // Lavender mid
    ctx.fillRect(-14, -18, 28, 7);
    ctx.fillStyle = '#e1bee7'; // Top highlight
    ctx.fillRect(-9, -21, 18, 4);

    // Golden warning spots on cap
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(-11, -15, 5, 4);
    ctx.fillRect(6, -14, 5, 4);
    ctx.fillRect(-2, -8, 4, 3);

    // Cute mischievous squinty eyes on the cap
    ctx.fillStyle = '#4a154b';
    ctx.fillRect(-7, -4, 4, 2);
    ctx.fillRect(3, -4, 4, 2);
  }

  // Hot-Air Balloon: Positive bonus object that grants a 3-second Speed Boost!
  drawHotAirBalloon() {
    const ctx = this.ctx;
    const bob = Math.sin(this.time * 3) * 3;
    ctx.translate(0, bob);

    // Pulsing golden-pink glow aura to highlight it as an inviting reward worth hitting
    const haloSize = 25 + Math.sin(this.time * 8) * 3;
    ctx.fillStyle = 'rgba(255, 215, 0, 0.32)';
    ctx.beginPath();
    ctx.arc(0, -10, haloSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 107, 157, 0.2)';
    ctx.beginPath();
    ctx.arc(0, -10, haloSize * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Drop shadow
    ctx.fillStyle = 'rgba(50, 20, 50, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Balloon envelope (warm peach, sunset coral-pink, and golden yellow stripes)
    // Left coral stripe
    ctx.fillStyle = '#ff7597';
    ctx.fillRect(-14, -24, 8, 20);
    // Right coral stripe
    ctx.fillRect(6, -24, 8, 20);
    // Center golden yellow stripe
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(-6, -24, 12, 20);
    // Top dome
    ctx.fillStyle = '#ffe082';
    ctx.fillRect(-10, -28, 20, 5);

    // Golden Star / Lightning emblem on center stripe
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -18, 4, 4);
    ctx.fillStyle = '#e65100';
    ctx.fillRect(-1, -17, 2, 2);

    // Ropes
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-9, -4);
    ctx.lineTo(-5, 6);
    ctx.moveTo(9, -4);
    ctx.lineTo(5, 6);
    ctx.stroke();

    // Wicker Basket
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(-7, 6, 14, 9);
    ctx.fillStyle = '#a1887f';
    ctx.fillRect(-6, 7, 12, 3);

    // Little golden sparkles falling from basket
    const sparkleY = 16 + (Math.sin(this.time * 10) * 3);
    ctx.fillStyle = '#ffd152';
    ctx.fillRect(-2, sparkleY, 3, 3);
    ctx.fillRect(3, sparkleY + 4, 2, 2);

    // Clear floating label: ⚡ SPEED BOOST ⚡
    ctx.font = '900 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#d81b60';
    ctx.fillText('⚡ BOOST ⚡', 0, -32);
  }

  // Sparkles and Floating Effects
  drawParticles(particles) {
    const ctx = this.ctx;
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.restore();
    });
  }
}
