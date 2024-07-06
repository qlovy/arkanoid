// Link between the variable and the html tags
const canvas = document.getElementById("game-canvas");
canvas.width = canvas.Width = 800;
canvas.height = canvas.Height = 800;
ctx = canvas.getContext("2d");

// Link to the body tag
const watchKey = document.querySelector("body");
// Catch all the keyDown event
watchKey.addEventListener("keydown", logKey);
// Catch all the keyUp event
watchKey.addEventListener("keyup", (e) => {
    keyDown = 0;    // Reset when the key is up
});

let keyDown;

function logKey(e){
    // Update the last key pressed down
    keyDown = e.key;
}

class Game {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.gameOver = false
    }

    init() {
        // Create a line of six bricks
        this.bricks = [];
        for (let i = 0; i < 6; i++) {
            this.bricks.push(new Brick(100 + 100 * i, 200, 100, 50));
        }

        // Create the stick
        this.stick = new Stick(300, 700, 200, 20);

        // Draw the ball
        this.ball = new Ball(400, 680, 15);

    }

    draw(ctx) {
        // Update the state of the mouvement of the ball
        this.state = this.checkCollision()
        // If the game is going to be over
        if (this.state === "over") {
            this.gameOver = true;
        } else {
            // Apply the state to the movement of the ball
            this.ball.move(this.state);
        }
        // Draw the background
        ctx.fillStyle = "#192a56";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw all the bricks
        for (let i = 0; i < this.bricks.length; i++) {
            this.bricks[i].draw(ctx);
        }

        // Draw the stick
        this.stick.draw(ctx);

        // Draw the ball
        this.ball.draw(ctx);

        this.stick.move();
    }

    // Check collisions between ball and others objects
    checkCollision() {
        // check with all the bricks
        for (let i = 0; i < this.bricks.length; i++) {
            if (this.ball.isInCollisionX(this.bricks[i])) {
                return "x";
            }
            if (this.ball.isInCollisionY(this.bricks[i])) {
                return "y";
            }
        }

        // check with the stick
        if (this.ball.isInCollisionX(this.stick)) {
            return "x";
        }
        if (this.ball.isInCollisionY(this.stick)) {
            return "y";
        }

        // check with the wall
        if (this.ball.isRoughlyEqual(this.ball.x, this.x) || this.ball.isRoughlyEqual(this.ball.x, this.width)) {
            return "x"
        }
        if (this.ball.isRoughlyEqual(this.ball.y - this.ball.radius, this.y)) {
            return "y"
        }
        if (this.ball.isRoughlyEqual(this.ball.y, this.height)) {
            return "y"
        }
        return ""
    }
}

class Brick {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 50;
    }

    draw(ctx) {
        ctx.fillStyle = "#4cd137";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

class Stick {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        ctx.fillStyle = "#7f8fa6";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    move() {
        // If the key "a" or the left arrow are pressed down and the stick isn't going to exit the display
        if ((keyDown === "a" || keyDown === "ArrowLeft") && this.x >= 0){
            // Move to the left
            this.x = this.x - 5;
        // If the key "d" or the right arrow are pressed down and the stick isn't going to exit the display
        }else if((keyDown === "d" || keyDown === "ArrowRight") && this.x <= canvas.width - this.width){
            // Move to the right
            this.x = this.x + 5;
        }
    }
}

class Ball {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocityX = -2;
        this.velocityY = -2;
    }

    draw(ctx) {
        // Draw the ball
        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fill();
    }

    isRoughlyEqual(fixedValue, valueToRound) {
        let tol = 4;
        return fixedValue > valueToRound - tol && fixedValue < valueToRound + tol;
    }

    isInCollisionY(obj) {
        // first check a hit from the top and then a hit from the bottom
        // Pattern explain: we check a range in X and a specific point in y
        // Exemple:
        //      (v) --> from the top (this.x)
        // --------------   --> the coordinates (x, y) of theses pointes should match
        // |            |
        // --------------   --> same here
        //      (^) --> from the bottom (this.x)
        // I had a roughly equal because we can't catch always when it's perfectly align.
        return this.x >= obj.x && this.x <= obj.x + obj.width && (this.isRoughlyEqual(this.y + this.radius, obj.y) || this.isRoughlyEqual(this.y - this.radius, obj.y + obj.height));//obj.y + obj.height >= this.y >= obj.y && (this.isRoughlyEqual(this.x + this.radius, obj.x) || this.isRoughlyEqual(this.x - this.radius, obj.x + obj.width));
    }

    isInCollisionX(obj) {
        // Checks hits form left and right
        return this.y >= obj.y && this.y <= obj.y + obj.height && (this.isRoughlyEqual(this.x + this.radius, obj.x) || this.isRoughlyEqual(this.x - this.radius, obj.x + obj.width));
    }

    move(invertVelocity) {
        if (invertVelocity === "x") {
            this.velocityX *= -1
        }
        if (invertVelocity === "y") {
            this.velocityY *= -1
        }
        this.x += this.velocityX;
        this.y += this.velocityY;
    }
}

game = new Game(0, 0, canvas.width, canvas.height);
game.init(ctx);
draw = function () {
    if (!game.gameOver) {
        window.requestAnimationFrame(draw)
    }
    game.draw(ctx);
}
draw();


