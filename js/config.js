// Game Configuration and Constants for OK Shuttumani

export const CONFIG = {
  // Game timing
  ROUND_DURATION: 40, // 40 seconds per round
  TARGET_HEART_SCORE: 10, // Points per normal heart
  BESTIE_SYNC_BONUS: 50, // Shared bonus for Bestie Sync
  SYNC_HEART_INTERVAL: 13, // Golden heart appears every ~13 seconds
  SYNC_HEART_LIFETIME: 9, // Golden heart stays for 9 seconds
  SYNC_TRIGGER_DISTANCE: 46, // Pixels distance between Posh, Iba, and Golden Heart to trigger sync

  // Bestie Sync timing (previously 1.6s, reduced by exactly 1.0s to 0.6s)
  PREVIOUS_SYNC_CELEBRATION_DURATION: 1.6,
  BESTIE_SYNC_CELEBRATION_DURATION: 0.6,

  // Speed boost bonus settings (Hot-air balloon)
  SPEED_BOOST_DURATION: 3.0, // 3 seconds speed boost
  SPEED_BOOST_FACTOR: 1.4,   // Balanced speed multiplier

  // Obstacle collision penalties
  PIGEON_STUN_DURATION: 0.85,  // Brief comic recoil & slowdown
  MUSHROOM_SLOW_DURATION: 1.0, // Brief soft puff slowdown
  OBSTACLE_SLOWDOWN_DURATION: 0.9,
  OBSTACLE_SPEED_FACTOR: 0.45,

  // Speed settings (pixels per second)
  PLAYER_SPEED: 185,
  BOT_BASE_SPEED: 125, // Slower, fair speed so Posh can win comfortably
  BOT_SYNC_SPEED: 138, // Moderate speed when moving to Golden Sync heart

  // Spawning limits
  MAX_PINK_HEARTS: 4,
  MAX_PURPLE_HEARTS: 4,
  MAX_OBSTACLES: 3,

  // Arena bounds (in virtual canvas units, responsive 400x520 world)
  ARENA: {
    WIDTH: 400,
    HEIGHT: 520,
    PADDING: 28,
  },

  // Color Palette - Dreamy Pastel Sunset & Voxel Arena
  COLORS: {
    SUNSET_TOP: '#ff9671',
    SUNSET_MID: '#ffc75f',
    SUNSET_BOTTOM: '#c996cc',
    ARENA_SURFACE: '#e5c2e8',   // Pastel lavender-pink surface
    ARENA_PEACH: '#ffd4c7',     // Soft peach sunlit highlight
    ARENA_LAVENDER: '#cf9fd6',  // Soft lavender depth
    ARENA_BORDER: '#ffdfba',    // Subtle warm golden-peach boundary
    PINK_HEART: '#ff5e97',
    PURPLE_HEART: '#b06ab3',
    GOLD_HEART: '#ffd152',
    CREAM_PAPER: '#fdfbf7',
    TEXT_DARK: '#42253b',
    IBA_SAREE_GREEN: '#58b368',
    IBA_BORDER_MAGENTA: '#e8397a',
    POSH_SAREE_PURPLE: '#8d58b3',
    POSH_BORDER_PINK: '#ff6b9d',
  },

  // Results Messages according to specification
  RESULTS: {
    IBA_WINS: {
      title: 'IBA WINS. KEKEKE.',
      message: 'Your Honour, I would like to submit this kutty game as my small token of love in this most auspicious day of our life, your birthday (to prove I love you more blehh)'
    },
    POSH_WINS: {
      title: 'POSH WINS!',
      message: 'SHE LOVES IBA MORE. IBA REFUSES TO ACCEPT THESE RESULTS AND HAS REQUESTED A RECOUNT.'
    },
    TIE: {
      title: 'AWWW!!! MUTUAL OBSESSION CONFIRMED.',
      message: 'Yaayyy that means we can marryyy kekekeke'
    }
  },

  // Birthday Letter Content
  LETTER: {
    SALUTATION: 'Happy birthday, my thangakatti! 💗',
    PARAGRAPH_1: 'I love you so, so much. You inspire me, make me a better person, and bring so much sunshine into my life. I always wish the happiest things for you, and seeing you achieve your dreams is on my checklist too.',
    PARAGRAPH_2: 'No matter how far apart we are, you will always have a home in my heart.',
    PARAGRAPH_3: 'I hope your year is filled with all the good things you deserve.',
    CLOSING: 'Love you endlessly,',
    SIGNATURE: 'Iba'
  }
};
