import * as PIXI from 'pixi.js';
import STORAGE from './storage';
import * as SUPPORT from './support';
import play from './../states/play';
import setupGameScene from './setup-game-scene';

function setupPauseMenu() {
    STORAGE.pauseMenuScene.addChild(SUPPORT.getMenuBackground());

    const pauseText = new PIXI.Text(
        "Pause:",
    {fontFamily: "Arial", fontSize: 32, fill: "white"}
    );
    pauseText.position.set(STORAGE.rendWidth / 2  - pauseText.width / 2,
    STORAGE.rendHeight / 4 - pauseText.height / 2);
    STORAGE.pauseMenuScene.addChild(pauseText);

    const resumeFunc = function() {
        STORAGE.pauseMenuScene.visible = false;
        STORAGE.gameScene.visible = true;
        STORAGE.state = play;
    };

    const buttonResume = SUPPORT.customMenuButton(STORAGE.rendWidth / 2, STORAGE.rendHeight / 2, 'Resume');
    buttonResume.click = resumeFunc;
    STORAGE.pauseMenuScene.addChild(buttonResume);

    const toggleSoundFunc = function() {
        if(buttonSound.children[1].text === 'Turn off sound') {
            buttonSound.children[1].text = 'Turn on sound';
            STORAGE.mainSound.pause();
            STORAGE.isMuted = true;
        } else {
            buttonSound.children[1].text = 'Turn off sound';
            STORAGE.mainSound.play();
            STORAGE.isMuted = false;
        }
    };

    const buttonSound = SUPPORT.customMenuButton(STORAGE.rendWidth / 2, 5 * STORAGE.rendHeight / 8, 'Turn off sound');
    buttonSound.click = toggleSoundFunc;
    STORAGE.pauseMenuScene.addChild(buttonSound);

    const resetFunc = function() {
        STORAGE.mainSound.unload();
        setupGameScene();
        STORAGE.pauseMenuScene.visible = false;
        STORAGE.gameScene.visible = true;
        STORAGE.state = play;
    };

    const buttonReset = SUPPORT.customMenuButton(STORAGE.rendWidth / 2, 3 * STORAGE.rendHeight / 4, 'Reset', true);
    buttonReset.click = resetFunc;
    STORAGE.pauseMenuScene.addChild(buttonReset);

    STORAGE.stage.addChild(STORAGE.pauseMenuScene);
    STORAGE.pauseMenuScene.visible = false;
}

export default setupPauseMenu;
