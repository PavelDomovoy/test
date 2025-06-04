import * as PIXI from 'pixi.js';

const app = new PIXI.Application({
  view: document.getElementById('game-canvas'),
  width: 480,
  height: 270,
  backgroundColor: 0x1099bb,
});

const REEL_WIDTH = 150;
const SYMBOL_SIZE = 150;

const reels = [];
const textures = [];

for (let i = 0; i < 6; i++) {
  const g = new PIXI.Graphics();
  g.beginFill(Math.random() * 0xffffff);
  g.drawRect(0, 0, SYMBOL_SIZE, SYMBOL_SIZE);
  g.endFill();
  textures.push(app.renderer.generateTexture(g));
}

for (let i = 0; i < 3; i++) {
  const reel = new PIXI.Container();
  reel.x = i * REEL_WIDTH;

  for (let j = 0; j < 3; j++) {
    const symbol = new PIXI.Sprite(textures[Math.floor(Math.random() * textures.length)]);
    symbol.y = j * SYMBOL_SIZE;
    reel.addChild(symbol);
  }

  reels.push(reel);
  app.stage.addChild(reel);
}

function spin() {
  reels.forEach((reel) => {
    reel.children.forEach((symbol) => {
      symbol.texture = textures[Math.floor(Math.random() * textures.length)];
    });
  });
}

document.getElementById('spin-button').addEventListener('click', spin);
\nexport {};
