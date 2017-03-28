let Sprite = PIXI.Sprite;
let resources = PIXI.loader.resources;
let loader = PIXI.loader;
let TextureCache = PIXI.utils.TextureCache;

//Create the renderer
var renderer = PIXI.autoDetectRenderer(512, 512);
renderer.backgroundColor = 0x061639;
renderer.view.style.border = "1px dashed black";

//Create a container object called the `stage`
var stage = new PIXI.Container();

//Add the canvas to the HTML document
document.body.appendChild(renderer.view);


//Tell the `renderer` to `render` the `stage`
renderer.render(stage);


//Use Pixi's built-in `loader` object to load an image
loader
  .add("images/bg.jpg")
  .add("images/ship-sprites.png")
  .load(setup);

let state;
let bg;
let ship;
let shipX = 0;
let shipY = 0;

//This `setup` function will run when the image has loaded
function setup() {
  bg = new Sprite(resources["images/bg.jpg"].texture);
  stage.addChild(bg);

  let shipTexture = TextureCache["images/ship-sprites.png"];
  const rectangle = new PIXI.Rectangle(30, 10, 156, 80);
  shipTexture.frame = rectangle;
  ship = new Sprite(shipTexture);
  ship.anchor.set(0.5, 0.5);
  ship.position.set(256, 256);
  ship.direction = 'left';
  stage.addChild(ship); 

  const left = keyboard(37);
  const up = keyboard(38);
  const right = keyboard(39);
  const down = keyboard(40);

  left.press = function() {
    if(shipX < 3) {
      if(shipX === 0 && ship.direction === 'right') {
        ship.scale.x = 1;
        ship.direction = 'left';
      }
      shipX += 1;
    }
  };
  up.press = function() {
    if(shipY < 3) {
      shipY += 1;
    }
  };
  right.press = function() {
    if(shipX > -3) {
      if(shipX === 0 && ship.direction === 'left') {
        ship.scale.x = -1;
        ship.direction = 'right';
      }
      shipX -= 1;
    }
  };
  down.press = function() {
    if(shipY > -3) {
      shipY -= 1;
    }
  };
  state = play;
  gameLoop();
}

function gameLoop() {

  //Loop this function at 60 frames per second
  requestAnimationFrame(gameLoop);

  state();

  //Render the stage to see the animation
  renderer.render(stage);
}

function play() {
  //All the game logic goes here
  if((ship.x - (ship.width / 2) - shipX < bg.x) ||
    (ship.y - (ship.height / 2) - shipY < bg.y) ||
    (ship.x + (ship.width / 2) - shipX > bg.x + bg.width) ||
    (ship.y + (ship.height / 2) - shipY > bg.y + bg.height)) {
      shipX = 0;
      shipY = 0;
  } 
  bg.x += shipX;
  bg.y += shipY;
}

function end() {
  //All the code that should run at the end of the game
}

function keyboard(keyCode) {
  var key = {};
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
