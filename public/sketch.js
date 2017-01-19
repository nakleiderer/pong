const gridSize = 25;
const canvasGridSize = 25;
const canvasDimensions = [canvasGridSize * gridSize, canvasGridSize * gridSize];
const paddleHeight = 2;
const difficulty = 0.5;
const pucks = [];
const paddles = [];

let minPuckSpeedX = gridSize * 2;
let maxPuckSpeedX = 0;

function pxToUnits(pixels) {
    return Math.floor(pixels / gridSize);
}

function unitsToPx(units) {
    return units * gridSize;
}

// return true if the rectangle and circle are colliding
// http://stackoverflow.com/questions/21089959/detecting-collision-of-rectangle-with-circle
function isRectCircleColliding(circle, rect) {
    let distX = Math.abs(circle.x - rect.x - rect.w / 2);
    let distY = Math.abs(circle.y - rect.y - rect.h / 2);

    if (distX > (rect.w / 2 + circle.r)) {
        return false;
    }
    if (distY > (rect.h / 2 + circle.r)) {
        return false;
    }

    if (distX <= (rect.w / 2)) {
        return true;
    }
    if (distY <= (rect.h / 2)) {
        return true;
    }

    let dx = distX - rect.w / 2;
    let dy = distY - rect.h / 2;
    if (dx * dx + dy * dy <= (circle.r * circle.r)) {
        return true;
    } else {
        return false;
    }
}

class Puck {
    constructor(speedX, speedY) {
        this.x = canvasDimensions[0] / 2;
        this.y = canvasDimensions[1] / 2;
        this._speedX = speedX;
        this.speedY = speedY;
        this.r = gridSize / 2;
    }

    set speedX(newSpeedX) {
        if (newSpeedX < minPuckSpeedX) {
            minPuckSpeedX = newSpeedX;
        } else if (newSpeedX > maxPuckSpeedX) {
            maxPuckSpeedX = newSpeedX;
        }
        this._speedX = newSpeedX;
    }

    get speedX() {
        return this._speedX;
    }

    isOffScreen() {
        return (this.x < 0 || this.x > canvasDimensions[0] || this.y < 0 || this.y > canvasDimensions[1]);
    }

    move() {
        // Bouncing Logic
        // Is top of canvas, or bottom of canvas
        const isVerticalBounce = (this.y < gridSize) || (this.y > canvasDimensions[1] - gridSize);
        if (isVerticalBounce) {
            this.speedY *= -1;
        } else { // Check for paddle bounce
            let puckSide = (this.x >= canvasDimensions[0] / 2) ? 1 : 0;

            for (let i = 0; i < paddles.length; i++) {
                let paddle = paddles[i];
                if (paddle.side === puckSide) {
                    if (isRectCircleColliding(this, paddle)) {
                        if (paddle.side) {
                            this.speedX = -1 * abs(this.speedX);
                        } else {
                            this.speedX = abs(this.speedX);
                        }

                    }
                }
            }
        }

        this.x = this.x + this.speedX;
        this.y = this.y + this.speedY;
    }

    show() {
        ellipse(this.x, this.y, this.r * 2);
    }
}

class Paddle {
    constructor(isComputer, side, height) {
        let pxHeight = height * gridSize;
        this.isComputer = isComputer;
        this.side = side;
        this.w = gridSize;
        this.h = pxHeight;
        this.x = (side) ? canvasDimensions[0] - gridSize : 0;
        this.y = (canvasDimensions[1] / 2) - (pxHeight / 2);
    }

    moveUp() {
        this.y -= gridSize;
    }

    moveDown() {
        this.y += gridSize;
    }

    constrainPosition() {
        this.y = constrain(this.y, 0, canvasDimensions[1] - this.h);
    }

    move() {
        if (this.isComputer) { // Computer Controlled
            let mostImportantPuck = undefined;
            let highestPriority = 0;
            const centerY = this.y + (this.h / 2);

            for (let i = 0; i < pucks.length; i++) {
                const puck = pucks[i];
                const time = abs(puck.x - this.x) / abs(puck.speedX)
                const puckPriority = 1 / time;
                const puckIsHeadingMyWay = (this.side === 0 && puck.speedX < 0) || (this.side === 1 && puck.speedX > 0);
                if ((puckPriority > highestPriority) && (puckIsHeadingMyWay)) {
                    highestPriority = puckPriority;
                    mostImportantPuck = puck;
                }
            }

            if (mostImportantPuck) {
                if (mostImportantPuck.y < this.y || mostImportantPuck.y > this.y + this.h) {
                    if (mostImportantPuck.y < this.y) {
                        this.moveUp();
                    } else if (mostImportantPuck.y > this.y) {
                        this.moveDown();
                    }
                }
            }

        } else { // Player Controlled
            if (keyIsPressed) {
                if (keyCode == UP_ARROW) {
                    this.moveUp();
                } else if (keyCode == DOWN_ARROW) {
                    this.moveDown();
                }
            }
        }

        this.constrainPosition();

    }

    show() {
        rect(this.x, this.y, this.w, this.h);
    }
}

function setup() {
    paddles.push(new Paddle(true, 0, paddleHeight));
    paddles.push(new Paddle(true, 1, paddleHeight));
    createCanvas(canvasDimensions[0], canvasDimensions[1]);
    stroke(255);  // Set line drawing color to white
    frameRate(60);
}

function draw() {
    background(0);

    for (let i = 0; i < paddles.length; i++) {
        paddles[i].move();
        paddles[i].show();
    }

    for (let i = pucks.length - 1; i >= 0; i--) {
        pucks[i].move();
        pucks[i].show();
        if (pucks[i].isOffScreen()) {
            pucks.splice(i, 1);
        }
    }

    if (pucks.length === 0) {
        console.log("Game Over! Restarting.");
        pucks.push(new Puck(25, 0));
        pucks.push(new Puck(15, 10));
        //pucks.push(new Puck(random(gridSize * difficulty), random(gridSize * difficulty)));
    }
}