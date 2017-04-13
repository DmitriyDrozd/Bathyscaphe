import * as PIXI from 'pixi.js';
import STORAGE from './storage';
import SUPPORT from './support';
import play from './../states/play';
import setupGameScene from './setup-game-scene';



function setupMainMenu() {
    STORAGE.mainMenuScene.addChild(SUPPORT.getMenuBackground());

    const logoText = new PIXI.Text(
        "BATHYSCAPHE",
    {fontFamily: "Arial", fontSize: 32, fill: "white"}
    );
    logoText.position.set(STORAGE.rendWidth / 2  - logoText.width / 2,
    STORAGE.rendHeight / 4 - logoText.height / 2);
    STORAGE.mainMenuScene.addChild(logoText);

    const setupFunc = function() {
        STORAGE.mainSound.unload();
        setupGameScene();
        STORAGE.mainMenuScene.visible = false;
        STORAGE.gameScene.visible = true;
        STORAGE.state = play;
    };
    const button = SUPPORT.customMenuButton(STORAGE.rendWidth / 2, STORAGE.rendHeight / 2, 'Start game');
    button.click = setupFunc;
    STORAGE.mainMenuScene.addChild(button);


    STORAGE.stage.addChild(STORAGE.mainMenuScene);
}

module.exports = setupMainMenu;
