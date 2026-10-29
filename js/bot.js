// Automated Bot AI for Iba
// Predictable, fair, charming, beginner-friendly opponent

import { CONFIG } from './config.js';

export class BotController {
  constructor(character) {
    this.char = character;
    this.target = null;
    this.stateTimer = 0;
    this.decisionInterval = 0.55; // Re-evaluates decisions every ~550ms for realistic reaction time
    this.hesitationTimer = 0; // Brief playful pause after collecting hearts or changing directions
    this.obstacleAvoidDistance = 44;
    this.currentVx = 0;
    this.currentVy = 0;
  }

  update(dt, purpleHearts, goldenHeart, obstacles, arena, player) {
    // Playful brief pause (only when not stunned)
    if (this.hesitationTimer > 0 && !this.char.isStunned) {
      this.hesitationTimer -= dt;
      this.char.isMoving = false;
      return;
    }

    this.stateTimer += dt;
    if (this.stateTimer >= this.decisionInterval || !this.target) {
      this.stateTimer = 0;
      this.selectTarget(purpleHearts, goldenHeart, player, obstacles);
    }

    if (!this.target) {
      // Gentle roam near arena center
      this.target = {
        x: arena.WIDTH / 2 + (Math.sin(this.stateTimer * 2) * 50),
        y: arena.HEIGHT / 2 + (Math.cos(this.stateTimer * 2) * 50)
      };
    }

    // Calculate direction vector to target
    let dx = this.target.x - this.char.x;
    let dy = this.target.y - this.char.y;
    let dist = Math.hypot(dx, dy);

    if (dist > 6) {
      let desiredVx = dx / dist;
      let desiredVy = dy / dist;

      // Obstacle avoidance force: steer away from hazards (pigeon & mushroom)
      // Note: Balloon is a positive bonus, so do NOT repulse away from it
      for (const obs of obstacles) {
        if (obs.type === 'balloon') continue;

        const odx = this.char.x - obs.x;
        const ody = this.char.y - obs.y;
        const oDist = Math.hypot(odx, ody);

        if (oDist < this.obstacleAvoidDistance && oDist > 0.1) {
          // Add repulsive force away from hazard
          const repulse = (this.obstacleAvoidDistance - oDist) / this.obstacleAvoidDistance;
          desiredVx += (odx / oDist) * repulse * 1.6;
          desiredVy += (ody / oDist) * repulse * 1.6;
        }
      }

      // Re-normalize desired velocity
      const moveLen = Math.hypot(desiredVx, desiredVy);
      if (moveLen > 0.001) {
        desiredVx /= moveLen;
        desiredVy /= moveLen;
      }

      // Smooth steering rather than instant sharp robotic turns
      const steerFactor = 6.0 * dt;
      this.currentVx += (desiredVx - this.currentVx) * Math.min(1.0, steerFactor);
      this.currentVy += (desiredVy - this.currentVy) * Math.min(1.0, steerFactor);

      let speed = (goldenHeart && this.target === goldenHeart) 
        ? CONFIG.BOT_SYNC_SPEED 
        : CONFIG.BOT_BASE_SPEED;

      // Apply consistent rules with player: slowdown if stunned, speed boost if boosted
      if (this.char.isStunned) {
        speed *= CONFIG.OBSTACLE_SPEED_FACTOR;
      } else if (this.char.hasSpeedBoost) {
        speed *= CONFIG.SPEED_BOOST_FACTOR;
      }

      // Apply movement
      this.char.x += this.currentVx * speed * dt;
      this.char.y += this.currentVy * speed * dt;
      this.char.direction = { x: this.currentVx, y: this.currentVy };
      this.char.isMoving = true;

      // Clamp inside arena
      const minX = arena.PADDING + 14;
      const maxX = arena.WIDTH - arena.PADDING - 14;
      const minY = arena.PADDING + 24;
      const maxY = arena.HEIGHT - arena.PADDING - 24;

      this.char.x = Math.max(minX, Math.min(maxX, this.char.x));
      this.char.y = Math.max(minY, Math.min(maxY, this.char.y));
    } else {
      this.char.isMoving = false;
      this.target = null;
      // Slight natural pause before immediately deciding next heart
      this.hesitationTimer = 0.25 + Math.random() * 0.2;
    }
  }

  selectTarget(purpleHearts, goldenHeart, player, obstacles = []) {
    // Priority 1: If a Golden Sync Heart exists, seek it with high priority for Bestie Sync
    if (goldenHeart) {
      this.target = goldenHeart;
      return;
    }

    // Opportunistic bonus: if hot-air balloon is nearby and bot doesn't already have speed boost
    if (!this.char.hasSpeedBoost && obstacles.length > 0) {
      const balloon = obstacles.find(o => o.type === 'balloon');
      if (balloon) {
        const bDist = Math.hypot(balloon.x - this.char.x, balloon.y - this.char.y);
        if (bDist < 110 && Math.random() < 0.35) {
          this.target = balloon;
          return;
        }
      }
    }

    // Priority 2: Seek a purple heart with natural human-like choice
    if (purpleHearts.length > 0) {
      // Pick amongst closest 2 hearts with slight variation so path isn't 100% rigid
      const sorted = [...purpleHearts].map(h => ({
        heart: h,
        dist: Math.hypot(h.x - this.char.x, h.y - this.char.y)
      })).sort((a, b) => a.dist - b.dist);

      if (sorted.length > 1 && Math.random() < 0.25) {
        // Occasionally picks second closest for playful unpredictability
        this.target = sorted[1].heart;
      } else {
        this.target = sorted[0].heart;
      }
    } else {
      this.target = null;
    }
  }
}
