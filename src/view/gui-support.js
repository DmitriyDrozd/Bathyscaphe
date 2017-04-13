import STORAGE from './../scenesSetup/storage';


function updateArrows(axis) {
    if(axis === 'vertical' || axis === 'both') {
        for(let arrow of STORAGE.velocityArrows.up) {
            arrow.visible = false;
        }
        for(let arrow of STORAGE.velocityArrows.down) {
            arrow.visible = false;
        }
        if(STORAGE.shipY < 0) {
            for(let i = 0; i < -STORAGE.shipY; ++i) {
                STORAGE.velocityArrows.down[i].visible = true;
            }
        }
        if(STORAGE.shipY > 0) {
            for(let i = 0; i < STORAGE.shipY; ++i) {
                STORAGE.velocityArrows.up[i].visible = true;
            }
        }
    }
    if(axis === 'horizontal' || axis === 'both') {
        for(let arrow of STORAGE.velocityArrows.left) {
            arrow.visible = false;
        }
        for(let arrow of STORAGE.velocityArrows.right) {
            arrow.visible = false;
        }
        if(STORAGE.shipX < 0) {
            for(let i = 0; i < -STORAGE.shipX; ++i) {
                STORAGE.velocityArrows.right[i].visible = true;
            }
        }
        if(STORAGE.shipX > 0) {
            for(let i = 0; i < STORAGE.shipX; ++i) {
                STORAGE.velocityArrows.left[i].visible = true;
            }
        }
    }
}

function updateHealthBar() {
    STORAGE.healthBar.removeChild(STORAGE.healthBar.children[0]);
    let hpBar = new PIXI.Graphics();
    hpBar.beginFill(0xef0000);
    hpBar.drawRect(0, 0, 220 * STORAGE.hp / 100, 32);
    hpBar.endFill();
    STORAGE.healthBar.addChild(hpBar);
}

module.exports.updateArrows = updateArrows;
module.exports.updateHealthBar = updateHealthBar;
