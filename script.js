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

watchKey.addEventListener("mouseup", (e) => {
    if (e.button === 0){
        arkanoid.gameStop = false;
        draw();
    }
})

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
        this.gameOver = false;
        this.gameWin = false;
        this.gameStop = true;
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

        // Lock screen before the game begin


    }

    draw(ctx){
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

        // If the game is stopped
        if(this.gameStop){
            // Make a transparency rectangle
            ctx.fillStyle = "rgb(0 0 0 / 30%)";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "40px sans-serif"
            ctx.fillText("Click here to start", this.width/2 - 160, this.height/2);
        }
    }

    play(ctx) {
        // Update the state of the mouvement of the ball
        this.state = this.checkCollision()

        // If the game is going to be over
        if (this.state === "over") {
            this.gameOver = true;
        }else if (this.bricks.length === 0){
            this.gameWin = true;
        } else {
            // Apply the state to the movement of the ball
            this.ball.move(this.state);
        }

        this.draw(ctx);

        // Move the stick in function of the key press
        this.stick.move();
    }

    // Check collisions between ball and others objects
    checkCollision() {
        // check with all the bricks
        for (let i = 0; i < this.bricks.length; i++) {
            // Check collision in x and y between the ball and the bricks
            if (this.ball.isInCollisionX(this.bricks[i])) {
                this.bricks.splice(i, 1);   // Remove the brick who has been touched by the ball
                return "x";
            }
            if (this.ball.isInCollisionY(this.bricks[i])) {
                this.bricks.splice(i, 1);
                return "y";
            }
        }

        // check with the stick
        // Check x and y 
        if (this.ball.isInCollisionX(this.stick)) {
            return "x";
        }
        if (this.ball.isInCollisionY(this.stick)) {
            return "y";
        }

        // check with the wall
        // If the ball touched the side wall
        if (this.ball.isRoughlyEqual(this.ball.x - this.ball.radius, this.x) || this.ball.isRoughlyEqual(this.ball.x + this.ball.radius, this.width)) {
            return "x"
        }
        // If the ball touched the top wall
        if (this.ball.isRoughlyEqual(this.ball.y - this.ball.radius, this.y)) {
            return "y"
        }
        // If the ball touched the bottom wall
        if (this.ball.isRoughlyEqual(this.ball.y + this.ball.radius, this.height)) {
            return "over"
        }
        return ""
    }

    displayWin(ctx){
        // The backgound is black
        ctx.fillStyle = "#000";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // The image
        let img = new Image();
        img.src = "src/hannibalSmith.jpg";
        img.onload = function(){
            // drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            // s is for cutting the image and d is for placing the image in the canvas
            ctx.drawImage(img, 10, 0, 243, 191, this.width/2 + 10, this.height/2 - 50, 263 * 2, 191 * 2);
        }

        // The text
        ctx.fillStyle = "#FFF";
        ctx.font = "70px serif";
        ctx.fillText("Well done !", this.width/2 - 150, this.height/2 + 150);
    }

    displayGameOver(ctx){
        // Generate randomly the y value
        let y = Math.floor(Math.random() * (this.height - 500));
        // The black background
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // The placement in x for everyone
        let x = this.width/2 - 300;

        // The two rectangles one stroke with red
        ctx.strokeStyle = "red";
        ctx.strokeRect(x, y, 600, 200);
        
        // The text write in white with shadow in red
        ctx.fillStyle = "white";
        ctx.font = "100px sans-serif";
        ctx.lineWidth = 2;
        ctx.strokeText("GameOver", x + 50 - 5, y + 125);
        ctx.fillText("GameOver", x + 50, y + 125);
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
        this.velocityX = -6;
        this.velocityY = -6;
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

arkanoid = new Game(0, 0, canvas.width, canvas.height);
arkanoid.init(ctx);
arkanoid.draw(ctx);
draw = function () {
    arkanoid.play(ctx);
    // Si le jeu n'est pas fini
    if (!arkanoid.gameOver && !arkanoid.gameWin) {
        window.requestAnimationFrame(draw)
    }
    // Si le jeu est fini
    if (arkanoid.gameWin){
        arkanoid.displayWin(ctx);
    }else if (arkanoid.gameOver){
        arkanoid.displayGameOver(ctx);
    }
}
