canvas = document.getElementById("game-canvas");
canvas.width = canvas.Width = 800;
canvas.height = canvas.Height = 800;
ctx = canvas.getContext("2d");

class Game{
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx){
        // Draw the background
        ctx.fillStyle = "#192a56";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw a line of four bricks
        let bricks = [];
        for (let i = 0; i < 6; i++) {
            bricks.push(new Brick(100 + 100 * i, 200, 100, 50));
            bricks[i].draw(ctx);
        }

        // Draw the stick
        let stick = new Stick(300, 700, 200, 20);
        stick.draw(ctx);

        // Draw the ball
        let ball = new Ball(400, 685, 15);
        ball.draw(ctx);
        // Manage the ball's collision

        // If the ball touches the side wall
        if (this.x >= canvas.width - this.radius || this.x <= 0 + this.radius) {
            this.velocityX = this.velocityX * -1;
        }
        // If the ball touches the stick

    }
}

class Brick {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 50;
    }

    draw(ctx){
        ctx.fillStyle = "#4cd137";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = "#000"
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

    draw(ctx){
        ctx.fillStyle = "#7f8fa6";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

class Ball {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocityY = 2;
        this.velocityX = 2;
    }

    draw(ctx){
        // Draw the ball
        ctx.fillStyle = "#FFF";
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}

game = new Game(0, 0, canvas.width, canvas.height);
game.draw(ctx);


