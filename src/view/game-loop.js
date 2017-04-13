import STORAGE from './../scenesSetup/storage';
import play from './../states/play';

function gameLoop() {
    //Loop this function at 60 frames per second
    requestAnimationFrame(gameLoop);

    if(STORAGE.state === play) {
        let bright = (10000 + STORAGE.terrains.y) / 10000;
        STORAGE.filter.brightness(bright, false);
        STORAGE.shockwaveFilter.center = [0, 0.5];
        if(STORAGE.counter % 2 === 0) {
            STORAGE.shockwaveFilter.time = (STORAGE.shockwaveFilter.time >= 1 ) ? 0 : STORAGE.shockwaveFilter.time + 0.01;
        }
    }

    if(STORAGE.state && STORAGE.state !== 'pause') {
        STORAGE.now = Date.now();
        STORAGE.state();
        STORAGE.elapsed = STORAGE.now;
    }
    STORAGE.renderer.render(STORAGE.stage);
}

module.exports = gameLoop;
