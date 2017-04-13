import * as PIXI from 'pixi.js';

let current = 0;

const BATHYSCAPHE_WIDTH = 120;
const BATHYSCAPHE_HEIGHT = 120;
const LEVEL_WIDTH = 2880;
const LEVEL_HEIGHT = 1000;
const MARGIN = document.documentElement.clientWidth;
const MAX_ROOMS = 8;
const MIN_ROOMS = 3;
const MIN_GATE_WIDTH = BATHYSCAPHE_WIDTH + 40;
const MAX_GATE_WIDTH = MIN_GATE_WIDTH * 1.5;

class EmptyLevel {
  constructor() {
    this.rooms = [];
  }

  * getRects() {
    if (this.rooms.length === 0) yield new PIXI.Rectangle(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);
    for (const r of this.rooms) {
      if (r.y > 0) {
        if (typeof this.upGated !== 'undefined' && r === this.rooms[this.upGated]) {
          yield new PIXI.Rectangle(r.x, 0, this.upGate.x - r.x, r.y);
          yield new PIXI.Rectangle(this.upGate.x + this.upGate.width, 0, (r.x + r.width) - (this.upGate.x + this.upGate.width), r.y);
        } else {
          yield new PIXI.Rectangle(r.x, 0, r.width, r.y);
        }
      }
      if (r.y + r.height < LEVEL_HEIGHT) {
        if (typeof this.downGated !== 'undefined' && r === this.rooms[this.downGated]) {
            if(r.y + r.height + BATHYSCAPHE_HEIGHT < LEVEL_HEIGHT) {
                yield new PIXI.Rectangle(r.x, r.y + r.height + BATHYSCAPHE_HEIGHT, this.downGate.x - r.x, LEVEL_HEIGHT - (r.y + r.height) - BATHYSCAPHE_HEIGHT);
                yield new PIXI.Rectangle(this.downGate.x + this.downGate.width, r.y + r.height + BATHYSCAPHE_HEIGHT, (r.x + r.width) - (this.downGate.x + this.downGate.width), LEVEL_HEIGHT - (r.y + r.height) - BATHYSCAPHE_HEIGHT);
            }
            else {
                yield new PIXI.Rectangle(r.x, r.y + r.height, this.downGate.x - r.x, LEVEL_HEIGHT - (r.y + r.height));
                yield new PIXI.Rectangle(this.downGate.x + this.downGate.width, r.y + r.height, (r.x + r.width) - (this.downGate.x + this.downGate.width), LEVEL_HEIGHT - (r.y + r.height));
            }
        } else {
            if(r.y + r.height + BATHYSCAPHE_HEIGHT < LEVEL_HEIGHT) {
                yield new PIXI.Rectangle(r.x, r.y + r.height + BATHYSCAPHE_HEIGHT, r.width, LEVEL_HEIGHT - (r.y + r.height) - BATHYSCAPHE_HEIGHT);
            } else {
                yield new PIXI.Rectangle(r.x, r.y + r.height, r.width, LEVEL_HEIGHT - (r.y + r.height));
            }
        }
      }
    }
    yield new PIXI.Rectangle(-MARGIN, 0, MARGIN, LEVEL_HEIGHT);
    yield new PIXI.Rectangle(LEVEL_WIDTH, 0, MARGIN, LEVEL_HEIGHT);
  }

  generateDowngate() {
    let valid = false;
    let gatedRoom;
    let gateWidth;
    let gatePos;
    while(!valid) {
        this.downGated = Math.floor(Math.random() * this.rooms.length);
        gatedRoom = this.rooms[this.downGated];
        gateWidth = (Math.random() * ((Math.min(MAX_GATE_WIDTH, gatedRoom.width)) - MIN_GATE_WIDTH)) + MIN_GATE_WIDTH;
        // const gatePos = (Math.random() * (((gatedRoom.x + gatedRoom.width) - gateWidth) - gatedRoom.x)) + gatedRoom.x;
        gatePos = (Math.random() * (gatedRoom.width - gateWidth)) + gatedRoom.x;
        if(gatePos + gateWidth <= 2800) {
            valid = true;
        }
    }
    this.downGate = new PIXI.Rectangle(
      gatePos,
      gatedRoom.y + gatedRoom.height,
      gateWidth,
      LEVEL_HEIGHT - (gatedRoom.y + gatedRoom.height)
    );
  }

  buildUpGate(upGate) {
    this.upGated = this.rooms.findIndex(r => r.x <= upGate.x && (upGate.x + upGate.width) <= (r.x + r.width));
    //sometimes we get -1. And it's horrible.
    if(this.upGated === -1) {
        return -1;
    }
    this.upGate = new PIXI.Rectangle(upGate.x, 0, upGate.width, this.rooms[this.upGated].y);
  }
}

class BasicLevel extends EmptyLevel {
  constructor(upGate) {
    super();
    this.rooms = [new PIXI.Rectangle(0, LEVEL_HEIGHT / 6, LEVEL_WIDTH, 4 * (LEVEL_HEIGHT / 6))];
    if (typeof upGate !== 'undefined') {
      this.buildUpGate(upGate);
    }
    this.generateDowngate();
  }
}

class Level extends EmptyLevel {
  constructor(upGate) {
    super();
    this.buildRooms(upGate);

    if (typeof upGate !== 'undefined') {
      while(this.buildUpGate(upGate) === -1) {
          this.buildRooms(upGate);
      }
    }
    this.generateDowngate();
  }

  buildRooms(upGate) {
      const roomCount = Math.floor(Math.random() * (8 - 4)) + 4;
      this.rooms = new Array(roomCount).fill(null);
      let lastRight = 0;
      for (let i = 0; i < roomCount - 1; i++) {
        let right;
        while (upGate.x < (right = lastRight + (LEVEL_WIDTH / roomCount / 2) + (Math.random() * (LEVEL_WIDTH / roomCount))) && right < upGate.x + upGate.width);
        let roomY, roomH;
        do {
          roomY = (LEVEL_HEIGHT / 10) + (Math.random() * (LEVEL_HEIGHT / 10));
          roomH = Math.random() * ((LEVEL_HEIGHT - roomY) - (roomY + BATHYSCAPHE_HEIGHT + 10)) + (roomY + BATHYSCAPHE_HEIGHT + 10);
        } while (i > 0 && Math.min(
          roomH,
          this.rooms[i - 1].height,
          (this.rooms[i - 1].y + this.rooms[i - 1].height) - roomY < 0 ? roomH : (this.rooms[i - 1].y + this.rooms[i - 1].height) - roomY,
          (roomY + roomH) - this.rooms[i - 1].y < 0 ? roomH : (roomY + roomH) - this.rooms[i - 1].y
        ) < BATHYSCAPHE_HEIGHT + 10);
        this.rooms[i] = new PIXI.Rectangle(lastRight, roomY, right - lastRight, roomH);
        lastRight = right;
      }
      this.rooms[roomCount - 1] = new PIXI.Rectangle(lastRight, (LEVEL_HEIGHT / 6) + (Math.random() * 5), LEVEL_WIDTH - lastRight, 100);
  }
}

export default function* levelGenerator() {
  let [prev, cur] = [null, new BasicLevel(undefined)];
  for (current; ; current += 1) {
    [prev, cur] = [cur, new Level(cur.downGate)];
    yield prev;
  }
}
