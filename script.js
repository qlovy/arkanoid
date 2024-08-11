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
        this.gameWin = false;
        this.gameStop = true;
        this.currentLevel = 1;
        this.maxLevel = 3;
        this.changeLevel = false;
        this.playerScore = 0;
    }

    init() {
        let brickWidth = 100;
        let brickX = this.width / 2 - 3 * brickWidth;
        // Change the bricks position depending on the level
        if (this.currentLevel === 1) {
            this.level1(brickWidth, brickX);
        } else if (this.currentLevel === 2) {
            this.level2(brickWidth, brickX);
        } else if (this.currentLevel === 3) {
            this.level3(brickWidth, brickX);
        }

        // Create the stick
        this.stick = new Stick(300, 700, 200, 20, 10);

        // Draw the ball
        this.ball = new Ball(400, 685, 10);

        // Draw the walls
        this.walls = [];
        let wallWidth = 42; // 42 because it's 6x7 (we need a multiple of 6)

        this.walls.push(new Wall(0, 0, this.width, wallWidth, "H")); // Top
        this.walls.push(new Wall(0, wallWidth, wallWidth, this.height - wallWidth, "V")); // Left
        this.walls.push(new Wall(this.width - wallWidth, wallWidth, wallWidth, this.height - wallWidth, "V")); // Right
    }

    level1(brickWidth, brickX) {
        // Create a line of six bricks
        this.bricks = [];
        for (let i = 0; i < 6; i++) {
            this.bricks.push(new Brick(brickX + brickWidth * i, 200, brickWidth, 50));
        }
    }

    level2(brickWidth, brickX) {
        // Create two lines of six bricks
        this.bricks = [];
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 6; j++) {
                this.bricks.push(new Brick(brickX + brickWidth * j, 200 + i * 50, brickWidth, 50))
            }
        }
    }

    level3(brickWidth, brickX) {
        // Create a checkerboard on three lines
        this.bricks = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 6; j++) {
                if (j % 2 === 0 && i % 2 === 0) {
                    this.bricks.push(new Brick(brickX + brickWidth * j, 200 + i * 50, brickWidth, 50))
                } else if (j % 2 === 1 && i % 2 === 1) {
                    this.bricks.push(new Brick(brickX + brickWidth * j, 200 + i * 50, brickWidth, 50))
                }
            }
        }
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
        // Update the state of the mouvement of the ball
        this.state = this.checkCollision()

        // If the game is going to be over
        if (this.state === "over") {
            this.gameOver = true;
            // If all the bricks are been removed
        } else if (this.bricks.length === 0) {
            // If this the end of the game, all the level have been done
            if (this.currentLevel === this.maxLevel) {
                this.gameWin = true;
            } else {
                // Display the changement of level
                this.changeOfLevel(ctx);
                // Ask for a changement of level
                this.changeLevel = true;
            }
        } else {
            // Apply the state to the movement of the ball
            this.ball.move(this.state);
            // Draw everything
            this.draw(ctx);
        }

        // Move the stick in function of the key press
        this.stick.move();
    }

    // Check collisions between ball and others objects
    checkCollision() {
        let coll;   // contain the side of the collision
        // check with all the bricks
        for (let i = 0; i < this.bricks.length; i++) {
            coll = this.ball.whereInCollision(this.bricks[i]);
            // If there's a collision (x or y)
            if (coll !== "") {
                this.bricks.splice(i, 1);
                this.playerScore += 100;
                return coll
            }
        }

        // check with the stick 
        coll = this.ball.whereInCollision(this.stick);
        if (coll !== "") {
            return coll
        }

        // check with the wall
        for (let i = 0; i < this.walls.length; i++) {
            coll = this.ball.whereInCollision(this.walls[i]);
            if (coll !== "") {
                return coll;
            }
        }
        // if the ball touch the bottom
        if (this.ball.y >= this.height) {
            return "over";
        }


        return "";
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
        ctx.fillText("Well done !", this.width / 2 - 150, this.height / 2 + 150);

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

        // The score of the player
        ctx.font = "40px sans-serif";
        ctx.fillText("Your score is " + this.playerScore, this.width / 2 - 20, y + 198);

        // text to restart the game
        ctx.font = "20px sans-serif";
        ctx.fillText("Press R to restart", 100, this.height - 50);
    }

    restart(ctx) {
        // Reset to the start of the game
        this.gameOver = this.gameWin = false;
        this.gameStop = true;
        this.currentLevel = 1;
        this.playerScore = 0;
        this.init(ctx);
        this.draw(ctx);
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
        ctx.fillStyle = "#7f8fa6";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    move() {
        // If the key "a" or the left arrow are pressed down and the stick isn't going to exit the display
        if ((keyDown === "a" || keyDown === "ArrowLeft") && this.x >= 0) {
            // Move to the left
            this.x = this.x - this.speed;
            // If the key "d" or the right arrow are pressed down and the stick isn't going to exit the display
        } else if ((keyDown === "d" || keyDown === "ArrowRight") && this.x <= canvas.width - this.width) {
            // Move to the right
            this.x = this.x + this.speed;
        }
    }
}

class Ball {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocityX = Math.floor(Math.random() * (6 + 6) - 6);   // Generate a number between -6 inclusive and 6 exculsive
        this.velocityY = -6;
        // If the window is bigger than 1920x180
        if (window.innerWidth > 1920) {
            // Reduce the ball speed
            this.velocityX = -2;
            this.velocityY = -2;
        }
        // While the ball is too slow
        while (this.velocityX <= 0.9 && this.velocityX >= -0.9) {
            // Generate a new number
            this.velocityX = Math.floor(Math.random() * (6 + 6) - 6);
        }
    }

    draw(ctx) {
        // Draw the ball
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fill();
    }

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
            let dmin = Math.min(dyb, dya, dxb, dxa);    // determin the minimum distance, so the side who is in collision
            if (dmin === dyb || dmin === dya) {
                return "y";
            } else {
                return "x";
            }
        } else {
            return "";
        }
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

draw = function () {
    // If the game is not over
    if (!arkanoid.gameOver && !arkanoid.gameWin && !arkanoid.changeLevel) {
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

    // If the game is over (win or loose)
    if (arkanoid.gameWin) {
        arkanoid.displayWin(ctx);
    } else if (arkanoid.gameOver) {
        arkanoid.displayGameOver(ctx);
    }
}
