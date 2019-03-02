/* global document */
import * as PIXI from 'pixi.js';
import STORAGE from './scenesSetup/storage';
import setup from './scenesSetup/setup';

document.body.style.margin = 0;
document.body.style.overflow = "hidden";
STORAGE.rendWidth = document.documentElement.clientWidth;
STORAGE.rendHeight = document.documentElement.clientHeight;

STORAGE.renderer = PIXI.autoDetectRenderer(STORAGE.rendWidth, STORAGE.rendHeight);
document.body.appendChild(STORAGE.renderer.view);

STORAGE.loader
    .add("../images/scene/bg.jpg")
    .add("../images/scene/displacement.png")
    .add("../images/GUI/menu.jpg")
    .add("../images/ship/bathyscaphe-player.png")
    .add("../images/ship/bathyscaphe-enemy.png")
    .add("../images/trap/chainless-mine.png")
    .add("../images/ammo/torpedo.png")
    .add("../images/ammo/depth-bomb.png")
    .add("../images/scene/ground.jpg")
    .add("../images/GUI/velocity.png")
    .add("../images/GUI/hp-panel.png")
    .add("../images/GUI/score.png")
    .add("../images/GUI/ammo.png")
    .add("../images/GUI/button.jpg")
    .add("../images/GUI/button-red.jpg")
    .load(setup);
