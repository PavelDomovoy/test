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

const spinButton = document.getElementById('spin-button');

slotMachine.onEnd = () => {
  spinButton.textContent = 'Spin';
};

spinButton.addEventListener('click', () => {
  if (slotMachine.spinning) {
    if (MACHINE_CONFIG.allowSkip) {
      slotMachine.skip();
    }
    return;
  }
  slotMachine.start();
  if (MACHINE_CONFIG.allowSkip) {
    spinButton.textContent = 'Skip';
  }
});
