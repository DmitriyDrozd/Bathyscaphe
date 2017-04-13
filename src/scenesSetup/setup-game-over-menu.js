import * as PIXI from 'pixi.js';
import STORAGE from './storage';
import SUPPORT from './support';
import play from './../states/play';
import setupGameScene from './setup-game-scene';

function setupGameOverMenu() {
    STORAGE.gameOverScene.addChild(SUPPORT.getMenuBackground());

    const gameOverText = new PIXI.Text(
        "Game Over!",
    {fontFamily: "Arial", fontSize: 32, fill: "white"}
    );
    gameOverText.position.set(STORAGE.rendWidth / 2  - gameOverText.width / 2,
    STORAGE.rendHeight / 4 - gameOverText.height / 2);
    STORAGE.gameOverScene.addChild(gameOverText);

    STORAGE.gameOverScore = new PIXI.Text(
        "Your score: " + STORAGE.score,
    {fontFamily: "Arial", fontSize: 32, fill: "white"}
    );
    STORAGE.gameOverScore.position.set(STORAGE.rendWidth / 2  - STORAGE.gameOverScore.width / 2,
    STORAGE.rendHeight / 2 - STORAGE.gameOverScore.height / 2);
    STORAGE.gameOverScene.addChild(STORAGE.gameOverScore);

    const resetFunc = function() {
        STORAGE.mainSound.unload();
        setupGameScene();
        STORAGE.state = play;
        STORAGE.gameOverScene.visible = false;
        STORAGE.gameScene.visible = true;
    };
    const buttonReset = SUPPORT.customMenuButton(STORAGE.rendWidth / 2, 3 * STORAGE.rendHeight / 4, 'Play Again!');
    buttonReset.click = resetFunc;
    STORAGE.gameOverScene.addChild(buttonReset);

    STORAGE.stage.addChild(STORAGE.gameOverScene);
    STORAGE.gameOverScene.visible = false;
}

module.exports = setupGameOverMenu;
