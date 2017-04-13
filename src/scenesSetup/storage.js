import * as PIXI from 'pixi.js';

let storage = {
    //-----pixi utilities------//
    Sprite      : PIXI.Sprite,
	loader      : PIXI.loader,
	TextureCache: PIXI.utils.TextureCache,
    //-------------------------//

    //--------params-----------//
    playerTextures  : [],
    filter          : null,
    shockwaveFilter : null,

    generateLevel   : null,
    levelsGenerated : 0,
    levelRooms      : [],
    groundTexture   : null,

	rendWidth   : null,
	rendHeight  : null,
	renderer    : null,

    state   : null,
	ship    : null,
	shipX   : 0,
	shipY   : 0,

	isFloating  : true,
	counter     : 1,
	floating    : 0,
	deltaFloaing: 1,

    enemiesReloadTime       : 120,
    explosionAnimationPeriod: 10,
    enemiesVisionRange      : 400,

    hp : 100,
    score : 0,
    //-------------------------//

    //--------scenes-----------//
	stage           : new PIXI.Container(),
    mainMenuScene   : new PIXI.Container(),
	pauseMenuScene  : new PIXI.Container(),
	gameScene       : null,
	terrains        : null,
    background      : null,
	gameOverScene   : new PIXI.Container(),
    GUIScene        : null,

    velocityArrows  : {
        left    : [],
        up      : [],
        right   : [],
        down    : []
    },
    healthBar   : null,
    //--------params-----------//

    //----in-game objects------//
    mines           : [],
	enemies         : [],
	torpedoes       : [],
	enemyTorpedoes  : [],
    //-------------------------//

};

module.exports = storage;
