import * as PIXI from 'pixi.js';
import SlotMachine from './slotMachine.js';
import { MACHINE_CONFIG } from './config.js';

const app = new PIXI.Application({
  view: document.getElementById('game-canvas'),
  width: MACHINE_CONFIG.reels * MACHINE_CONFIG.reelWidth,
  height: MACHINE_CONFIG.rows * MACHINE_CONFIG.symbolSize,
  backgroundColor: 0x1099bb,
});

const slotMachine = new SlotMachine(app);
app.stage.addChild(slotMachine);

document.getElementById('spin-button').addEventListener('click', () => {
  slotMachine.start();
});
