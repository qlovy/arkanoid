// Link between the variable and the html tags
const canvas = document.getElementById("game-canvas");
canvas.width = canvas.Width = 900;
canvas.height = canvas.Height = 800;
ctx = canvas.getContext("2d");

// Link to the body tag
const watchKey = document.querySelector("body");
// Catch all the keyDown event
watchKey.addEventListener("keydown", getKey);
// Catch all the keyUp event
watchKey.addEventListener("keyup", () => {
    keyDown = 0;    // Reset when the key is up
});

// Link to high score
const elHighScore = document.getElementById("high-score");

let highScore = 0;
// If a high score already exist
if (localStorage.getItem("highScore") != null) {
    highScore = localStorage.getItem("highScore");
} else {
    // Create a localStorage place to store next high scores
    localStorage.setItem("highScore", highScore);
}

// Display it
elHighScore.textContent = highScore;

// Link to current score
const elCurrentScore = document.getElementById("current-score");

// Catch all the mouseup event
canvas.addEventListener("mouseup", (e) => {
    // If the right button is pressed
    if (e.button === 0) {
        // Start the game
        arkanoid.gameStop = false;
        draw();
    }
})

let keyDown;

function getKey(e) {
    // Update the last key pressed down
    keyDown = e.key;
    if (e.key === "r") {
        arkanoid.restart(ctx);
    }
    if (e.key === "Enter") {
        // Start the game
        arkanoid.gameStop = false;
        draw();
    }
}

class Game {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.gameOver = false;
        this.gameStop = true;
        this.currentLevel = 1;
        this.changeLevel = false;
        this.playerScore = 0;
        this.newHighScore = false;
    }

    init() {
        let brickWidth = this.width / 9;
        let brickX = this.width / 2 - 3 * brickWidth;
        let brickY = this.height / 4;

        // Generate the new level
        this.bricks = this.generateLevel(brickWidth, brickX, brickY);

        // Create the stick, for height multiple of 7
        this.stick = new Stick(this.width / 2 - 100, this.height / 8 * 7, 200, 21, 4);

        // Draw the ball
        this.ball = new Ball(this.width / 2, this.height / 8 * 7 - 12, 10);

        // Draw the walls
        this.walls = [];
        let wallWidth = 42; // 42 because it's 6x7 (we need a multiple of 6)

        this.walls.push(new Wall(this.x, this.y, this.width, wallWidth, "H")); // Top
        this.walls.push(new Wall(this.x, wallWidth, wallWidth, this.height - wallWidth, "V")); // Left
        this.walls.push(new Wall(this.width - wallWidth, wallWidth, wallWidth, this.height - wallWidth, "V")); // Right
    }

    generateLevel(brickWidth, brickX, brickY) {
        let width = 6;
        let height = 5;
        this.bricks = [];

        for (let i=0; i<width; i++){
            for (let j=0; j<height; j++){
                // If the generate number is a 1. The + 0.2 is to boost the percentage of 1.
                if (Math.round(Math.random()  + 0.1)) {
                    this.bricks.push(new Brick(brickX + brickWidth * i, brickY + j * 50, brickWidth, 50));
                }
            }
        }

        return this.bricks;
    }

    changeOfLevel(ctx) {
        // Increment the current level
        this.currentLevel++;

        // Draw the background
        ctx.fillStyle = "#192a56";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Show the new current level number
        ctx.fillStyle = "white";
        ctx.font = "bold 50px sans-serif";
        ctx.fillText("Now Level " + this.currentLevel + " !", this.width / 2 - 150, this.height / 2);

        // Initialise the new level
        this.init();
    }

    draw(ctx) {
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

        // Draw the walls
        for (let i = 0; i < this.walls.length; i++) {
            this.walls[i].draw(ctx);
        }


        // Draw the number of level
        ctx.fillStyle = "white";
        ctx.font = "italic 20px sans-serif";
        ctx.fillText("Level " + this.currentLevel, this.width / 2 - 30, this.height - 30);

        // If the game is stopped
        if (this.gameStop) {
            // Make a transparency rectangle
            ctx.fillStyle = "rgb(0 0 0 / 30%)";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "30px sans-serif"
            ctx.fillText("Right-click here or Enter to start", this.width / 2 - 200, this.height / 2);
        }
    }

    play(ctx) {
        // Update the state of the movement of the ball
        this.state = this.checkCollision()

        // If the game is going to be over
        if (this.state === "over") {
            this.gameOver = true;
            // If all the bricks are been removed
        } else if (this.bricks.length === 0) {
            // Display the change of level
            this.changeOfLevel(ctx);
            // Ask for a change of level
            this.changeLevel = true;
        } else {
            // Apply the state to the movement of the ball
            //this.ball.move(this.state);
            //this.ball.update();
            // Draw everything
            this.draw(ctx);
        }

        // Move the stick in function of the key press, use the left wall for stopping before going into it.
        this.stick.move(this.walls[1]);

        this.manageScore();
    }

    // Check collisions between ball and others objects
    checkCollision() {
        // check with all the bricks

        for (let i = 0; i < this.bricks.length; i++) {
            if (this.ball.reactTo(this.bricks[i])){
                this.bricks.splice(i, 1);
            }
        }



        // check with the stick
        this.ball.reactTo(this.stick);
        // check with the wall
        
        for (let i = 0; i < this.walls.length; i++) {
            
            this.ball.reactTo(this.walls[i])
        }
        
        // if the ball touch the bottom
        if (this.ball.position.y >= this.height) {
            return "over";
        }

    }

    displayWin(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // The image
        let img = new Image();
        img.src = "src/hannibalSmith.jpg";
        img.onload = function () {
            // drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            // s is for cutting the image and d is for placing the image in the canvas
            ctx.drawImage(img, 10, 0, 243, 191, this.width / 2 + 10, this.height / 2 - 50, 263 * 2, 191 * 2);
        }

        // The text
        ctx.fillStyle = "white";
        ctx.font = "70px serif";
        ctx.fillText("Well done ! Keep pushing !", this.width / 2 - 150, this.height / 2 + 150);

        // text to restart the game
        ctx.font = "20px sans-serif";
        ctx.fillText("Press R to restart", 100, this.height - 50);
    }

    displayGameOver(ctx) {
        // Generate randomly the y value
        let y = Math.floor(Math.random() * (this.height - 500));

        // The black background
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // The placement in x for everyone
        let x = this.width / 2 - 300;

        // The two rectangles one stroke with red
        ctx.strokeStyle = "red";
        ctx.strokeRect(x, y, 600, 200);

        // The text write in white with shadow in red
        ctx.fillStyle = "white";
        ctx.font = "100px sans-serif";
        ctx.lineWidth = 2;
        ctx.strokeText("GameOver", x + 50 - 5, y + 125);
        ctx.fillText("GameOver", x + 50, y + 125);

        // text to restart the game
        ctx.font = "20px sans-serif";
        ctx.fillText("Press R to restart", 100, this.height - 50);
    }

    restart(ctx) {
        // Reset to the start of the game
        this.gameOver = false;
        this.newHighScore = false;
        this.gameStop = true;
        this.currentLevel = 1;
        this.playerScore = 0;
        this.manageScore();
        this.init(ctx);
        this.draw(ctx);
    }

    manageScore() {
        // if a new high score has been reached
        if (this.playerScore > highScore) {
            localStorage.setItem("highScore", this.playerScore);
            highScore = this.playerScore;
            this.newHighScore = true;
        }
        // display the high score and the current score.
        elHighScore.textContent = highScore;
        elCurrentScore.textContent = this.playerScore;
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
        ctx.fillStyle = "#28c60f";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        let s = 7;

        ctx.fillStyle = "#92ea84";
        ctx.fillRect(this.x, this.y, this.width - s, this.height - s);

        ctx.fillStyle = "#4cd137";
        ctx.fillRect(this.x + s, this.y + s, this.width - 2 * s, this.height - 2 * s);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

class Stick {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    draw(ctx) {
        // make a tube
        // background
        ctx.fillStyle = "#626262";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // shadow
        ctx.fillStyle = "#8f8f8f";
        ctx.fillRect(this.x, this.y + this.height / 7, this.width, this.height / 7 * 4);
        // light
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(this.x, this.y + this.height / 7 * 2, this.width, this.height / 7);

        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    move(wall) {
        // If the key "a" or the left arrow are pressed down and the stick isn't going to exit the display
        if ((keyDown === "a" || keyDown === "ArrowLeft") && this.x >= wall.width) {
            // Move to the left
            this.x = this.x - this.speed;
            // If the key "d" or the right arrow are pressed down and the stick isn't going to exit the display
        } else if ((keyDown === "d" || keyDown === "ArrowRight") && this.x <= canvas.width - this.width - wall.width) {
            // Move to the right
            this.x = this.x + this.speed;
        }
    }
}

class Ball {
    constructor(x, y, radius) {
        this.position = new Victor(x, y);
        this.veloctiy = new Victor(-0.1, -0.1);
        //this.acceleration = new Victor(0, 0);
        this.radius = radius;
    }

    draw(ctx) {
        // Draw the ball
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fill();
    }

    reactTo(obj){
        /*
        * For Bottom and Top sides,
        *  (0, 0) ---> X
        *  |
        *  |
        * \/
        * Y
        *     (*)
        *   ------ (obj.x, obj.y) (obj.x + obj.width, obj.y)
        *   |    |
        *   ------ (obj.x, obj.y + obj.height) (obj.x, obj.y + obj.height)
        *
        * */

        let state = 0;

        // The whole side in X
        if (this.position.x < obj.x + obj.width && this.position.x > obj.x &&
            // Bottom
            ((this.position.y > obj.y + obj.height - 5 && this.position.y < obj.y + obj.height + 5)
            // Top
            || (this.position.y > obj.y - 5 && this.position.y < obj.y + 5))){
            // Invert the Y attribute
            this.veloctiy.y *= -1;
            state = 1;
        }

        /*
        * For Left and Right sides,
        * +--> x
        * !
        * v
        * y
        *
        *                              ----
        *               (obj.x, obj.y) |  | (obj.x + obj.width, obj.y)
        *                              |  |
        *  (obj.x, obj.y + obj.height) |  | (obj.x + obj.width, obj.y + obj.height)
        *                              ----
        *
        * */

        // The whole side in Y
        if (this.position.y < obj.y + obj.height && this.position.y > obj.y &&
            // Right
            ((this.position.x > obj.x + obj.width - 5 && this.position.x < obj.x + obj.width + 5)
            // Left
            || (this.position.x > obj.x - 5 && this.position.x < obj.x + 5))){
            // Invert the X attribute
            this.veloctiy.x *= -1;
            state = 1;
        }

        // Update the ball position
        this.position.add(this.veloctiy);

        // If we touch something or not
        return state;
    }
    /*
    whereInCollision(obj) {
        // Exemple:
        //      (v) --> from the top (this.x)
        // --------------   --> the coordinates (x, y) of theses pointes should match
        // |            |
        // --------------   --> same here
        //      (^) --> from the bottom (this.x)

        let dyb, dya, dxb, dxa;
        dyb = this.y + this.radius - obj.y; // distance between the top of the box and the bottom of the ball
        dya = obj.y + obj.height - this.y + this.radius; // distance between the bottom of the box and the top of the ball 
        dxb = this.x + this.radius - obj.x; // distance between the left of the box and the left of the ball
        dxa = obj.x + obj.width - this.x + this.radius; // distance between the right of the box and the right of the ball
        // If the ball is inside the box, so there's a collision
        if (dyb > 0 && dxb > 0 && dya > 0 && dxa > 0) {
            let dmin = Math.min(dyb, dya, dxb, dxa);    // determine the minimum distance, so the side who is in collision
            if (dmin === dyb || dmin === dya) {
                return "y";
            } else {
                return "x";
            }
        } else {
            return "";
        }
    }
     */

    // Make that the ball is smart. Like the ball need an object to determin a new vector.
    // Then we apply this new force to the actual one.
}

class Wall {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    draw(ctx) {
        // Here we use color from the wikipedia image, save here (/src/Arkanoid.png).
        // All the mathematical operation are based on the fact that the wall were 6 pixel thick.

        // Draw the tube horizontal
        if (this.type === "H") {
            // background color
            ctx.fillStyle = "#8f8f8f";
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // shadow
            ctx.fillStyle = "#626262";
            ctx.fillRect(this.x, this.y + this.height / 2, this.width, this.height / 3);

            // light
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(this.x, this.y + this.height / 6, this.width, this.height / 6);

            // Draw the tube vertical
        } else if (this.type === "V") {
            // background color
            ctx.fillStyle = "#8f8f8f";
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // shadow
            ctx.fillStyle = "#626262";
            ctx.fillRect(this.x + this.width / 2, this.y, this.width / 3, this.height);

            // light
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(this.x + this.width / 6, this.y, this.width / 6, this.height);
        }
    }
}

arkanoid = new Game(0, 0, canvas.width, canvas.height);
arkanoid.init(ctx);
arkanoid.draw(ctx);

// Game Loop
draw = function () {
    // If the game is not over
    if (!arkanoid.gameOver && !arkanoid.gameWin && !arkanoid.changeLevel) {
        // Call himself 60 times per second
        window.requestAnimationFrame(draw)
    }
    // If no change of level are required
    if (!arkanoid.changeLevel) {
        arkanoid.play(ctx);
    } else {
        // Will execute the function after 2 seconds
        setTimeout(() => {
            arkanoid.changeLevel = false;
            draw();
        }, 2000);
    }

    // If the game is over
    if (arkanoid.gameOver) {
        if (arkanoid.newHighScore){
            arkanoid.displayWin(ctx);
            setTimeout(() => {
                arkanoid.displayGameOver(ctx);
            }, 2000);
        }else{
            arkanoid.displayGameOver(ctx);
        }
    }
}
