import STORAGE from './storage';
import * as SUPPORT from './support';
import setupMainMenu from './setup-main-menu';
import setupPauseMenu from './setup-pause-menu';
import setupGameOverMenu from './setup-game-over-menu';
import play from './../states/play';
import gameLoop from './../view/game-loop';
import * as GUIsupport from './../view/gui-support';
import Howler from 'howler';

function setup() {
    setupPauseMenu();
    setupMainMenu();
    setupGameOverMenu();


    //----------------controls--------------------------//
    let keyboard = SUPPORT.keyboard;

    const left = keyboard(37);
    const up = keyboard(38);
    const right = keyboard(39);
    const down = keyboard(40);
    const keyZ = keyboard(90);
    const keyX = keyboard(88);
    const escape = keyboard(27);

    left.press = function() {
        if(STORAGE.state != play) {
            return;
        }
        if(STORAGE.shipX < 3) {
            if(STORAGE.shipX === 0) {
                if(STORAGE.ship.direction === 'right') {
                    STORAGE.ship.scale.x = 1;
                    STORAGE.ship.direction = 'left';
                    STORAGE.playerEmitter.updateSpawnPos(STORAGE.rendWidth / 2 - STORAGE.terrains.x
                         + STORAGE.ship.width / 2, STORAGE.rendHeight / 2 - STORAGE.terrains.y);
                    STORAGE.playerEmitter.frequency = 0.5;
                }
                else {
                    STORAGE.shipX += 1;
                    STORAGE.playerEmitter.frequency = STORAGE.shipX != 0 ? 0.25 - STORAGE.shipX * 0.05 : 0.5;
                    GUIsupport.updateArrows('horizontal');
                }
            } else {
                STORAGE.shipX += 1;
                STORAGE.playerEmitter.frequency = STORAGE.shipX != 0 ? 0.25 - STORAGE.shipX * 0.05 : 0.5;
                GUIsupport.updateArrows('horizontal');
            }
        }
        STORAGE.isFloating = true;
    };
    up.press = function() {
        if(STORAGE.state != play) {
            return;
        }
        if(STORAGE.shipY < 3) {
            STORAGE.shipY += 1;
            GUIsupport.updateArrows('vertical');
        }
        STORAGE.isFloating = true;
    };
    right.press = function() {
        if(STORAGE.state != play) {
            return;
        }
        if(STORAGE.shipX > -3) {
            if(STORAGE.shipX === 0) {
                if(STORAGE.ship.direction === 'left') {
                    STORAGE.ship.scale.x = -1;
                    STORAGE.ship.direction = 'right';
                    STORAGE.playerEmitter.updateSpawnPos(STORAGE.rendWidth / 2 - STORAGE.terrains.x
                         - STORAGE.ship.width / 2, STORAGE.rendHeight / 2 - STORAGE.terrains.y);
                    STORAGE.playerEmitter.frequency = 0.5;
                } else {
                    STORAGE.shipX -= 1;
                    STORAGE.playerEmitter.frequency = STORAGE.shipX != 0 ? 0.25 + STORAGE.shipX * 0.05 : 0.5;
                    GUIsupport.updateArrows('horizontal');
                }
            } else {
                STORAGE.shipX -= 1;
                STORAGE.playerEmitter.frequency = STORAGE.shipX != 0 ? 0.25 + STORAGE.shipX * 0.05 : 0.5;
                GUIsupport.updateArrows('horizontal');
            }
        }
        STORAGE.isFloating = true;
    };
    down.press = function() {
        if(STORAGE.state != play) {
            return;
        }
        if(STORAGE.shipY > -3) {
            STORAGE.shipY -= 1;
            GUIsupport.updateArrows('vertical');
        }
        STORAGE.isFloating = true;
    };
    keyX.press = function() {
        if(STORAGE.state != play) {
            return;
        }
        if(!STORAGE.playerReloading) {
            let bomb = new SUPPORT.DepthBomb();
            STORAGE.depthBombs.push(bomb);
            STORAGE.playerReloading = 120;
        }
    };
    keyZ.press = function() {
        if(STORAGE.state != play) {
            return;
        }
        if(!STORAGE.playerReloading) {
            let torp = new SUPPORT.Torpedo(-STORAGE.terrains.x + STORAGE.rendWidth / 2,
                -STORAGE.terrains.y + STORAGE.rendHeight / 2, STORAGE.ship.direction, true);
            STORAGE.torpedoes.push(torp);
            STORAGE.playerReloading = 60;
        }
    };
    escape.press = function() {
        if(STORAGE.state === play) {
            STORAGE.state = 'pause';
            STORAGE.gameScene.visible = false;
            STORAGE.pauseMenuScene.visible = true;
        } else if(STORAGE.state === 'pause') {
            STORAGE.state = play;
            STORAGE.gameScene.visible = true;
            STORAGE.pauseMenuScene.visible = false;
        }
    };
    //--------------------------------------------------//

    STORAGE.mainSound = new Howl({
        src: ['./sounds/menu.mp3'],
        autoplay: true,
        volume: 0.5,
    });
    gameLoop();
}

export default setup;
