import STORAGE from './../scenesSetup/storage';
import play from './../states/play';

function gameLoop() {
    //Loop this function at 60 frames per second
    requestAnimationFrame(gameLoop);

    if(STORAGE.state && STORAGE.state !== 'pause') {
        STORAGE.now = Date.now();
        STORAGE.state();
        STORAGE.elapsed = STORAGE.now;
    }
    STORAGE.renderer.render(STORAGE.stage);
}

export default gameLoop;
