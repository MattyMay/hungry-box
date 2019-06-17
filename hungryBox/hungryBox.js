// CANVAS SETUP
var canvas = document.createElement("canvas");
var cx = canvas.getContext("2d");
cx.canvas.width = 600;
cx.canvas.height = 600;
document.body.appendChild(canvas);
//**************utilities******************
function makeGrid() {
	for (let i = 0; i < stageDimensions.sideLength; i += unitSize) {
		for (let j = 0; j < stageDimensions.sideLength; j += unitSize) {
			cx.strokeStyle = 'grey';
			cx.strokeRect(i + stageDimensions.x, j + stageDimensions.y, unitSize, unitSize);
		}
	}
}

var floorToScale = function (number, scale) {
	return Math.floor(number / scale) * scale;
};
var gameOver = function () {
	var response = prompt('POINTS: ' + points + '\n WOULD YOU LIKE TO PLAY AGAIN?');
	if (response.toLowerCase() === 'yes') {
		document.location.reload();
	} else {
		alert('OK! bye bye');
		throw new Error();
	}
};
//***************** BOXES**********************

function Box(sideLength, color, speed) {
	this.sideLength = sideLength;
	this.color = color;
	this.speed = speed;
}

function Edible(sideLength, color, speed) {
	Box.call(this, sideLength, color, speed);
}
Edible.prototype = Object.create(Box.prototype);

Box.prototype.place = function (hoz, vert) {
	cx.fillStyle = this.color;
	cx.fillRect(hoz, vert, this.sideLength, this.sideLength);
};

Box.prototype.newLocation = function () {
	this.x = floorToScale((stageDimensions.x + stageDimensions.sideLength * Math.random()), unitSize);
	this.y = floorToScale((stageDimensions.y + stageDimensions.sideLength * Math.random()), unitSize);
};
// 	//console.log('food_location: ' + '\nx: '+food.x+'\ny: '+food.y);
// };

Edible.prototype.newLocation = function () {
	this.x = stageDimensions.x + Math.floor(Math.random() * (stageDimensions.sideLength / unitSize)) * unitSize;
	this.y = stageDimensions.y + Math.floor(Math.random() * (stageDimensions.sideLength / unitSize)) * unitSize;
};
//*************SCENE CONSTRUCTORS**********************
var border = new Box(cx.canvas.width, 'black', 0);
var stageDimensions = {
	sideLength: border.sideLength * .8,
	x: border.sideLength / 10,
	y: border.sideLength / 10,
};
var stage = new Box(stageDimensions.sideLength, 'purple', 0);
var unitSize = stageDimensions.sideLength * 0.025;
var points = 0;


//**************OBJECTS********************************
var sprite = {
	length: unitSize,
	color: 'yellow',
	speed: 80,
	x: floorToScale((border.sideLength - length) / 2, unitSize),
	y: floorToScale((border.sideLength - length) / 2, unitSize),
	direction: 'left',
	prevDirection: 'left',
	isTouchingFood: function () {
		if (sprite.x <= food.x + unitSize &&
			sprite.y <= food.y + unitSize &&
			food.x <= sprite.x + unitSize &&
			food.y <= sprite.y + unitSize) {
			return true;
		} else return false;
	},
	isTouchingPoisonOrWall: function () {

		for (var i = 0; i < poison.length; i++) {
			if (sprite.x < poison[i].x + unitSize &&
				sprite.y < poison[i].y + unitSize &&
				poison[i].x < sprite.x + unitSize &&
				poison[i].y < sprite.y + unitSize) {
				return true;
			}
		}
		if (sprite.x < stageDimensions.x ||
			sprite.x > stageDimensions.x + stage.sideLength - unitSize ||
			sprite.y < stageDimensions.y ||
			sprite.y > stageDimensions.y + stage.sideLength - unitSize) {
			return true;
		} else return false;
	},
	place: function () {
		cx.fillStyle = this.color;
		cx.fillRect(this.x, this.y, this.length, this.length);
		//console.log('placed:\n' + 'x: ' + this.x + '\ny: ' + this.y);
	}
};
// var food = new Box(unitSize, 'red', 0);
var food = new Edible(unitSize, 'red', 0);

var poison = new Array();
poison.placeAll = function () {
	for (var i = 0; i < poison.length; i++) {
		cx.fillStyle = 'green';
		cx.fillRect(poison[i].x, poison[i].y, unitSize, unitSize);
	}
};
poison.newPoison = function () {
	poison.push(new Edible(unitSize, 'green', 0));
	poison[poison.length - 1].newLocation();
};
//******************* CONTROLS***********************
window.addEventListener("keypress", turning, false);

function turning(e) {
	switch (e.charCode) {
		case 119: // W
			if (sprite.direction !== 'down')
				sprite.direction = 'up';
			break;

		case 97: // A
			if (sprite.direction !== 'right')
				sprite.direction = 'left';
			break;

		case 115: // S
			if (sprite.direction !== 'up')
				sprite.direction = 'down';
			break;

		case 100: // D
			if (sprite.direction !== 'left')
				sprite.direction = 'right';
			break;

		default:
			break;
	}
	//console.log('event handled: \ncharCode: ' + e.charCode + '\ndirection: ' + sprite.direction);
}
var levelUp = function () {
	food.newLocation();
	points += 1;
	// console.log('points: ' + points);
	//tail.grow();
	sprite.speed += 20;
	poison.newPoison();
};
var update = function (modifier) {
	let dir = sprite.prevDirection;

	//DEBUG
	console.log("sprite.x:" + sprite.x);
	console.log((sprite.x + stageDimensions.x) % unitSize);

	if ((sprite.x + stageDimensions.x) % unitSize === 0 &&
		(sprite.y + stageDimensions.y) % unitSize ===0 ) {
		dir = sprite.direction;
		sprite.prevDirection = dir;
	}
	switch (dir) {
		case 'up':
			sprite.y -= Math.floor(sprite.speed * modifier);
			break;
		case 'left':
			sprite.x -= Math.floor(sprite.speed * modifier);
			break;
		case 'down':
			sprite.y += Math.floor(sprite.speed * modifier);
			break;
		case 'right':
			sprite.x += Math.floor(sprite.speed * modifier);
			break;
	}
	floorToScale(sprite.x, unitSize);
	floorToScale(sprite.y, unitSize);

	if (sprite.isTouchingFood()) {
		levelUp();
	} else if (sprite.isTouchingPoisonOrWall()) {
		gameOver();
	}
};
//****************INITIALIZATION********************

var render = function () {
	border.place(0, 0);
	stage.place(stageDimensions.x, stageDimensions.y);
	makeGrid();
	sprite.place();
	poison.placeAll();
	food.place(food.x, food.y);
};
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	requestAnimationFrame(main);
};

var requestAnimationFrame = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	window.mozRequestAnimationFrame;

var then = Date.now();
alert('let the games begin!');
food.newLocation();




main();