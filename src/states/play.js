//All the game logic goes here
import STORAGE from './../scenesSetup/storage';
import * as SUPPORT from './../scenesSetup/support';
import * as GUIsupport from './../view/gui-support';

function play() {
    let mines = STORAGE.mines;
    let enemies = STORAGE.enemies;
    let torpedoes = STORAGE.torpedoes;
    let enemyTorpedoes = STORAGE.enemyTorpedoes;
    let depthBombs = STORAGE.depthBombs;

    //bg filters
    let bright = (10000 + STORAGE.terrains.y) / 10000;
    STORAGE.filter.brightness(bright, false);
    STORAGE.displacementSprite.x += 20;
    //--

    if(STORAGE.hp <= 0) {
        if(STORAGE.gameOverTicker === undefined) {
            STORAGE.gameOverTicker = 1;
            STORAGE.ship.texture = STORAGE.playerTextures[2];
        } else if(STORAGE.gameOverTicker < 120) { //drowning for 2 seconds
            const drowningSpeed = 2;
            if(!SUPPORT.wallsCollision(STORAGE.ship, 0, -drowningSpeed)) {
                STORAGE.ship.position.y += drowningSpeed;
                if(STORAGE.ship.direction === 'left') {
                  STORAGE.ship.rotation += 0.01;
                } else {
                  STORAGE.ship.rotation -= 0.01;
                }
            }
            ++STORAGE.gameOverTicker;
        } else {
            STORAGE.gameOverScore.text = "Your score: " + STORAGE.score;
            STORAGE.state = null;
            STORAGE.gameScene.visible = false;
            STORAGE.gameOverScene.visible = true;
            return;
        }
    }

    //bubbles
    if(STORAGE.ship.direction === 'right') {
        STORAGE.playerEmitter.updateSpawnPos(STORAGE.rendWidth / 2 - STORAGE.terrains.x
             - STORAGE.ship.width / 2, STORAGE.rendHeight / 2 - STORAGE.terrains.y);
    } else {
        STORAGE.playerEmitter.updateSpawnPos(STORAGE.rendWidth / 2 - STORAGE.terrains.x
             + STORAGE.ship.width / 2, STORAGE.rendHeight / 2 - STORAGE.terrains.y);
    }
    STORAGE.playerEmitter.update((STORAGE.now - STORAGE.elapsed) * 0.001);

    //reloading player attack
    if(STORAGE.playerReloading > 0) {
        --STORAGE.playerReloading;
    }

    //generates next level when the current one is passed
    if(Math.abs(STORAGE.terrains.y) + STORAGE.rendHeight / 2 > (STORAGE.levelsGenerated - 1) * 1000) {
        SUPPORT.generateNextLevel();
    }

    //player's collisions
    if(SUPPORT.wallsCollision(STORAGE.ship, STORAGE.shipX, STORAGE.shipY)) {
        STORAGE.shipX = 0;
        STORAGE.shipY = 0;
        GUIsupport.updateArrows('both');
    }

    STORAGE.isFloating = false; //disabled to ease the testing

    if((STORAGE.ship.y - (STORAGE.ship.height / 2) - STORAGE.shipY - STORAGE.deltaFloaing < STORAGE.terrains.y) ||
        (STORAGE.ship.y + (STORAGE.ship.height / 2) - STORAGE.shipY - STORAGE.deltaFloaing > STORAGE.terrains.y + STORAGE.terrains.height)) {
          STORAGE.isFloating = false;
    }

    //player's floating control
    if(STORAGE.floating === 8 || STORAGE.floating === -8) {
        STORAGE.deltaFloaing *= -1;
    }
    let floatShift = 0;
    if(STORAGE.isFloating && STORAGE.counter % 4 === 0) {
        STORAGE.floating += STORAGE.deltaFloaing;
        floatShift = deltaFloaing;
        STORAGE.counter = 1;
    }
    ++STORAGE.counter;

    //player's movement
    STORAGE.terrains.x += STORAGE.shipX;
    STORAGE.terrains.y += STORAGE.shipY + floatShift;

    //background movement
    STORAGE.background.x += STORAGE.shipX / 3;
    STORAGE.background.y += STORAGE.shipY / 10;

    //mines control
    for(let mine of mines) {
        if(!mine.explode && SUPPORT.hasCollided(STORAGE.ship, mine.sprite)) {
            const prevHP = STORAGE.hp;
            STORAGE.hp -= 5;
            if(prevHP > 50 && STORAGE.hp <= 50) {
                STORAGE.ship.texture = STORAGE.playerTextures[1];
            }
            GUIsupport.updateHealthBar();

            mine.explode = true;
            mine.ticker = 1;
            if(!STORAGE.isMuted) {
                STORAGE.blasts.play('mineBlast');
            }
        }
        if(mine.explode) {
            ++mine.ticker;
            if(mine.ticker % STORAGE.explosionAnimationPeriod === 0) {
                if(mine.explodeStage != 4) {
                    mine.updateSprite();
                } else {
                    STORAGE.terrains.removeChild(mine.sprite);
                    let mineIndex = mines.indexOf(mine);
                    mines.splice(mineIndex, 1);
                    break;
                }
            }
        }
    }

    //enemies
    for(let enemy of enemies) {
        //remove enemies trying to move to a not generated level
        let currLevel = Math.floor(enemy.sprite.position.y / 1000);
        if(enemy.sprite.position.y >= 1000 * STORAGE.levelsGenerated) {
            enemy.emitter.destroy();  //here we are again...
            STORAGE.terrains.removeChild(enemy.sprite);
            let enemyIndex = enemies.indexOf(enemy);
            enemies.splice(enemyIndex, 1);
            break;
        } else if(currLevel != enemy.level) {
            if(enemy.dy > 0) {
                ++enemy.level;
            } else {
                --enemy.level;
            }
        }

        if(!enemy.isDestroyed) {
            if(enemy.inBattle() === true) {
                if(enemy.sprite.getGlobalPosition().x > STORAGE.ship.x && enemy.direction !== 'left') {
                    enemy.sprite.scale.x = 1;
                    enemy.direction = 'left';
                } else if(enemy.sprite.getGlobalPosition().x < STORAGE.ship.x && enemy.direction !== 'right') {
                    enemy.sprite.scale.x = -1;
                    enemy.direction = 'right';
                }
                //vertical correction
                if(enemy.sprite.getGlobalPosition().y < STORAGE.ship.y) {
                    enemy.dy = 1;
                    if(SUPPORT.wallsCollision(enemy.sprite, 0, -enemy.dy, enemy.level)) {
                        enemy.dy = 0;
                    }
                } else if(enemy.sprite.getGlobalPosition().y > STORAGE.ship.y) {
                    enemy.dy = -1;
                    if(SUPPORT.wallsCollision(enemy.sprite, 0, -enemy.dy, enemy.level)) {
                        enemy.dy = 0;
                    }
                } else {
                    enemy.dy = 0;
                }

                //FIRE
                if(enemy.reloadTime) {
                    --enemy.reloadTime;
                }
                if(Math.abs(enemy.sprite.getGlobalPosition().y - STORAGE.ship.y) < 3 && !enemy.reloadTime) {
                    let torp = new SUPPORT.Torpedo(enemy.sprite.position.x, enemy.sprite.position.y,
                        enemy.direction, false);
                    enemyTorpedoes.push(torp);
                    enemy.reloadTime = STORAGE.enemiesReloadTime;
                }

            }
             else if(SUPPORT.wallsCollision(enemy.sprite, 0, enemy.dy, enemy.level)) {
                enemy.dy *= -1;
                enemy.sprite.position.y += 2*enemy.dy;
            } else if(enemy.dy === 0) {
                enemy.dy = 1;
            }
            enemy.sprite.position.y += enemy.dy;
            enemy.updateBubbles();
            enemy.emitter.update((STORAGE.now - STORAGE.elapsed) * 0.001);
        } else {
            if(!enemy.ticker) {
                enemy.ticker = 1;
                enemy.emitter.destroy();
            } else {
                ++enemy.ticker;
            }
            if(enemy.ticker < 120) { //drowning for 2 seconds
                const drowningSpeed = 2;
                if(!SUPPORT.wallsCollision(enemy.sprite, 0, -drowningSpeed, enemy.level)) {
                    enemy.sprite.position.y += drowningSpeed;
                    if(enemy.direction === 'left') {
                      enemy.sprite.rotation += 0.01;
                    } else {
                      enemy.sprite.rotation -= 0.01;
                    }
                }
            } else {
                STORAGE.terrains.removeChild(enemy.sprite);
                let enemyIndex = enemies.indexOf(enemy);
                enemies.splice(enemyIndex, 1);
            }
        }
    }

    //torpedoes
    torpMark: for(let i = 0; i < torpedoes.length; ++i) {
        //explosions
        if(torpedoes[i].explode) {
            ++torpedoes[i].ticker;
            if(torpedoes[i].ticker % STORAGE.explosionAnimationPeriod === 0) {
                if(torpedoes[i].explodeStage != 4) {
                    torpedoes[i].updateSprite();
                } else {
                    STORAGE.terrains.removeChild(torpedoes[i].sprite);
                    torpedoes.splice(i, 1);
                    --i;
                }
            }
            continue;
        }
        //movement
        if(Math.abs(torpedoes[i].passedDistance) < torpedoes[i].maxDistance) {
            torpedoes[i].passedDistance += torpedoes[i].dx;
            torpedoes[i].sprite.x += torpedoes[i].dx;
            torpedoes[i].updateBubbles();
            torpedoes[i].emitter.update((STORAGE.now - STORAGE.elapsed) * 0.001);
        } else {
            torpedoes[i].explode = true;
            torpedoes[i].ticker = 1;
            torpedoes[i].emitter.destroy();
            continue;
        }

        //detonations
        for(let mine of mines) {
            if(SUPPORT.hasCollided(torpedoes[i].sprite, mine.sprite) &&
                !mine.explode) {
                mine.explode = true;
                mine.ticker = 1;
                torpedoes[i].emitter.destroy();


                torpedoes[i].explode = true;
                torpedoes[i].ticker = 1;
                if(!STORAGE.isMuted) {
                    STORAGE.blasts.play('torpedoHitBlast');
                }
                continue torpMark;
            }
        }
        for(let enemy of enemies) {
            if(SUPPORT.hasCollided(torpedoes[i].sprite, enemy.sprite) &&
                !enemy.isDestroyed) {
                if(!enemy.isDestroyed) {
                    enemy.updateSprite();
                }
                torpedoes[i].explode = true;
                torpedoes[i].ticker = 1;
                torpedoes[i].emitter.destroy();
                if(!STORAGE.isMuted) {
                    STORAGE.blasts.play('torpedoHitBlast');
                }
                continue torpMark;
            }
        }
        if(SUPPORT.wallsCollision(torpedoes[i].sprite, torpedoes[i].dx, 0)) {
            torpedoes[i].explode = true;
            torpedoes[i].ticker = 1;
            torpedoes[i].emitter.destroy();
            if(!STORAGE.isMuted) {
                STORAGE.blasts.play('torpedoHitBlast');
            }
            continue;
        }
    }

    //enemy torpedoes
    for(let i = 0; i < enemyTorpedoes.length; ++i) {
        //explosions
        if(enemyTorpedoes[i].explode) {
            ++enemyTorpedoes[i].ticker;
            if(enemyTorpedoes[i].ticker % STORAGE.explosionAnimationPeriod === 0) {
                if(enemyTorpedoes[i].explodeStage != 4) {
                    enemyTorpedoes[i].updateSprite();
                } else {
                    STORAGE.terrains.removeChild(enemyTorpedoes[i].sprite);
                    enemyTorpedoes.splice(i, 1);
                    --i;
                }
            }
            continue;
        }
        //movement
        if(Math.abs(enemyTorpedoes[i].passedDistance) < enemyTorpedoes[i].maxDistance) {
            enemyTorpedoes[i].passedDistance += enemyTorpedoes[i].dx;
            enemyTorpedoes[i].sprite.x += enemyTorpedoes[i].dx;
            enemyTorpedoes[i].updateBubbles();
            enemyTorpedoes[i].emitter.update((STORAGE.now - STORAGE.elapsed) * 0.001);
        } else {
            enemyTorpedoes[i].explode = true;
            enemyTorpedoes[i].ticker = 1;
            enemyTorpedoes[i].emitter.destroy();
            continue;
        }
        //player hit
        if(SUPPORT.hasCollided(enemyTorpedoes[i].sprite, STORAGE.ship)) {
            const prevHP = STORAGE.hp;
            STORAGE.hp -= 5;
            if(prevHP > 50 && STORAGE.hp <= 50) {
                STORAGE.ship.texture = STORAGE.playerTextures[1];
            }
            GUIsupport.updateHealthBar();

            enemyTorpedoes[i].explode = true;
            enemyTorpedoes[i].ticker = 1;
            enemyTorpedoes[i].emitter.destroy();
            if(!STORAGE.isMuted) {
                STORAGE.blasts.play('torpedoHitBlast');
            }
            continue;
        }
        //wall hit
        if(SUPPORT.wallsCollision(enemyTorpedoes[i].sprite, enemyTorpedoes[i].dx, 0)) {
            enemyTorpedoes[i].explode = true;
            enemyTorpedoes[i].ticker = 1;
            enemyTorpedoes[i].emitter.destroy();
            if(!STORAGE.isMuted) {
                STORAGE.blasts.play('torpedoHitBlast');
            }
            continue;
        }
    }

    //depth bomb
    depthBombMark: for(let i = 0; i < depthBombs.length; ++i) {
        //explosions
        if(depthBombs[i].explode) {
            ++depthBombs[i].ticker;
            if(depthBombs[i].ticker % (STORAGE.explosionAnimationPeriod / 2) === 0) {
                if(depthBombs[i].explodeStage != 10) {
                    depthBombs[i].updateSprite();
                } else {
                    STORAGE.terrains.removeChild(depthBombs[i].sprite);
                    depthBombs.splice(i, 1);
                    --i;
                }
            }
            continue;
        }

        //movement
        if(Math.abs(depthBombs[i].passedDistance) < depthBombs[i].maxDistance) {
            depthBombs[i].passedDistance += depthBombs[i].dy;
            depthBombs[i].sprite.rotation += 0.01 * depthBombs[i].rotation;
            depthBombs[i].sprite.y += depthBombs[i].dy;
        } else {
            depthBombs[i].explode = true;
            depthBombs[i].ticker = 1;
            depthBombs[i].sprite.rotation = 0;
            if(!STORAGE.isMuted) {
                STORAGE.blasts.play('mineBlast');
            }
            continue;
        }

        //detonations
        for(let mine of mines) {
            if(SUPPORT.hasCollided(depthBombs[i].sprite, mine.sprite) &&
                !mine.explode) {
                mine.explode = true;
                mine.ticker = 1;

                depthBombs[i].explode = true;
                depthBombs[i].ticker = 1;
                depthBombs[i].sprite.rotation = 0;
                if(!STORAGE.isMuted) {
                    STORAGE.blasts.play('mineBlast');
                }
                continue depthBombMark;
            }
        }
        for(let enemy of enemies) {
            if(SUPPORT.hasCollided(depthBombs[i].sprite, enemy.sprite) &&
                !enemy.isDestroyed) {
                if(!enemy.isDestroyed) {
                    enemy.updateSprite();
                }
                depthBombs[i].explode = true;
                depthBombs[i].ticker = 1;
                depthBombs[i].sprite.rotation = 0;
                if(!STORAGE.isMuted) {
                    STORAGE.blasts.play('mineBlast');
                }
                continue depthBombMark;
            }
        }
        if(SUPPORT.wallsCollision(depthBombs[i].sprite, 0, depthBombs[i].dy)) {
            depthBombs[i].explode = true;
            depthBombs[i].ticker = 1;
            depthBombs[i].sprite.rotation = 0;
            if(!STORAGE.isMuted) {
                STORAGE.blasts.play('mineBlast');
            }
            continue;
        }
    }

    //score
    if(STORAGE.terrains.y <= 0) {
        const currentDepth = Math.floor((Math.abs(STORAGE.terrains.y)) / 10);
        STORAGE.score = Math.max(STORAGE.score, currentDepth);
    }
    STORAGE.scoreText.text = "Depth:" + STORAGE.score;
}

export default play;
