import * as PIXI from 'pixi.js';
import STORAGE from './storage';
import SUPPORT from './support';
import levelGenerator from './../levelGenerator/levels';


function setupGameScene() {
    //clean-up
    STORAGE.mines = [];
    STORAGE.enemies = [];
    SUPPORT.Enemy.prototype.visionRange = STORAGE.rendWidth / 2;
    SUPPORT.Torpedo.prototype.maxDistance = STORAGE.rendWidth * 1.5;
    STORAGE.torpedoes = [];
    STORAGE.enemyTorpedoes = [];
    STORAGE.shipX = 0;
    STORAGE.shipY = 0;
    STORAGE.hp = 100;
    STORAGE.score = 0;
    STORAGE.terrains = new PIXI.Container();
    STORAGE.gameScene = new PIXI.Container();
    STORAGE.background = new PIXI.Container();
    STORAGE.generateLevel = levelGenerator();
    STORAGE.levelsGenerated = 0;
    STORAGE.levelRooms = [];
    STORAGE.gameOverTicker = undefined;

    //background
    let bg = new PIXI.Sprite(STORAGE.loader.resources["../images/scene/bg.jpg"].texture);
    bg.scale.set(1.5, 1.5);
    bg.anchor.set(0.2, 0.2);
    const colorMatrix =  [
        1,0,0,-0.5,
        0,1,0,-0.5,
        0,0,1,-0.5,
        0,0,0,1
    ];
    STORAGE.filter = new PIXI.filters.ColorMatrixFilter();
    STORAGE.filter.matrix = colorMatrix;
    require('pixi-filters');
    STORAGE.shockwaveFilter = new PIXI.filters.ShockwaveFilter();
    STORAGE.background.filters = [STORAGE.filter, STORAGE.shockwaveFilter];
    STORAGE.background.addChild(bg);

    //mines
    let mineTextures = STORAGE.loader.resources["../images/trap/chainless-mine.png"].texture;
    for(let i = 0; i < 5; ++i) {
        let mineTexture = new PIXI.Texture(mineTextures, new PIXI.Rectangle(i * 154, 2, 154, 180));
        SUPPORT.Mine.prototype.textures.push(mineTexture);
    }

    //enemies
    let shipsTextures = STORAGE.loader.resources["../images/ship/bathyscaphe-enemy.png"].texture;
    for(let i = 0; i < 3; ++i) {
        let y = i === 0 ? 4 : i * 90;
        let enemyTexture = new PIXI.Texture(shipsTextures, new PIXI.Rectangle(30, y, 120, 75));
        SUPPORT.Enemy.prototype.textures.push(enemyTexture);
    }

    //torpedoes
    let torpTexture;
    let torpTextures = STORAGE.loader.resources["../images/ammo/torpedo.png"].texture;
    torpTexture = new PIXI.Texture(torpTextures, new PIXI.Rectangle(6, 0, 87, 14)); //0
    SUPPORT.Torpedo.prototype.textures.push(torpTexture);
    torpTexture = new PIXI.Texture(torpTextures, new PIXI.Rectangle(2, 38, 95, 40)); //1
    SUPPORT.Torpedo.prototype.textures.push(torpTexture);
    torpTexture = new PIXI.Texture(torpTextures, new PIXI.Rectangle(4, 115, 90, 60)); //2
    SUPPORT.Torpedo.prototype.textures.push(torpTexture);
    torpTexture = new PIXI.Texture(torpTextures, new PIXI.Rectangle(7, 190, 90, 85)); //3
    SUPPORT.Torpedo.prototype.textures.push(torpTexture);
    torpTexture = new PIXI.Texture(torpTextures, new PIXI.Rectangle(4, 279, 93, 80)); //4
    SUPPORT.Torpedo.prototype.textures.push(torpTexture);

    //player
    STORAGE.playerTextures = [];
    let playerTextures = STORAGE.loader.resources["../images/ship/bathyscaphe-player.png"].texture;
    // let playerTexture = new PIXI.Texture(playerTextures, new PIXI.Rectangle(30, 4, 120, 75));
    // STORAGE.ship = new PIXI.Sprite(playerTexture);
    for(let i = 0; i < 3; ++i) {
        let y = i === 0 ? 4 : i * 90;
        let playerTexture = new PIXI.Texture(playerTextures, new PIXI.Rectangle(30, y, 120, 75));
        STORAGE.playerTextures.push(playerTexture);
    }
    STORAGE.ship = new PIXI.Sprite(STORAGE.playerTextures[0]);
    STORAGE.ship.anchor.set(0.5, 0.5);
    STORAGE.ship.position.set(STORAGE.rendWidth / 2, STORAGE.rendHeight / 2);
    STORAGE.ship.direction = 'left';

    //WALLS
    /////////////////////////////////////////////////////////
    const groundTextures = STORAGE.loader.resources["../images/scene/ground.jpg"].texture;
    STORAGE.groundTexture = new PIXI.Texture(groundTextures, new PIXI.Rectangle(0, 0, 128, 128));

    //Generate 2 levels. Player must not see the generation process.
    for(let i = 0; i < 2; ++i) {
        SUPPORT.generateNextLevel();
    }
    ////////////////////////////////////////////////////

    //velocity panel
    STORAGE.GUIScene = new PIXI.Container();
    let velocityTextures = STORAGE.loader.resources["../images/GUI/velocity.png"].texture;
    const velocityPanelContainer = new PIXI.Container();

    const velocityPanelTexture = new PIXI.Texture(velocityTextures, new PIXI.Rectangle(0, 0, 220, 235));
    const velocityPanelSprite = new PIXI.Sprite(velocityPanelTexture);
    velocityPanelContainer.addChild(velocityPanelSprite);
    velocityPanelContainer.position.set(STORAGE.rendWidth - 1.05 * velocityPanelSprite.width,
        STORAGE.rendHeight - 1.05 * velocityPanelSprite.height);
    STORAGE.GUIScene.addChild(velocityPanelContainer);

    const leftArrowTexture = new PIXI.Texture(velocityTextures, new PIXI.Rectangle(222, 0, 26, 26));
    const rightArrowTexture = new PIXI.Texture(velocityTextures, new PIXI.Rectangle(222, 27, 26, 26));
    const upArrowTexture = new PIXI.Texture(velocityTextures, new PIXI.Rectangle(222, 54, 26, 26));
    const downArrowTexture = new PIXI.Texture(velocityTextures, new PIXI.Rectangle(222, 81, 26, 26));
    STORAGE.velocityArrows.left = [];
    for(let i = 0; i < 3; ++i) {
        let arrowSprite = new PIXI.Sprite(leftArrowTexture);
        arrowSprite.anchor.set(0.5, 0.5);
        arrowSprite.position.set(112 - 28 - i * 6, 137);
        arrowSprite.visible = false;
        STORAGE.velocityArrows.left.push(arrowSprite);
        velocityPanelContainer.addChild(arrowSprite);
    }
    STORAGE.velocityArrows.right = [];
    for(let i = 0; i < 3; ++i) {
        let arrowSprite = new PIXI.Sprite(rightArrowTexture);
        arrowSprite.anchor.set(0.5, 0.5);
        arrowSprite.position.set(112 + 28 + i * 6, 137);
        arrowSprite.visible = false;
        STORAGE.velocityArrows.right.push(arrowSprite);
        velocityPanelContainer.addChild(arrowSprite);
    }
    STORAGE.velocityArrows.up = [];
    for(let i = 0; i < 3; ++i) {
        let arrowSprite = new PIXI.Sprite(upArrowTexture);
        arrowSprite.anchor.set(0.5, 0.5);
        arrowSprite.position.set(112, 136 - 28 - i * 6);
        arrowSprite.visible = false;
        STORAGE.velocityArrows.up.push(arrowSprite);
        velocityPanelContainer.addChild(arrowSprite);
    }
    STORAGE.velocityArrows.down = [];
    for(let i = 0; i < 3; ++i) {
        let arrowSprite = new PIXI.Sprite(downArrowTexture);
        arrowSprite.anchor.set(0.5, 0.5);
        arrowSprite.position.set(112, 136 + 28 + i * 6);
        arrowSprite.visible = false;
        STORAGE.velocityArrows.down.push(arrowSprite);
        velocityPanelContainer.addChild(arrowSprite);
    }

    //hp bar
    const hpPanelTexture = STORAGE.loader.resources["../images/GUI/hp-panel.png"].texture;
    const hpPanelContainer = new PIXI.Container();
    STORAGE.healthBar = new PIXI.Container();
    STORAGE.healthBar.position.set(189, 37);
    hpPanelContainer.addChild(STORAGE.healthBar);
    let hpBar = new PIXI.Graphics();
    hpBar.beginFill(0xef0000);
    hpBar.drawRect(0, 0, 220, 32);
    hpBar.endFill();
    STORAGE.healthBar.addChild(hpBar);

    const hpPanelSprite = new PIXI.Sprite(hpPanelTexture);
    hpPanelContainer.addChild(hpPanelSprite);
    STORAGE.GUIScene.addChild(hpPanelContainer);



    // Ammo panel
    let ammoTextures = STORAGE.loader.resources["../images/GUI/ammo.png"].texture;
    const ammoPanelContainer = new PIXI.Container();
    const ammoPanelTexture = new PIXI.Texture(ammoTextures, new PIXI.Rectangle(0, 0, 252, 265));
    const ammoPanelSprite = new PIXI.Sprite(ammoPanelTexture);
    ammoPanelContainer.addChild(ammoPanelSprite);
    ammoPanelContainer.position.set(20,
    STORAGE.rendHeight - 1.05 * ammoPanelSprite.height);
    STORAGE.GUIScene.addChild(ammoPanelContainer);

    //score panel
    const scorePanelTexture = STORAGE.loader.resources["../images/GUI/score.png"].texture;
    const scorePanelContainer = new PIXI.Container();
    const scorePanelSprite = new PIXI.Sprite(scorePanelTexture);
    scorePanelContainer.addChild(scorePanelSprite);
    if(STORAGE.rendWidth / 2 - scorePanelContainer.width / 2 < hpPanelContainer.width) {
        scorePanelContainer.x = hpPanelContainer.width + 20;
    } else {
        scorePanelContainer.position.x = STORAGE.rendWidth / 2 - scorePanelContainer.width / 2;
    }
    scorePanelContainer.position.y = 20;

    STORAGE.scoreText = new PIXI.Text(
        "Depth:" + STORAGE.score,
        {fontFamily: "Courier", fontSize: 24, fill: "white"}
    );
    STORAGE.scoreText.anchor.set(0.5, 0.5);
    STORAGE.scoreText.position.set(scorePanelContainer.width / 2, scorePanelContainer.height / 2 - 16);
    scorePanelContainer.addChild(STORAGE.scoreText);
    STORAGE.GUIScene.addChild(scorePanelContainer);

    STORAGE.gameScene.addChild(STORAGE.background);
    STORAGE.gameScene.addChild(STORAGE.terrains);
    STORAGE.terrains.position.x = -STORAGE.rendWidth / 2;
    STORAGE.gameScene.addChild(STORAGE.ship);
    STORAGE.gameScene.addChild(STORAGE.GUIScene);

    //player bublues
    STORAGE.playerEmitter = SUPPORT.createBubbles(STORAGE.terrains,
        STORAGE.rendWidth + STORAGE.ship.width / 2, STORAGE.rendHeight / 2);
    STORAGE.playerEmitter.frequency = 0.5;
    STORAGE.elapsed = Date.now(); //needed for emittors updating

    STORAGE.stage.addChild(STORAGE.gameScene);


    // sounds
    let sound0;
    let sound1;
    let sound2;
    sound0 = new Howl({
    src: ['./sounds/in-game-2.mp3'],
    volume: 0.5,
    onend: function() {
          STORAGE.mainSound = sound1;
          STORAGE.mainSound.play();
       }
    });
    sound1 = new Howl({
    src: ['./sounds/in-game-1.mp3'],
    volume: 0.5,
    onend: function() {
          STORAGE.mainSound = sound2;
          STORAGE.mainSound.play();
       }
    });
    sound2 = new Howl({
    src: ['./sounds/in-game-0.mp3'],
    volume: 0.5,
    onend: function() {
          STORAGE.mainSound = sound0;
          STORAGE.mainSound.play();
       }
    });
    STORAGE.mainSound = sound0;
    if(!STORAGE.isMuted) {
            STORAGE.mainSound.play();
    }

    STORAGE.blasts = new Howl({
        src: ['./sounds/blasts.wav'],
        sprite: {
            mineBlast: [13400, 3000],
            torpedoHitBlast: [3100, 1500]
        }
    });
}

module.exports = setupGameScene;
