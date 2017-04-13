
import * as PIXI from 'pixi.js';
import STORAGE from './storage';

require('pixi-filters');

function generateNextLevel() {
    STORAGE.levelRooms.push([]);

    STORAGE.terrains.addChild(((levelGeom, x, y) => {
        const levelWallsContainer = new PIXI.Container();

        for (const r of levelGeom.getRects()) {
            //Basically, each rect represent a piece of wall on the level
            STORAGE.levelRooms[STORAGE.levelsGenerated].push(r);

            let tilingSprite = new PIXI.extras.TilingSprite(STORAGE.groundTexture, r.width + 1, r.height + 1);
            tilingSprite.position.set(r.x, r.y);
            tilingSprite.cacheAsBitmap = true;
            levelWallsContainer.addChild(tilingSprite);
        }
        levelWallsContainer.position.set(x, y);
        return levelWallsContainer;
    })(STORAGE.generateLevel.next().value, STORAGE.rendWidth / 2, STORAGE.levelsGenerated * 1000));

    STORAGE.mines.push(...mineInitializer(12));
    if(STORAGE.levelsGenerated <= 5) {
        STORAGE.enemies.push(...enemiesInitializer(STORAGE.levelsGenerated, STORAGE.levelsGenerated));
    } else {
        STORAGE.enemies.push(...enemiesInitializer(5, STORAGE.levelsGenerated));
    }
    ++STORAGE.levelsGenerated;
}

//returns contaner to attach using addChild
function customMenuButton(x, y, text, colorWarning = false) {
    // Color
    const colorPath = `../images/GUI/button${colorWarning? '-red' : ''}.jpg`;

    // Texture
    const buttonTextures = STORAGE.loader.resources[colorPath].texture;
    const buttonWidth = 240;
    const buttonHeight = 52;

    let button = new PIXI.Container();
    button.position.set(x - buttonWidth / 2, y - buttonHeight / 2);

    const buttonTexture = {
        normal  : new PIXI.Texture(buttonTextures, new PIXI.Rectangle(0, 0, buttonWidth, buttonHeight)),
        hover   : new PIXI.Texture(buttonTextures, new PIXI.Rectangle(0, buttonHeight, buttonWidth, buttonHeight))
    };

    let buttonSprite = new PIXI.Sprite(buttonTexture.normal);
    button.addChild(buttonSprite);

    // Text
    let innerText = new PIXI.Text(
        text,
        {
            fontFamily  : "Arial",
            fontSize    : 24,
            fill        : "white"
        }
    );

    innerText.position.set(buttonWidth / 2 - innerText.width / 2,
        buttonHeight / 2 - innerText.height / 2);
    button.addChild(innerText);

    // Events
    button.interactive = true;
    button.buttonMode = true;

    button.mouseover = function(e) {
        buttonSprite.texture = buttonTexture.hover;
    };

    button.mouseout = function (e) {
        buttonSprite.texture = buttonTexture.normal;
    };

    return button;
}

function getMenuBackground() {
    let bg = new PIXI.Sprite(STORAGE.loader.resources["../images/GUI/menu.jpg"].texture);
    bg.width = STORAGE.rendWidth;
    bg.height = STORAGE.rendHeight;

    return bg;
}

function Mine(coordX, coordY) {
    this.x = coordX;
    this.y = coordY;
    this.sprite = new PIXI.Sprite(Mine.prototype.textures[0]);
    this.sprite.position.set(this.x,this.y);
    this.sprite.anchor.set(0.5, 0.5);
    // this.sprite.pivot.y = 90;
    STORAGE.terrains.addChild(this.sprite);

    this.explode = false;
    this.explodeStage = 0;
}

Mine.prototype.textures = [];
Mine.prototype.radius = 50;

Mine.prototype.updateSprite = function() {
    ++this.explodeStage;
    this.sprite.texture = Mine.prototype.textures[this.explodeStage];
};


function Enemy(coordX, coordY, level) {
    this.x = coordX;
    this.y = coordY;
    this.level = level;
    this.sprite = new PIXI.Sprite(Enemy.prototype.textures[0]);
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.position.set(this.x,this.y);
    this.emitter = createBubbles(STORAGE.terrains, this.x, this.y);
    this.direction = 'left';
    this.dy = -1;
    STORAGE.terrains.addChild(this.sprite);

    this.isDestroyed = false;
    this.damageStage = 0;

    this.reloadTime = 0;
}

Enemy.prototype.textures = [];
Enemy.prototype.visionRange = STORAGE.enemiesVisionRange;
Enemy.prototype.width = 120;
Enemy.prototype.height = 74;

//checks wheter the enemy ship is in a state of battle
Enemy.prototype.inBattle = function() {
    return (Math.abs(this.sprite.getGlobalPosition().x - STORAGE.ship.x) < this.visionRange &&
       Math.abs(this.sprite.getGlobalPosition().y - STORAGE.ship.y) < this.visionRange)
};

Enemy.prototype.updateSprite = function() {
    if(this.damageStage != 1) {
        ++this.damageStage;
        this.sprite.texture = Enemy.prototype.textures[this.damageStage];
    } else {
        this.sprite.texture = Enemy.prototype.textures[2];
        this.isDestroyed = true;
    }
};
Enemy.prototype.updateBubbles = function() {
    if(this.direction === 'left') {
        this.emitter.updateSpawnPos(this.sprite.x + this.sprite.width / 2, this.sprite.y);
    } else {
        this.emitter.updateSpawnPos(this.sprite.x - this.sprite.width / 2, this.sprite.y);
    }
}


function Torpedo(coordX, coordY, direction) {
    this.x = coordX;
    this.y = coordY;
    this.direction = direction;

    this.sprite = new PIXI.Sprite(Torpedo.prototype.textures[0]);
    if(direction === 'right') {
        this.sprite.scale.x = -1;
    }
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.position.set(this.x, this.y);
    this.emitter = createBubbles(STORAGE.terrains, this.x, this.y, {
        "start": 0.1,
        "end": 0.2,
        "minimumScaleMultiplier":0.5
    }, 0.05);
    this.dx = (direction === 'right') ? 6 : -6;
    this.passedDistance = 0;
    STORAGE.terrains.addChild(this.sprite);

    this.explode = false;
    this.explodeStage = 0;
}

Torpedo.prototype.textures = [];
Torpedo.prototype.maxDistance = 600;

Torpedo.prototype.updateSprite = function() {
    ++this.explodeStage;
    this.sprite.texture = Torpedo.prototype.textures[this.explodeStage];
};
Torpedo.prototype.updateBubbles = function() {
    if(this.direction === 'left') {
        this.emitter.updateSpawnPos(this.sprite.x + this.sprite.width / 2, this.sprite.y);
    } else {
        this.emitter.updateSpawnPos(this.sprite.x - this.sprite.width / 2, this.sprite.y);
    }
}




function keyboard(keyCode) {
    let key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = function(event) {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = function(event) {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );

    return key;
}

//checks collisions with walls for torpedoes and ships
function wallsCollision(movingSprite, dx, dy, level) {
    const currentLevel = level !== undefined ? level :
        Math.floor((Math.abs(STORAGE.terrains.y) + STORAGE.rendHeight / 2) / 1000);
    if(!STORAGE.levelRooms[currentLevel]) {
        return true;
    }
    for(let wall of STORAGE.levelRooms[currentLevel]) { //here is the problem! 1 ship somehow gets to a not created level!
        const wallGlobalX = wall.x + wall.width / 2 + (STORAGE.terrains.x + STORAGE.rendWidth / 2);
        const wallGlobalY = currentLevel * 1000 + wall.y + wall.height / 2 + STORAGE.terrains.y;
        if(Math.abs(wallGlobalX + dx - movingSprite.getGlobalPosition().x) <
            wall.width / 2 + movingSprite.width / 2) {
                if(Math.abs(wallGlobalY + dy - movingSprite.getGlobalPosition().y) <
                    wall.height / 2 + movingSprite.height / 2) {
                        return true;
                }
        }
    }

    return false;
}

function hasCollided(ship, mine) {
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
    hit = false;

    ship.centerX = ship.getGlobalPosition().x;
    ship.centerY = ship.getGlobalPosition().y;
    mine.centerX = mine.getGlobalPosition().x;
    mine.centerY = mine.getGlobalPosition().y;

    ship.halfWidth = ship.width / 2;
    ship.halfHeight = ship.height / 2;
    vx = ship.centerX - mine.centerX;
    vy = ship.centerY - mine.centerY;

    combinedHalfWidths = ship.halfWidth + Mine.prototype.radius;
    combinedHalfHeights = ship.halfHeight + Mine.prototype.radius;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {
        hit = Math.abs(vy) < combinedHalfHeights;
    } else {
        hit = false;
    }

    return hit;
}


function mineCoords(x, y, width, height) {
    let resObj = {};
    let validPos = false;
    let attempt = 0;

    while(!validPos) {
        //154 - sprite width
        resObj.x = Math.floor(Math.random() * (width - 154))
            + (x + 77);
         //180 - sprite height
        resObj.y = Math.floor(Math.random() * (height - 180))
            + (y + 90);
        validPos = true;
        for(let wall of STORAGE.levelRooms[STORAGE.levelsGenerated]) {
            if(Math.abs(wall.x + STORAGE.rendWidth / 2 + wall.width / 2 - resObj.x) < wall.width / 2 + 77 &&
                Math.abs(wall.y + STORAGE.levelsGenerated * 1000 + wall.height / 2 - resObj.y)
                < wall.height / 2 + 90) {
                    validPos = false;
                    if(attempt === 100) {
                        return;
                    }
                    ++attempt;
                    break;
            }
        }
    }

    return resObj;
}

//initializes mines within given rectangle according to a level complexity
function mineInitializer(quantity) {
    const x = STORAGE.levelsGenerated ? STORAGE.rendWidth / 2 : STORAGE.rendWidth * 1.5;
    const y = STORAGE.levelsGenerated * 1000;
    const width = STORAGE.levelsGenerated ? 2880 : 2880 - STORAGE.rendWidth;
    const height = 1000;

    let created = [];
    for(let i = 0; i < quantity; ++i) {
        let coords = mineCoords(x, y, width, height);
        if(!coords) {
            break;
        }
        created.push(new Mine(coords.x, coords.y));
    }

    return created;
}


function enemyCoords(created, x, y, width, height) {
    let resObj = {};
    let validPos = false;
    let attempt = 0;

    let enemyX;
    let enemyY;
    outer: while(!validPos) {
        enemyX = Math.floor(Math.random() * (width - Enemy.prototype.width))
            + (x + Enemy.prototype.width / 2);
        enemyY = Math.floor(Math.random() * (height - Enemy.prototype.height))
            + (y + Enemy.prototype.height / 2);
        validPos = true;
        for(let enemy of created) {
            if((enemy.x < enemyX + Enemy.prototype.width) &&
                (enemy.x > enemyX - Enemy.prototype.width)) {
                    ++attempt;
                    if(attempt === 100) {
                        return;
                    }
                    validPos = false;
                    continue outer;
            }
        }
        for(let wall of STORAGE.levelRooms[STORAGE.levelsGenerated]) {
            if(Math.abs(wall.x + STORAGE.rendWidth / 2 + wall.width / 2 - enemyX) < wall.width / 2 + Enemy.prototype.width / 2 &&
                Math.abs(wall.y + STORAGE.levelsGenerated * 1000 + wall.height / 2 - enemyY)
                < wall.height / 2 + Enemy.prototype.height / 2) {
                    validPos = false;
                    if(attempt === 100) {
                        return;
                    }
                    ++attempt;
                    continue outer;
            }
        }
    }
    resObj.x = enemyX;
    resObj.y = enemyY;

    return resObj;
}

//enemies init
function enemiesInitializer(quantity, level) {
    const x = STORAGE.levelsGenerated ? STORAGE.rendWidth / 2 : STORAGE.rendWidth * 1.5;
    const y = STORAGE.levelsGenerated * 1000;
    const width = STORAGE.levelsGenerated ? 2880 : 2880 - STORAGE.rendWidth;
    const height = 1000;
    let created = [];

    for(let i = 0; i < quantity; ++i) {
        let coords = enemyCoords(created, x, y, width, height);
        if(!coords) {
            break;
        }
        created.push(new Enemy(coords.x, coords.y, level));
    }

    return created;
}

require('pixi-particles');
function createBubbles(container, x, y, scale, frequency) {
    return new PIXI.particles.Emitter(
        container,
        [PIXI.Texture.fromImage('../images/ship/bubble.png')],
        {
    		"alpha": {
    			"start": 1,
    			"end": 0.16
    		},
		    "scale": scale || {
				"start": 0.3,
				"end": 0.6,
				"minimumScaleMultiplier":0.5
			},
			"color": {
				"start": "ffffff",
				"end": "ffffff"
			},
			"speed": {
				"start": 600,
				"end": 200
			},
			"startRotation": {
				"min": 267,
				"max": 273
			},
			"rotationSpeed": {
				"min": 0,
				"max": 20
			},
			"lifetime": {
				"min": 0.8,
				"max": 1
			},
			"blendMode": "normal",
			"frequency": frequency || 0.2,
			"emitterLifetime": 0,
			"maxParticles": 500,
			"pos": {
				"x": x,
				"y": y
			},
			"addAtBack": false,
			"spawnType": "point"
		}
    );
}

module.exports.generateNextLevel = generateNextLevel;
module.exports.customMenuButton = customMenuButton;
module.exports.getMenuBackground = getMenuBackground;
module.exports.Mine = Mine;
module.exports.Enemy = Enemy;
module.exports.Torpedo = Torpedo;
module.exports.keyboard = keyboard;
module.exports.wallsCollision = wallsCollision;
module.exports.hasCollided = hasCollided;
module.exports.mineInitializer = mineInitializer;
module.exports.enemiesInitializer = enemiesInitializer;
module.exports.createBubbles = createBubbles;
