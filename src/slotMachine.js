import * as PIXI from 'pixi.js';
import { MACHINE_CONFIG } from './config.js';

const {
  reels: REEL_COUNT,
  rows: VISIBLE_ROWS,
  reelWidth: REEL_WIDTH,
  symbolSize: SYMBOL_SIZE,
  extraSymbols: EXTRA_SYMBOLS,
  spinSpeed: SPIN_SPEED,
  spinTime: SPIN_TIME,
  startDelay: START_DELAY,
  stopDelay: STOP_DELAY,
  allowSkip: ALLOW_SKIP,
} = MACHINE_CONFIG;

const SYMBOLS_PER_REEL = VISIBLE_ROWS + EXTRA_SYMBOLS;

export const allowedSymbols = [
  'h1', 'h2', 'h3', 'h4',
  'm5', 'm6', 'm7', 'm8',
  'l9', 'l10', 'l11', 'l12',
];

function createTextures(app) {
  const textures = {};
  allowedSymbols.forEach((id) => {
    const cont = new PIXI.Container();
    const g = new PIXI.Graphics();
    g.beginFill(Math.random() * 0xffffff);
    g.drawRect(0, 0, SYMBOL_SIZE, SYMBOL_SIZE);
    g.endFill();
    cont.addChild(g);
    const text = new PIXI.Text(id, { fontSize: 24, fill: 0xffffff });
    text.anchor.set(0.5);
    text.x = SYMBOL_SIZE / 2;
    text.y = SYMBOL_SIZE / 2;
    cont.addChild(text);
    textures[id] = app.renderer.generateTexture(cont);
  });
  return textures;
}

export function randomStrip(len) {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(allowedSymbols[Math.floor(Math.random() * allowedSymbols.length)]);
  }
  return arr;
}

export default class SlotMachine extends PIXI.Container {
  constructor(app) {
    super();
    this.app = app;
    this.textures = createTextures(app);

    this.reelSets = [
      Array.from({ length: REEL_COUNT }, () => randomStrip(20)),
      Array.from({ length: REEL_COUNT }, () => randomStrip(20)),
    ];
    this.activeSet = 0;
    this.reels = [];
    this.reelMatrix = [];
    this.spinning = false;
    this.onEnd = null;

    this._createReels();
    this.app.ticker.add((delta) => this.update(delta));
  }

  setReelSet(index, strips) {
    this.reelSets[index] = strips;
  }

  _createReels() {
    for (let i = 0; i < REEL_COUNT; i++) {
      const reel = new PIXI.Container();
      reel.x = i * REEL_WIDTH;
      reel.stripIndex = 0;
      reel.speed = 0;
      reel.symbols = [];

      const mask = new PIXI.Graphics();
      mask.beginFill(0xffffff);
      mask.drawRect(0, 0, REEL_WIDTH, VISIBLE_ROWS * SYMBOL_SIZE);
      mask.endFill();
      mask.x = reel.x;
      this.addChild(mask);
      reel.mask = mask;

      for (let j = -EXTRA_SYMBOLS; j < VISIBLE_ROWS; j++) {
        const id = randomStrip(1)[0];
        const sprite = new PIXI.Sprite(this.textures[id]);
        sprite.y = j * SYMBOL_SIZE;
        sprite._id = id;
        reel.addChild(sprite);
        reel.symbols.push(sprite);
      }

      this.reels.push(reel);
      this.reelMatrix.push([]);
      this.addChild(reel);
    }
  }

  getNextId(reelIndex) {
    const strip = this.reelSets[this.activeSet][reelIndex];
    const id = strip[this.reels[reelIndex].stripIndex % strip.length];
    this.reels[reelIndex].stripIndex += 1;
    return id;
  }

  update(delta) {
    if (!this.spinning) return;
    this.reels.forEach((reel, i) => {
      reel.symbols.forEach((s) => {
        s.y += reel.speed * delta;
        if (s.y >= SYMBOL_SIZE * VISIBLE_ROWS) {
          s.y -= SYMBOL_SIZE * SYMBOLS_PER_REEL;
          const newId = this.getNextId(i);
          s.texture = this.textures[newId];
          s._id = newId;
        }
      });
    });
  }

  stopReel(reel, index) {
    reel.speed = 0;
    const visible = reel.symbols
      .filter((s) => s.y >= 0 && s.y < SYMBOL_SIZE * VISIBLE_ROWS)
      .sort((a, b) => a.y - b.y)
      .map((s) => s._id);
    this.reelMatrix[index] = visible;
  }

  start() {
    if (this.spinning) return;
    this.activeSet = Math.floor(Math.random() * this.reelSets.length);
    this.spinning = true;
    this.startTimeouts = [];
    this.stopTimeouts = [];
    this.reels.forEach((reel, i) => {
      const startT = setTimeout(() => {
        reel.speed = SPIN_SPEED;
        reel.stripIndex = 0;
      }, i * START_DELAY);
      this.startTimeouts.push(startT);

      const stopT = setTimeout(() => {
        this.stopReel(reel, i);
        if (i === this.reels.length - 1) {
          this.spinning = false;
          if (this.onEnd) this.onEnd();
          console.log('Reel matrix:', this.reelMatrix);
        }
      }, SPIN_TIME + i * STOP_DELAY);
      this.stopTimeouts.push(stopT);
    });
  }

  stop() {
    this.reels.forEach((reel, i) => this.stopReel(reel, i));
    this.spinning = false;
  }

  skip() {
    if (!this.spinning || !ALLOW_SKIP) return;
    if (this.startTimeouts) {
      this.startTimeouts.forEach((t) => clearTimeout(t));
      this.startTimeouts = [];
    }
    if (this.stopTimeouts) {
      this.stopTimeouts.forEach((t) => clearTimeout(t));
      this.stopTimeouts = [];
    }
    this.reels.forEach((reel, i) => {
      reel.speed = 0;
      this.stopReel(reel, i);
    });
    this.spinning = false;
    if (this.onEnd) this.onEnd();
    console.log('Reel matrix:', this.reelMatrix);
  }
}
