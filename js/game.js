// Core Game Engine for OK Shuttumani
import { CONFIG } from './config.js';
import { sound } from './audio.js';
import { BotController } from './bot.js';

export class GameEngine {
  constructor(canvas, voxelRenderer, onStateChange, onHudUpdate) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.renderer = voxelRenderer;
    this.onStateChange = onStateChange;
    this.onHudUpdate = onHudUpdate;

    this.state = 'DASHBOARD'; // DASHBOARD, PLAYING, PAUSED, RESULTS, LETTER
    this.timer = CONFIG.ROUND_DURATION;
    this.lastTime = performance.now();

    // Characters
    this.posh = {
      name: 'Posh',
      x: 260,
      y: 260,
      direction: { x: 0, y: 1 },
      isMoving: false,
      isStunned: false,
      stunTimer: 0,
      stunType: null,
      recoilX: 0,
      recoilY: 0,
      hasSpeedBoost: false,
      speedBoostTimer: 0,
      isCelebrating: false,
      celebrateTimer: 0,
      streak: 0,
    };

    this.iba = {
      name: 'Iba',
      x: 140,
      y: 260,
      direction: { x: 0, y: 1 },
      isMoving: false,
      isStunned: false,
      stunTimer: 0,
      stunType: null,
      recoilX: 0,
      recoilY: 0,
      hasSpeedBoost: false,
      speedBoostTimer: 0,
      isCelebrating: false,
      celebrateTimer: 0,
      streak: 0,
    };

    this.bot = new BotController(this.iba);

    // Scores
    this.scorePosh = 0;
    this.scoreIba = 0;

    // Entities
    this.pinkHearts = [];
    this.purpleHearts = [];
    this.goldenHeart = null;
    this.obstacles = [];
    this.particles = [];

    // Timers
    this.syncSpawnTimer = 8; // First sync heart appears around 8s in
    this.nextObstacleTimer = 2;

    // Input state
    this.inputDir = { x: 0, y: 0 };
    this.keys = {};

    this.setupKeyboard();
    this.setupDashboardScene();
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === 'p' || e.key === 'Escape') {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  setJoystickInput(x, y) {
    this.inputDir.x = x;
    this.inputDir.y = y;
  }

  setupDashboardScene() {
    // Characters positioned cutely together on dashboard
    this.iba.x = 160;
    this.iba.y = 260;
    this.iba.isMoving = false;
    this.iba.isCelebrating = false;
    this.iba.direction = { x: 1, y: 0 };

    this.posh.x = 240;
    this.posh.y = 260;
    this.posh.isMoving = false;
    this.posh.isCelebrating = false;
    this.posh.direction = { x: -1, y: 0 };

    this.pinkHearts = [
      { x: 170, y: 190, type: 'pink', floatOffset: 0.5 },
      { x: 230, y: 190, type: 'pink', floatOffset: 1.2 }
    ];
    this.purpleHearts = [];
    this.goldenHeart = { x: 200, y: 170, type: 'gold', floatOffset: 0 };
  }

  startRound() {
    this.state = 'PLAYING';
    this.timer = CONFIG.ROUND_DURATION;
    this.scorePosh = 0;
    this.scoreIba = 0;

    // Reset positions inside arena
    this.posh.x = 270;
    this.posh.y = 300;
    this.posh.isStunned = false;
    this.posh.stunTimer = 0;
    this.posh.stunType = null;
    this.posh.recoilX = 0;
    this.posh.recoilY = 0;
    this.posh.hasSpeedBoost = false;
    this.posh.speedBoostTimer = 0;
    this.posh.isCelebrating = false;
    this.posh.streak = 0;

    this.iba.x = 130;
    this.iba.y = 300;
    this.iba.isStunned = false;
    this.iba.stunTimer = 0;
    this.iba.stunType = null;
    this.iba.recoilX = 0;
    this.iba.recoilY = 0;
    this.iba.hasSpeedBoost = false;
    this.iba.speedBoostTimer = 0;
    this.iba.isCelebrating = false;
    this.iba.streak = 0;

    this.pinkHearts = [];
    this.purpleHearts = [];
    this.goldenHeart = null;
    this.obstacles = [];
    this.particles = [];

    this.syncSpawnTimer = 10; // First golden heart 10s into round

    // Initial heart spawn
    for (let i = 0; i < 3; i++) {
      this.spawnHeart('pink');
      this.spawnHeart('purple');
    }

    // Initial obstacle spawn
    this.spawnObstacle('pigeon');
    this.spawnObstacle('mushroomCloud');

    sound.startBGM();
    this.onStateChange('PLAYING');
    this.notifyHud();
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      sound.stopBGM();
      this.onStateChange('PAUSED');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.lastTime = performance.now();
      sound.startBGM();
      this.onStateChange('PLAYING');
    }
  }

  spawnHeart(type) {
    const pad = CONFIG.ARENA.PADDING + 30;
    const x = pad + Math.random() * (CONFIG.ARENA.WIDTH - pad * 2);
    const y = pad + Math.random() * (CONFIG.ARENA.HEIGHT - pad * 2 - 20);

    const heart = {
      x,
      y,
      type,
      floatOffset: Math.random() * Math.PI * 2,
    };

    if (type === 'pink') {
      if (this.pinkHearts.length < CONFIG.MAX_PINK_HEARTS) {
        this.pinkHearts.push(heart);
      }
    } else if (type === 'purple') {
      if (this.purpleHearts.length < CONFIG.MAX_PURPLE_HEARTS) {
        this.purpleHearts.push(heart);
      }
    } else if (type === 'gold') {
      this.goldenHeart = heart;
      this.goldenHeartLifetime = CONFIG.SYNC_HEART_LIFETIME;
    }
  }

  spawnObstacle(forcedType = null) {
    if (this.obstacles.length >= CONFIG.MAX_OBSTACLES) return;

    const types = ['pigeon', 'mushroomCloud', 'balloon'];
    const type = forcedType || types[Math.floor(Math.random() * types.length)];
    const pad = CONFIG.ARENA.PADDING + 30;

    let x, y, vx, vy;
    // Fairness: ensure obstacles do not spawn directly on top of Posh or Iba
    let safe = false;
    let attempts = 0;
    while (!safe && attempts < 8) {
      attempts++;
      if (type === 'pigeon') {
        // Moves horizontally across arena
        const fromLeft = Math.random() > 0.5;
        x = fromLeft ? pad - 10 : CONFIG.ARENA.WIDTH - pad + 10;
        y = pad + 20 + Math.random() * (CONFIG.ARENA.HEIGHT - pad * 2 - 60);
        vx = (fromLeft ? 1 : -1) * (48 + Math.random() * 25);
        vy = (Math.random() - 0.5) * 15;
      } else if (type === 'mushroomCloud') {
        // Drifts slowly diagonally from top
        x = pad + 20 + Math.random() * (CONFIG.ARENA.WIDTH - pad * 2 - 40);
        y = pad + 10 + Math.random() * 90;
        vx = (Math.random() - 0.5) * 20;
        vy = 14 + Math.random() * 12;
      } else {
        // Hot-air balloon drifts upwards from bottom
        x = pad + 25 + Math.random() * (CONFIG.ARENA.WIDTH - pad * 2 - 50);
        y = CONFIG.ARENA.HEIGHT - pad - 10;
        vx = (Math.random() - 0.5) * 18;
        vy = -22 - Math.random() * 12;
      }

      const distP = Math.hypot(x - this.posh.x, y - this.posh.y);
      const distI = Math.hypot(x - this.iba.x, y - this.iba.y);
      if (distP > 70 && distI > 70) {
        safe = true;
      }
    }

    const radius = type === 'pigeon' ? 15 : (type === 'mushroomCloud' ? 17 : 18);

    this.obstacles.push({
      x,
      y,
      type,
      vx,
      vy,
      radius,
    });
  }

  // Update Game Loop
  update(dt) {
    this.renderer.update(dt);

    // Update Particles in all states
    this.updateParticles(dt);

    if (this.state !== 'PLAYING') {
      return;
    }

    // 1. Timer Countdown
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = 0;
      this.endRound();
      return;
    }

    // 2. Character Recoil physical decay
    this.posh.recoilX *= Math.max(0, 1 - 12 * dt);
    this.posh.recoilY *= Math.max(0, 1 - 12 * dt);
    this.iba.recoilX *= Math.max(0, 1 - 12 * dt);
    this.iba.recoilY *= Math.max(0, 1 - 12 * dt);

    // 3. Handle Speed Boost timers & sparkle trails
    if (this.posh.hasSpeedBoost) {
      this.posh.speedBoostTimer -= dt;
      if (this.posh.speedBoostTimer <= 0) {
        this.posh.hasSpeedBoost = false;
        this.posh.speedBoostTimer = 0;
      } else if (this.posh.isMoving && Math.random() < 0.35) {
        this.particles.push({
          x: this.posh.x + (Math.random() - 0.5) * 12,
          y: this.posh.y + 12,
          vx: (Math.random() - 0.5) * 20,
          vy: 10 + Math.random() * 20,
          size: 2.5 + Math.random() * 2,
          color: Math.random() > 0.5 ? '#ffd152' : '#ff7597',
          life: 0.3,
          maxLife: 0.3
        });
      }
    }

    if (this.iba.hasSpeedBoost) {
      this.iba.speedBoostTimer -= dt;
      if (this.iba.speedBoostTimer <= 0) {
        this.iba.hasSpeedBoost = false;
        this.iba.speedBoostTimer = 0;
      } else if (this.iba.isMoving && Math.random() < 0.35) {
        this.particles.push({
          x: this.iba.x + (Math.random() - 0.5) * 12,
          y: this.iba.y + 12,
          vx: (Math.random() - 0.5) * 20,
          vy: 10 + Math.random() * 20,
          size: 2.5 + Math.random() * 2,
          color: Math.random() > 0.5 ? '#ffd152' : '#ff7597',
          life: 0.3,
          maxLife: 0.3
        });
      }
    }

    // 4. Handle Player Stun
    if (this.posh.isStunned) {
      this.posh.stunTimer -= dt;
      if (this.posh.stunTimer <= 0) {
        this.posh.isStunned = false;
        this.posh.stunType = null;
      }
    }

    // 5. Player Input (Posh)
    let moveX = this.inputDir.x;
    let moveY = this.inputDir.y;

    // Keyboard support
    if (this.keys['arrowleft'] || this.keys['a']) moveX -= 1;
    if (this.keys['arrowright'] || this.keys['d']) moveX += 1;
    if (this.keys['arrowup'] || this.keys['w']) moveY -= 1;
    if (this.keys['arrowdown'] || this.keys['s']) moveY += 1;

    // Normalize player vector
    const inputLen = Math.hypot(moveX, moveY);
    if (inputLen > 0.001) {
      moveX /= inputLen;
      moveY /= inputLen;
    }

    // Move Player (Posh) with slowdown or speed boost
    let playerSpeedMultiplier = 1.0;
    if (this.posh.isStunned) {
      playerSpeedMultiplier = CONFIG.OBSTACLE_SPEED_FACTOR;
    } else if (this.posh.hasSpeedBoost) {
      playerSpeedMultiplier = CONFIG.SPEED_BOOST_FACTOR;
    }

    if (inputLen > 0.1 && !this.posh.isCelebrating) {
      this.posh.x += moveX * CONFIG.PLAYER_SPEED * playerSpeedMultiplier * dt;
      this.posh.y += moveY * CONFIG.PLAYER_SPEED * playerSpeedMultiplier * dt;
      this.posh.direction = { x: moveX, y: moveY };
      this.posh.isMoving = true;
    } else {
      this.posh.isMoving = false;
    }

    // Clamp Player to arena
    this.clampCharacter(this.posh);

    // 6. Update Bot (Iba)
    if (this.iba.isStunned) {
      this.iba.stunTimer -= dt;
      if (this.iba.stunTimer <= 0) {
        this.iba.isStunned = false;
        this.iba.stunType = null;
      }
    }
    if (!this.iba.isCelebrating) {
      this.bot.update(dt, this.purpleHearts, this.goldenHeart, this.obstacles, CONFIG.ARENA, this.posh);
    }
    this.clampCharacter(this.iba);

    // 7. Update Celebration Timers
    if (this.posh.isCelebrating) {
      this.posh.celebrateTimer -= dt;
      if (this.posh.celebrateTimer <= 0) {
        this.posh.isCelebrating = false;
        this.iba.isCelebrating = false;
      }
    }

    // 5. Update Obstacles
    this.updateObstacles(dt);

    // 6. Spawn Golden Sync Heart periodically
    this.syncSpawnTimer -= dt;
    if (this.syncSpawnTimer <= 0 && !this.goldenHeart) {
      this.spawnHeart('gold');
      this.syncSpawnTimer = CONFIG.SYNC_HEART_INTERVAL;
    }

    if (this.goldenHeart) {
      this.goldenHeartLifetime -= dt;
      if (this.goldenHeartLifetime <= 0) {
        this.goldenHeart = null;
      }
    }

    // Ensure normal hearts remain populated
    if (this.pinkHearts.length < CONFIG.MAX_PINK_HEARTS && Math.random() < 0.03) {
      this.spawnHeart('pink');
    }
    if (this.purpleHearts.length < CONFIG.MAX_PURPLE_HEARTS && Math.random() < 0.03) {
      this.spawnHeart('purple');
    }

    // 7. Check Collisions
    this.checkCollisions();

    // 8. Update HUD
    this.notifyHud();
  }

  clampCharacter(char) {
    const pad = CONFIG.ARENA.PADDING + 14;
    const minX = pad;
    const maxX = CONFIG.ARENA.WIDTH - pad;
    const minY = pad + 16;
    const maxY = CONFIG.ARENA.HEIGHT - pad - 20;

    char.x = Math.max(minX, Math.min(maxX, char.x));
    char.y = Math.max(minY, Math.min(maxY, char.y));
  }

  updateObstacles(dt) {
    const pad = CONFIG.ARENA.PADDING;
    const minX = pad - 20;
    const maxX = CONFIG.ARENA.WIDTH - pad + 20;
    const minY = pad;
    const maxY = CONFIG.ARENA.HEIGHT - pad;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x += obs.vx * dt;
      obs.y += obs.vy * dt;

      // Bounce or despawn when off bounds
      if (obs.x < minX || obs.x > maxX || obs.y < minY || obs.y > maxY) {
        if (obs.type === 'pigeon') {
          obs.vx *= -1; // Pigeon turns around and walks back
        } else {
          // Cloud or balloon resets
          this.obstacles.splice(i, 1);
        }
      }
    }

    // Random obstacle respawn
    if (this.obstacles.length < CONFIG.MAX_OBSTACLES) {
      this.nextObstacleTimer -= dt;
      if (this.nextObstacleTimer <= 0) {
        this.spawnObstacle();
        this.nextObstacleTimer = 3.5 + Math.random() * 2;
      }
    }
  }

  checkCollisions() {
    // A. Posh collects Pink Hearts (Iba's love)
    for (let i = this.pinkHearts.length - 1; i >= 0; i--) {
      const h = this.pinkHearts[i];
      const dist = Math.hypot(h.x - this.posh.x, h.y - this.posh.y);
      if (dist < 24) {
        this.pinkHearts.splice(i, 1);
        this.scorePosh += CONFIG.TARGET_HEART_SCORE;
        this.posh.streak++;
        sound.playHeartCollect(true);
        this.createSparkles(h.x, h.y, '#ff4081', 8);
      }
    }

    // B. Iba collects Purple Hearts (Posh's love)
    for (let i = this.purpleHearts.length - 1; i >= 0; i--) {
      const h = this.purpleHearts[i];
      const dist = Math.hypot(h.x - this.iba.x, h.y - this.iba.y);
      if (dist < 24) {
        this.purpleHearts.splice(i, 1);
        this.scoreIba += CONFIG.TARGET_HEART_SCORE;
        this.iba.streak++;
        sound.playHeartCollect(false);
        this.createSparkles(h.x, h.y, '#ba68c8', 8);
      }
    }

    // C. Bestie Sync Golden Heart Trigger
    if (this.goldenHeart) {
      const distPosh = Math.hypot(this.goldenHeart.x - this.posh.x, this.goldenHeart.y - this.posh.y);
      const distIba = Math.hypot(this.goldenHeart.x - this.iba.x, this.goldenHeart.y - this.iba.y);
      const distBetween = Math.hypot(this.posh.x - this.iba.x, this.posh.y - this.iba.y);

      // Triggered when both characters are close to each other and the golden heart
      if (distPosh < CONFIG.SYNC_TRIGGER_DISTANCE && 
          distIba < CONFIG.SYNC_TRIGGER_DISTANCE && 
          distBetween < CONFIG.SYNC_TRIGGER_DISTANCE * 1.3) {
        this.triggerBestieSync();
      }
    }

    // D. Obstacles & Positive Bonus Collisions
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      // Positive Bonus: Hot-Air Balloon grants temporary speed boost (approx 3s)
      if (obs.type === 'balloon') {
        const distPosh = Math.hypot(obs.x - this.posh.x, obs.y - this.posh.y);
        if (distPosh < obs.radius + 14) {
          this.obstacles.splice(i, 1);
          this.posh.hasSpeedBoost = true;
          this.posh.speedBoostTimer = CONFIG.SPEED_BOOST_DURATION; // Refreshes, does not stack infinitely
          sound.playSpeedBoost();
          this.createSparkles(obs.x, obs.y, '#ffd152', 16);
          this.createSparkles(obs.x, obs.y, '#ff6b9d', 14);
          this.createFloatingBanner(this.posh.x, this.posh.y - 18, '⚡ SPEED BOOST! ⚡', '#ffd700');
          continue;
        }

        const distIba = Math.hypot(obs.x - this.iba.x, obs.y - this.iba.y);
        if (distIba < obs.radius + 14) {
          this.obstacles.splice(i, 1);
          this.iba.hasSpeedBoost = true;
          this.iba.speedBoostTimer = CONFIG.SPEED_BOOST_DURATION;
          sound.playSpeedBoost();
          this.createSparkles(obs.x, obs.y, '#ffd152', 16);
          this.createSparkles(obs.x, obs.y, '#ff6b9d', 14);
          this.createFloatingBanner(this.iba.x, this.iba.y - 18, '⚡ SPEED BOOST! ⚡', '#ffd700');
          continue;
        }
      }

      // Hazard A: Mischievous Pigeon (Brief comic recoil, stars, slowdown, comic sound)
      if (obs.type === 'pigeon') {
        const distPosh = Math.hypot(obs.x - this.posh.x, obs.y - this.posh.y);
        if (distPosh < obs.radius + 11 && !this.posh.isStunned) {
          this.posh.isStunned = true;
          this.posh.stunTimer = CONFIG.PIGEON_STUN_DURATION;
          this.posh.stunType = 'pigeon';
          this.posh.streak = 0;
          const angle = Math.atan2(this.posh.y - obs.y, this.posh.x - obs.x);
          this.posh.recoilX = Math.cos(angle) * 16;
          this.posh.recoilY = Math.sin(angle) * 16;
          sound.playPigeonHit();
          this.createSparkles(this.posh.x, this.posh.y, '#ffd152', 8);
          this.createFloatingBanner(this.posh.x, this.posh.y - 15, 'OOF!', '#ff7043');
        }

        const distIba = Math.hypot(obs.x - this.iba.x, obs.y - this.iba.y);
        if (distIba < obs.radius + 11 && !this.iba.isStunned) {
          this.iba.isStunned = true;
          this.iba.stunTimer = CONFIG.PIGEON_STUN_DURATION;
          this.iba.stunType = 'pigeon';
          this.iba.streak = 0;
          const angle = Math.atan2(this.iba.y - obs.y, this.iba.x - obs.x);
          this.iba.recoilX = Math.cos(angle) * 16;
          this.iba.recoilY = Math.sin(angle) * 16;
          sound.playPigeonHit();
          this.createSparkles(this.iba.x, this.iba.y, '#ffd152', 8);
          this.createFloatingBanner(this.iba.x, this.iba.y - 15, 'OOF!', '#ff7043');
        }
      }

      // Hazard B: Floating Mushroom Puff (Brief soft puff slowdown, puff sound, spores)
      if (obs.type === 'mushroomCloud') {
        const distPosh = Math.hypot(obs.x - this.posh.x, obs.y - this.posh.y);
        if (distPosh < obs.radius + 12 && !this.posh.isStunned) {
          this.posh.isStunned = true;
          this.posh.stunTimer = CONFIG.MUSHROOM_SLOW_DURATION;
          this.posh.stunType = 'mushroom';
          this.posh.streak = 0;
          sound.playMushroomHit();
          this.createPuffCloud(this.posh.x, this.posh.y);
          this.createFloatingBanner(this.posh.x, this.posh.y - 15, 'PUFF!', '#ba68c8');
        }

        const distIba = Math.hypot(obs.x - this.iba.x, obs.y - this.iba.y);
        if (distIba < obs.radius + 12 && !this.iba.isStunned) {
          this.iba.isStunned = true;
          this.iba.stunTimer = CONFIG.MUSHROOM_SLOW_DURATION;
          this.iba.stunType = 'mushroom';
          this.iba.streak = 0;
          sound.playMushroomHit();
          this.createPuffCloud(this.iba.x, this.iba.y);
          this.createFloatingBanner(this.iba.x, this.iba.y - 15, 'PUFF!', '#ba68c8');
        }
      }
    }
  }

  triggerBestieSync() {
    const syncX = (this.posh.x + this.iba.x) / 2;
    const syncY = (this.posh.y + this.iba.y) / 2 - 10;

    // Consume golden heart immediately to avoid duplicate triggers
    this.goldenHeart = null;

    // Award shared bonus
    this.scorePosh += CONFIG.BESTIE_SYNC_BONUS;
    this.scoreIba += CONFIG.BESTIE_SYNC_BONUS;

    // Play synchronized celebration jump (duration reduced by exactly 1.0s to 0.6s)
    this.posh.isCelebrating = true;
    this.posh.celebrateTimer = CONFIG.BESTIE_SYNC_CELEBRATION_DURATION;
    this.iba.isCelebrating = true;
    this.iba.celebrateTimer = CONFIG.BESTIE_SYNC_CELEBRATION_DURATION;

    // Audio & Visual Effects
    sound.playBestieSync();
    this.createSparkles(syncX, syncY, '#ffd700', 30);
    this.createFloatingBanner(syncX, syncY, '⭐ BESTIE SYNC! +50 ⭐', '#ffd700', 1.2);
  }

  createSparkles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 25 + Math.random() * 60;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0,
      });
    }
  }

  createPuffCloud(x, y) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 15 + Math.random() * 35;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 5,
        color: Math.random() > 0.4 ? 'rgba(186, 104, 200, 0.75)' : 'rgba(237, 231, 246, 0.85)',
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
      });
    }
  }

  createFloatingBanner(x, y, text, color, life = 0.9) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: -22,
      isText: true,
      text,
      color,
      life,
      maxLife: life,
    });
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  endRound() {
    this.state = 'RESULTS';
    sound.stopBGM();
    sound.playVictory();

    // Determine actual winner
    let outcome = 'TIE';
    if (this.scorePosh > this.scoreIba) {
      outcome = 'POSH';
    } else if (this.scoreIba > this.scorePosh) {
      outcome = 'IBA';
    }

    this.onStateChange('RESULTS', {
      outcome,
      scorePosh: this.scorePosh,
      scoreIba: this.scoreIba,
    });
  }

  notifyHud() {
    if (this.onHudUpdate) {
      this.onHudUpdate({
        timer: Math.ceil(this.timer),
        scorePosh: this.scorePosh,
        scoreIba: this.scoreIba,
        maxScoreEstimate: 200,
      });
    }
  }

  // Render Full Frame
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Sunset Sky & Background
    this.renderer.renderBackground();

    // 2. Floating Arena Island
    this.renderer.renderIsland(CONFIG.ARENA);

    // 3. Collectibles
    this.pinkHearts.forEach(h => this.renderer.drawHeart(h));
    this.purpleHearts.forEach(h => this.renderer.drawHeart(h));
    if (this.goldenHeart) {
      this.renderer.drawHeart(this.goldenHeart);
    }

    // 4. Obstacles
    this.obstacles.forEach(obs => this.renderer.drawObstacle(obs));

    // 5. Characters
    // Draw in order of Y coordinate for proper depth sorting
    if (this.posh.y < this.iba.y) {
      this.renderer.drawCharacter(this.posh, true);
      this.renderer.drawCharacter(this.iba, false);
    } else {
      this.renderer.drawCharacter(this.iba, false);
      this.renderer.drawCharacter(this.posh, true);
    }

    // 6. Particles & Floating Text
    this.particles.forEach(p => {
      if (p.isText) {
        ctx.save();
        ctx.font = '900 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#42253b';
        ctx.fillText(p.text, p.x + 1, p.y + 1);
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
        ctx.restore();
      }
    });

    this.renderer.drawParticles(this.particles.filter(p => !p.isText));
  }
}
