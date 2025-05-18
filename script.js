const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playButton = document.getElementById('play-button');
const soundButton = document.getElementById('sound-button');
const gameScreen = document.querySelector('.game-screen');
const menuScreen = document.querySelector('.menu-screen');
const gameOverScreen = document.querySelector('.game-over-screen');
const levelCompleteScreen = document.querySelector('.level-complete-screen');
const restartButton = document.getElementById('restart-button');
const nextLevelButton = document.getElementById('next-level-button');
const progressBar = document.getElementById('progress-bar');
const gameAudio = document.getElementById('game-audio');

// Game Variables
let player;
let obstacles = [];
let gameSpeed = 3;
let gravity = 0.15;
let jumpForce = -5;
let isJumping = false;
let score = 0;
let gameInterval;
let levelDuration = 90; // 1 minute 30 seconds in seconds
let startTime;
let soundEnabled = true;
let animationFrameId;
const obstacleWidth = 20;
const obstacleHeight = 20;
const playerSize = 20;
const groundLevel = canvas.height - playerSize;
const particleArray = [];

// Load Soundtrack (replace 'your_soundtrack.mp3' with your actual file)
gameAudio.src = 'your_soundtrack.mp3';

// Player Object
class Player {
    constructor() {
        this.x = 50;
        this.y = groundLevel;
        this.velocityY = 0;
    }

    draw() {
        ctx.fillStyle = '#00ccff';
        ctx.fillRect(this.x, this.y, playerSize, playerSize);
    }

    update() {
        this.velocityY += gravity;
        this.y += this.velocityY;
        if (this.y > groundLevel) {
            this.y = groundLevel;
            this.velocityY = 0;
            isJumping = false;
        }
    }

    jump() {
        if (!isJumping) {
            this.velocityY = jumpForce;
            isJumping = true;
        }
    }
}

// Obstacle Object
class Obstacle {
    constructor(x, type) {
        this.x = x;
        this.y = (type === 'spike') ? groundLevel + playerSize / 2 : groundLevel - obstacleHeight;
        this.width = obstacleWidth;
        this.height = (type === 'spike') ? playerSize / 2 : obstacleHeight;
        this.type = type;
    }

    draw() {
        ctx.fillStyle = (this.type === 'spike') ? '#ff3300' : '#ff9900';
        if (this.type === 'spike') {
            // Draw a simple triangle for the spike
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.width / 2, this.y - this.height);
            ctx.lineTo(this.x + this.width, this.y);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    update() {
        this.x -= gameSpeed;
    }
}

// Particle Object
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = (Math.random() - 0.5) * 3;
        this.alpha = 1;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= 0.02;
        this.size *= 0.95;
    }
}

function createLevel() {
    obstacles = [];
    // Define your level structure here (x position, type: 'block' or 'spike')
    obstacles.push(new Obstacle(300, 'block'));
    obstacles.push(new Obstacle(500, 'spike'));
    obstacles.push(new Obstacle(700, 'block'));
    obstacles.push(new Obstacle(900, 'spike'));
    obstacles.push(new Obstacle(1100, 'block'));
    obstacles.push(new Obstacle(1300, 'spike'));
    obstacles.push(new Obstacle(1500, 'block'));
}

function spawnObstacle() {
    // You can add more complex obstacle generation logic here if needed
    const type = Math.random() < 0.5 ? 'block' : 'spike';
    const x = canvas.width + Math.random() * 200;
    obstacles.push(new Obstacle(x, type));
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update();
    player.draw();

    // Update and draw obstacles
    obstacles.forEach(obstacle => {
        obstacle.update();
        obstacle.draw();
    });

    // Collision detection
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + playerSize > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + playerSize > obstacle.y
        ) {
            gameOver();
            return;
        }
    }

    // Remove off-screen obstacles
    obstacles = obstacles.filter(obstacle => obstacle.x > -obstacle.width);

    // Level progress
    const elapsedTime = (Date.now() - startTime) / 1000;
    const progress = Math.min(1, elapsedTime / levelDuration);
    progressBar.style.width = `${progress * 100}%`;

    if (elapsedTime >= levelDuration) {
        levelComplete();
        return;
    }

    // Update and draw particles
    for (let i = particleArray.length - 1; i >= 0; i--) {
        particleArray[i].update();
        particleArray[i].draw();
        if (particleArray[i].alpha <= 0 || particleArray[i].size <= 0) {
            particleArray.splice(i, 1);
        }
    }

    animationFrameId = requestAnimationFrame(updateGame);
}

function startGame() {
    menuScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    levelCompleteScreen.classList.add('hidden');

    player = new Player();
    createLevel();
    gameSpeed = 3;
    startTime = Date.now();

    if (soundEnabled) {
        gameAudio.currentTime = 0;
        gameAudio.play();
    }

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(updateGame);
}

function gameOver() {
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    gameAudio.pause();
    gameAudio.currentTime = 0;
    createDeathParticles();
    cancelAnimationFrame(animationFrameId);
}

function levelComplete() {
    gameScreen.classList.add('hidden');
    levelCompleteScreen.classList.remove('hidden');
    gameAudio.pause();
    gameAudio.currentTime = 0;
    cancelAnimationFrame(animationFrameId);
}

function restartGame() {
    startGame();
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    soundButton.textContent = `Sound: ${soundEnabled ? 'ON' : 'OFF'}`;
    if (soundEnabled && gameScreen.classList.contains('hidden') === false) {
        gameAudio.play();
    } else {
        gameAudio.pause();
    }
}

function createDeathParticles() {
    for (let i = 0; i < 30; i++) {
        const color = {
            r: Math.random() * 255,
            g: Math.random() * 255,
            b: Math.random() * 255
        };
        particleArray.push(new Particle(player.x + playerSize / 2, player.y + playerSize / 2, color));
    }
}

// Event Listeners
playButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
nextLevelButton.addEventListener('click', startGame); // For simplicity, restarts the same level
soundButton.addEventListener('click', toggleSound);
document.addEventListener('keydown', (event) => {
    if (gameScreen.classList.contains('hidden') === false && event.code === 'Space') {
        player.jump();
    }
});