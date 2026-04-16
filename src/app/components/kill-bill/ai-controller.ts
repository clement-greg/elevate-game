import { Fighter, AnimationState } from './fighter';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface AIConfig {
  reactionTime: number;      // ms before AI reacts
  attackFrequency: number;   // chance per frame to attack (0-1)
  blockChance: number;       // chance to block incoming attack
  aggressiveness: number;    // how close AI wants to be
  moveSpeed: number;         // AI movement speed multiplier
  comboChance: number;       // chance of follow-up attack
}

const DIFFICULTY_CONFIGS: Record<Difficulty, AIConfig> = {
  easy: {
    reactionTime: 350,
    attackFrequency: 0.035,
    blockChance: 0.2,
    aggressiveness: 0.55,
    moveSpeed: 0.7,
    comboChance: 0.1,
  },
  medium: {
    reactionTime: 350,
    attackFrequency: 0.025,
    blockChance: 0.4,
    aggressiveness: 0.65,
    moveSpeed: 0.85,
    comboChance: 0.2,
  },
  hard: {
    reactionTime: 80,
    attackFrequency: 0.12,
    blockChance: 0.5,
    aggressiveness: 0.95,
    moveSpeed: 1.0,
    comboChance: 0.6,
  },
};

export class AIController {
  private config: AIConfig;
  private fighter: Fighter;
  private opponent: Fighter;
  private lastActionTime = 0;
  private lastDecisionTime = 0;
  private currentAction: 'idle' | 'approach' | 'attack' | 'retreat' | 'block' | 'jump' = 'idle';
  private decisionInterval = 200; // ms between decisions

  constructor(fighter: Fighter, opponent: Fighter, difficulty: Difficulty) {
    this.fighter = fighter;
    this.opponent = opponent;
    this.config = DIFFICULTY_CONFIGS[difficulty];
  }

  setDifficulty(difficulty: Difficulty) {
    this.config = DIFFICULTY_CONFIGS[difficulty];
  }

  update(timestamp: number) {
    if (this.fighter.state === 'die' || this.fighter.state === 'win') return;
    if (this.fighter.state === 'punched') return; // Can't act while stunned
    if (this.fighter.isAttacking) return; // Wait for attack to finish

    // Make decisions at intervals based on reaction time
    if (timestamp - this.lastDecisionTime < this.config.reactionTime) return;
    this.lastDecisionTime = timestamp;

    const distance = Math.abs(this.fighter.x - this.opponent.x);
    const optimalRange = 100 + (1 - this.config.aggressiveness) * 150;
    const attackRange = 160;

    // Face the opponent
    this.fighter.facingRight = this.opponent.x > this.fighter.x;

    // Decide action
    if (distance < attackRange) {
      // In attack range - prioritize attacking
      if (Math.random() < this.config.attackFrequency * 10) {
        this.currentAction = 'attack';
      } else if (this.opponent.isAttacking && Math.random() < this.config.blockChance) {
        this.currentAction = 'block';
      } else if (Math.random() < 0.15) {
        this.currentAction = 'retreat';
      } else {
        this.currentAction = 'idle';
      }
    } else if (distance > optimalRange) {
      // Too far, approach
      this.currentAction = 'approach';
    } else {
      // At good range, mix decisions
      const roll = Math.random();
      if (roll < this.config.attackFrequency * 5) {
        this.currentAction = 'approach'; // Get closer to attack
      } else if (roll < 0.3) {
        this.currentAction = 'approach';
      } else if (roll < 0.35 && this.fighter.isGrounded) {
        this.currentAction = 'jump';
      } else {
        this.currentAction = 'idle';
      }
    }

    this.executeAction();
  }

  private executeAction() {
    switch (this.currentAction) {
      case 'approach': {
        const direction = this.opponent.x > this.fighter.x ? 1 : -1;
        this.fighter.velocityX = direction * this.fighter.moveSpeed * this.config.moveSpeed;
        this.fighter.setState('run');
        break;
      }
      case 'retreat': {
        const direction = this.opponent.x > this.fighter.x ? -1 : 1;
        this.fighter.velocityX = direction * this.fighter.moveSpeed * this.config.moveSpeed * 0.7;
        this.fighter.setState('run');
        break;
      }
      case 'attack': {
        if (Math.random() < 0.5) {
          this.fighter.setState('punch');
        } else {
          this.fighter.setState('kick');
        }
        break;
      }
      case 'block': {
        this.fighter.setState('block');
        break;
      }
      case 'jump': {
        this.fighter.jump();
        break;
      }
      case 'idle':
      default: {
        if (this.fighter.state === 'run' || this.fighter.state === 'block') {
          this.fighter.setState('idle');
        }
        break;
      }
    }
  }
}
