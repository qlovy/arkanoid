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
watchKey.addEventListener("keyup", (e) => {
    keyDown = 0;    // Reset when the key is up
});
// Link to high score
//const elHighScore    = document.getElementById("high-score");

/*
let highScore = 0;
// If a high score already exist
if (localStorage.getItem("highScore") != null) {
    highScore = localStorage.getItem("highScore");
} else {
    // Create a localStorage place to store next high scores
    localStorage.setItem("highScore", highScore);
}
*/
//localStorage.clear()

// Display it
//elHighScore.textContent = highScore;

// Link to current score
//const elCurrentScore = document.getElementById("current-score");

// Catch all the mouseup event
canvas.addEventListener("mouseup", (e) => {
    // If the right button is pressed
    /*
    if (e.button === 0 && arkanoid.gameStop) {
        // Start the game
        arkanoid.gameStop = false;
        draw();
    }
     */
})

let keyDown;
let toggle = 1;

function getKey(e) {
    // Update the last key pressed down
    keyDown = e.key;
    // Remove the fact that the Arrow keys Up and Down, and Spacebar move the scrol bar while using the menu's game
    if (keyDown === 'ArrowUp' || keyDown === 'ArrowDown' || keyDown === ' '){
        e.preventDefault();
    }
    if (keyDown === 'Escape'){
        arkanoid.scoreState = false;
        arkanoid.menuState = true;
    }

    if (keyDown === 'r' && arkanoid.gameOver){
        arkanoid.restart(ctx);
    }
    /*
    if (e.key === "r" && arkanoid.gameOver) {
        arkanoid.restart(ctx);
    }else if (e.key === "Enter" && arkanoid.gameStop) {
        // Start the game
        arkanoid.gameStop = false;
        draw();
    }

     */
}

class Game {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.gameOver = false;
        //this.gameStop = false;
        this.currentLevel = 1;
        this.changeLevel = false;
        this.playerScore = 0;
        this.newHighScore = false;
        this.levelDifficulty = [0.045, 0.08, 0.22];
        this.levelName = ["Easy", "Medium", "Hard"];
        this.index = 0;
        this.menuState = true;
        this.playerName = "";
        this.userType = [];
        this.highScore = 0;
        this.scoreState = false;
    }

    menu(ctx){
        // In the menu we should have
        // - Title
        // Level of difficulty (in therms of ball speed and number of bricks, and number of points for bricks) => how do we manage a new high score => category
        // - Easy
        // - Medium
        // - Hard
        // When picking a mode, player should enter name
        // - Score (All the scores will be saved there)
        // - Preference (size of element or type of rebound)

        const yOffset =  130;
        const width = 600;
        const height = 100;

        // Background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.width, this.height);

        // Guide text
        ctx.font = "25px sans-serif";
        ctx.fillStyle = "white";
        ctx.fillText("Use Arrows to move and Enter to select", 300, 25);

        class MenuItem {
            constructor(name, x, y) {
                this.name = name;
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
            }

            draw(isSelect){
                const sp = 10;
                // If the case is selected
                if (isSelect){
                    ctx.fillStyle = "#57606f";
                    ctx.fillRect(this.x - this.width/2, this.y - this.height/2 - sp, this.width, this.height);
                }
                ctx.strokeStyle = "white";
                ctx.strokeRect(this.x - this.width/2, this.y - this.height/2 - sp, this.width, this.height);

                // The text
                ctx.font = "20px sans-serif";
                ctx.textAlign = "center";
                ctx.fillStyle = "white";
                ctx.fillText(this.name, this.x, this.y);
            }
        }

        let itemsName = ["EASY", "MEDIUM", "HARD", "SCORES"];
        let menuItems = [];

        for (let i=0; i<itemsName.length; i++){
            menuItems.push(new MenuItem(itemsName[i], 400, yOffset + height * i));
        }

        for (let menuItem of menuItems){
            menuItem.draw(0)
        }

        menuItems[this.index].draw(1);

        if (keyDown === 'ArrowUp'){
            if (this.index > 0){
                this.index--;
            }
        }else if (keyDown === 'ArrowDown'){
            if (this.index < menuItems.length - 1){
                this.index++;
            }
        }else if (keyDown === 'Enter'){
            if (this.index >= 0 && this.index <= 2){
                this.menuState = false;
            }else{
                this.scoreState = true;
                this.showScore(ctx);
            }
        }
        keyDown = '';
        this.userType = [];
        /*
        If level of difficulty is selected, launch the game with their settings
        If scores is selected, display an array with all the previous score and the name
         */
    }

    getPlayerName(ctx){
        // Background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.width, this.height);

        // Guide text
        ctx.font = "25px sans-serif";
        ctx.textAlign = "left";
        ctx.fillStyle = "white";
        ctx.fillText("Enter your pseudo. Press 'Enter' to continue.", 150, 25);
        ctx.fillText("Press 'Escape' to go back.", 150, 60);
        ctx.fillText("", 200, 55);

        // User input
        const w = 250;
        const h = 75;

        if (keyDown.length === 1 && toggle){
            this.userType.push(keyDown);
            toggle = 0;
        }else if (keyDown === 'Backspace' && toggle) {
            if (this.userType.length !== 0) {
                this.userType.pop();
                toggle = 0;
            }
        }else if (keyDown === 0){
            toggle = 1;
        }

        let name = "";
        for (let i=0; i<this.userType.length; i++){
            name += this.userType[i];
        }
        if (name === ""){
            name = "...";
        }
        ctx.fillText(name, this.width/2 - w, 200 - h)

        if (keyDown === 'Enter' && name !== "..."){
            this.playerName = name;
            this.init();
            this.draw(ctx);
            this.getScores();
        }
    }

    showScore(ctx){
        // Background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.width, this.height);

        // Guide text
        ctx.font = "35px sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.fillText("The Scores", this.width/2, 25);

        let scores = JSON.parse(localStorage.getItem("scores"));
        if (scores !== null){
            ctx.font = "25px sans-serif";
            ctx.textAlign = "center"
            ctx.fillText("Name", this.width/2 - 200, 70);
            ctx.fillText("High score", this.width/2, 70);
            ctx.fillText("Difficulty", this.width/2 + 200, 70);
            for (let i=0; i<scores.length;i++){
                ctx.fillText(scores[i][0], this.width/2 - 200, 100 + i * 35);
                ctx.fillText(scores[i][1], this.width/2, 100 + i * 35);
                ctx.fillText(scores[i][2], this.width/2 + 200, 100 + i * 35);
            }
        }else{
            ctx.textAlign = "center";
            ctx.font = "25px sans-serif"
            ctx.fillText("No score has been stored at the moment.", this.width/2, 80);
        }
    }

    checkScore(item){
        return item[0] === this.playerName && item[2] === this.levelName[this.index];
    }

    getScores(){
        let scores = JSON.parse(localStorage.getItem("scores"));
        if (scores !== null){
            if (scores.find(this.checkScore.bind(this)) !== undefined){
                let i = scores.findIndex(this.checkScore.bind(this));
                this.highScore = scores[i][1];
            }
        }else{
            localStorage.setItem("scores", JSON.stringify([]));
        }
    }

    setScores(){
        let scores = JSON.parse(localStorage.getItem("scores"));
        if (scores.find(this.checkScore.bind(this)) !== undefined){
            let i = scores.findIndex(this.checkScore.bind(this));
            if (scores[i][1] < this.playerScore){
                scores[i][1] = this.playerScore;
                this.newHighScore = true;
            }
        }else{
            scores.push([this.playerName, this.playerScore, this.levelName[this.index]]);
        }
        localStorage.setItem("scores", JSON.stringify(scores));
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
        this.ball = new Ball(this.width / 2, this.height / 8 * 7 - 12, 10, this.levelDifficulty[this.index]);

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

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                // If the generate number is a 1. The + 0.2 is to boost the percentage of 1.
                if (Math.round(Math.random() + 0.1)) {
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
        /*
        if (this.gameStop) {
            // Make a transparency rectangle
            ctx.fillStyle = "rgb(0 0 0 / 30%)";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "30px sans-serif"
            ctx.fillText("Right-click here or Enter to start", this.width / 2 - 200, this.height / 2);
        }
        */
    }

    play(ctx) {
        // Update the state of the movement of the ball
        this.state = this.checkCollision()

        // If the game is going to be over
        if (this.state === "over") {
            this.gameOver = true;
            this.setScores();
            // If all the bricks are been removed
        } else if (this.bricks.length === 0) {
            // Display the change of level
            this.changeOfLevel(ctx);
            // Ask for a change of level
            this.changeLevel = true;
        } else {
            // Draw everything
            this.draw(ctx);
        }

        // Move the stick in function of the key press, use the left wall for stopping before going into it.
        this.stick.move(this.walls[1]);
    }

    // Check collisions between ball and others objects
    checkCollision() {
        // check with all the bricks
        for (let i = 0; i < this.bricks.length; i++) {
            if (this.ball.reactTo(this.bricks[i])) {
                this.bricks.splice(i, 1);
                this.playerScore += 100;
            }
        }

        // check with the stick
        this.ball.reactTo(this.stick);

        // check with the walls
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
            ctx.drawImage(img, 10, 0, 243, 191, this.width / 2 + 50, this.height / 2 - 50, 263 * 2, 191 * 2);
        }

        // The text
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "70px serif";
        ctx.fillText("Well done ! Keep pushing !", this.width / 2, this.height / 2 + 150);

        // Show score
        // high score
        ctx.font = "30px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("High score : " + this.highScore, this.width/2, this.height / 2 + 230);
        // player score
        ctx.fillText("Player score : " + this.playerScore, this.width/2, this.height / 2 + 280);
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
        ctx.textAlign = "left";
        ctx.font = "100px sans-serif";
        ctx.lineWidth = 2;
        ctx.strokeText("GameOver", x + 50 - 5, y + 125);
        ctx.fillText("GameOver", x + 50, y + 125);

        // Show score
        // high score
        ctx.font = "30px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("High score : " + this.highScore, this.width/2, this.height / 2 + 150);
        // player score
        ctx.fillText("Player score : " + this.playerScore, this.width/2, this.height / 2 + 200);

        // text to restart the game
        ctx.font = "20px sans-serif";
        ctx.fillText("Press R to restart", 100, this.height - 50);
    }

    restart() {
        // Reset to the game menu
        this.gameOver = false;
        this.newHighScore = false;
        this.currentLevel = 1;
        this.playerScore = 0;
        this.playerName = ""
        this.menuState = true;
        draw();
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
    constructor(x, y, radius, vOffset) {
        this.position = new Victor(x, y);
        this.veloctiy = new Victor(-vOffset, -vOffset);
        this.radius = radius;
    }

    draw(ctx) {
        // Draw the ball
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fill();
    }

    reactTo(obj) {
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
                || (this.position.y > obj.y - 5 && this.position.y < obj.y + 5))) {
            // Invert the Y attribute
            this.veloctiy.y *= -1.0;
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
                || (this.position.x > obj.x - 5 && this.position.x < obj.x + 5))) {
            // Invert the X attribute
            this.veloctiy.x *= -1.0;
            state = 1;
        }

        // Update the ball position
        this.position.add(this.veloctiy);

        // If we touch something or not
        return state;
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

// Game Loop
draw = function () {
    if (arkanoid.menuState) {
        if (!arkanoid.scoreState){
            arkanoid.menu(ctx);
        }
    }else if (arkanoid.playerName === ""){
        arkanoid.getPlayerName(ctx);
    }else if (!arkanoid.changeLevel){
        arkanoid.play(ctx);
    }else{
        // Will execute the function after 2 seconds
        setTimeout(() => {
            arkanoid.changeLevel = false;
            draw();
        }, 2000);
    }

    // If the game is not over
    if (!arkanoid.gameOver && !arkanoid.changeLevel) {
        // Call himself 60 times per second
        window.requestAnimationFrame(draw)
    }

    // If the game is over
    if (arkanoid.gameOver) {
        if (arkanoid.newHighScore) {
            arkanoid.displayWin(ctx);
            setTimeout(() => {
                arkanoid.displayGameOver(ctx);
            }, 2000);
        } else {
            arkanoid.displayGameOver(ctx);
        }
    }
}
draw();