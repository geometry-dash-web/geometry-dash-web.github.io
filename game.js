document.addEventListener('DOMContentLoaded', () => {
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const levelCompleteScreen = document.getElementById('level-complete-screen');

    const playButton = document.getElementById('play-button');
    const restartButtonGameOver = document.getElementById('restart-button-gameover');
    const restartButtonComplete = document.getElementById('restart-button-complete');

    const soundIcon = document.getElementById('sound-icon');
    const musicIcon = document.getElementById('music-icon');
    // const settingsIcon = document.getElementById('settings-icon'); // For future use

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const progressBar = document.getElementById('progress-bar');
    const backgroundMusic = document.getElementById('background-music');

    // --- Game Configuration ---
    const LEVEL_DURATION = 90; // 1 minute 30 seconds
    const PLAYER_SIZE = 30;
    const GRAVITY = 0.6;
    const JUMP_FORCE = -12;
    const SCROLL_SPEED = 4; // Adjust for desired game speed
    const DEATH_DELAY = 1500; // 1.5 seconds

    // --- Game State ---
    let player, obstacles, gameIntervalId, score, startTime;
    let isJumping = false;
    let isMusicOn = true;
    let isSoundOn = true; // For sound effects if added
    let currentScreen = 'menu';
    let animationFrameId;

    // --- Asset Paths (replace with your actual files) ---
    backgroundMusic.src = 'path/to/your/background_music.mp3'; // IMPORTANT: Set your music file!
    // const jumpSound = new Audio('path/to/jump.wav');
    // const deathSound = new Audio('path/to/death.wav');

    // --- Player Class ---
    class Player {
        constructor(x, y, size, color) {
            this.x = x;
            this.y = y;
            this.width = size;
            this.height = size;
            this.color = color;
            this.velocityY = 0;
            this.onGround = false;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        update() {
            // Apply gravity
            this.velocityY += GRAVITY;
            this.y += this.velocityY;
            this.onGround = false;

            // Ground collision (bottom of canvas)
            if (this.y + this.height > canvas.height) {
                this.y = canvas.height - this.height;
                this.velocityY = 0;
                this.onGround = true;
                isJumping = false;
            }
        }

        jump() {
            if (this.onGround) {
                this.velocityY = JUMP_FORCE;
                isJumping = true;
                this.onGround = false;
                // if (isSoundOn) jumpSound.play();
            }
        }
    }

    // --- Obstacle Class ---
    class Obstacle {
        constructor(x, y, width, height, type, color) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.type = type; // 'block', 'slab', 'spike'
            this.color = color;
            this.isPlatform = type === 'block' || type === 'slab';
        }

        draw() {
            ctx.fillStyle = this.color;
            if (this.type === 'spike') {
                this.drawSpike();
            } else {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }

        drawSpike() {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height);
            ctx.lineTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.closePath();
            ctx.fill();
        }

        update() {
            this.x -= SCROLL_SPEED;
        }
    }

    // --- Level Definition ---
    // x: initial horizontal position, y: from top, w: width, h: height, t: type
    const levelData = [
        // Ground blocks for the start
        { x: 0, y: canvas.height - 40, w: 400, h: 40, t: 'block', c: '#7f8c8d' }, // Grey block
        { x: 400, y: canvas.height - 40, w: 300, h: 40, t: 'block', c: '#7f8c8d' },

        // First jump
        { x: 750, y: canvas.height - 40, w: 100, h: 40, t: 'block', c: '#7f8c8d' },
        { x: 870, y: canvas.height - 70, w: 80, h: 70, t: 'block', c: '#7f8c8d' }, // Higher platform
        { x: 1000, y: canvas.height - 40, w: 50, h: 40, t: 'spike', c: '#e74c3c' }, // Red spike

        // Sequence of platforms and spikes
        { x: 1200, y: canvas.height - 100, w: 150, h: 20, t: 'slab', c: '#95a5a6' }, // Light grey slab
        { x: 1400, y: canvas.height - 40, w: 100, h: 40, t: 'block', c: '#7f8c8d' },
        { x: 1500, y: canvas.height - 40, w: 50, h: 40, t: 'spike', c: '#e74c3c' },
        { x: 1550, y: canvas.height - 40, w: 50, h: 40, t: 'spike', c: '#e74c3c' },

        { x: 1700, y: canvas.height - 120, w: 100, h: 20, t: 'slab', c: '#95a5a6' },
        { x: 1850, y: canvas.height - 60, w: 100, h: 60, t: 'block', c: '#7f8c8d' },
        { x: 2000, y: canvas.height - 40, w: 200, h: 40, t: 'block', c: '#7f8c8d' },
        { x: 2200, y: canvas.height - 40, w: 50, h: 40, t: 'spike', c: '#e74c3c' },

        // Longer section
        { x: 2400, y: canvas.height - 40, w: 500, h: 40, t: 'block', c: '#7f8c8d' },
        { x: 2500, y: canvas.height - 80, w: 50, h: 40, t: 'spike', c: '#e74c3c' }, // Spike on a block
        { x: 2650, y: canvas.height - 120, w: 100, h: 20, t: 'slab', c: '#95a5a6' },
        { x: 2800, y: canvas.height - 40, w: 50, h: 40, t: 'spike', c: '#e74c3c' },
        { x: 2850, y: canvas.height - 40, w: 50, h: 40, t: 'spike', c: '#e74c3c' },
        { x: 2900, y: canvas.height - 40, w: 50, h: 40, t: 'spike', c: '#e74c3c' },

        // Final stretch - ensure the level feels about 90 seconds long with SCROLL_SPEED
        // Total level width will determine duration based on SCROLL_SPEED
        // Example: If last element is at x = SCROLL_SPEED * LEVEL_DURATION
        // SCROLL_SPEED = 4, LEVEL_DURATION = 90 => Max x ~ 3600
        // SCROLL_SPEED = 5, LEVEL_DURATION = 90 => Max x ~ 4500
        { x: 3100, y: canvas.height - 150, w: 150, h: 20, t: 'slab', c: '#95a5a6' },
        { x: 3300, y: canvas.height - 80, w: 100, h: 80, t: 'block', c: '#7f8c8d' },
        { x: 3350, y: canvas.height - 120, w: 50, h: 40, t: 'spike', c: '#e74c3c' },
        { x: 3500, y: canvas.height - 40, w: 400, h: 40, t: 'block', c: '#7f8c8d' } // End platform
    ];

    function initializeLevel() {
        obstacles = levelData.map(obj => new Obstacle(obj.x, obj.y, obj.w, obj.h, obj.t, obj.c));
    }

    // --- Canvas Sizing ---
    function resizeCanvas() {
        // Make canvas responsive, occupying a good portion of the screen
        // Keep a 16:9 or similar aspect ratio for consistency
        const aspectRatio = 16 / 9;
        let newWidth = window.innerWidth * 0.9;
        let newHeight = window.innerHeight * 0.8;

        if (newWidth / newHeight > aspectRatio) {
            newWidth = newHeight * aspectRatio;
        } else {
            newHeight = newWidth / aspectRatio;
        }

        canvas.width = Math.min(newWidth, 1280); // Max width
        canvas.height = Math.min(newHeight, 720); // Max height

        // Re-initialize level if canvas size changes significantly,
        // as y-positions of obstacles might be relative to canvas.height
        if (player) { // If game has started, adjust player position
            player.y = Math.min(player.y, canvas.height - player.height);
        }
        // Level data y-positions are based on canvas.height, so they'll adapt IF
        // levelData itself uses canvas.height in its definitions.
        // For this static levelData, ensure your y values work well with typical canvas sizes.
        // OR: you could make y-values in levelData proportional (e.g., canvas.height * 0.8)
        // For now, static y values are used, ensure they are valid.
    }

    // --- Game Logic ---
    function startGame() {
        currentScreen = 'game';
        menuScreen.classList.remove('active');
        gameOverScreen.classList.remove('active');
        levelCompleteScreen.classList.remove('active');
        gameScreen.classList.add('active');
        gameScreen.classList.remove('fade-out'); // Ensure it's visible

        resizeCanvas(); // Set initial canvas size

        player = new Player(50, canvas.height - PLAYER_SIZE - 40, PLAYER_SIZE, '#3498db'); // Blue player
        initializeLevel();
        isJumping = false;
        score = 0;
        startTime = Date.now();

        if (isMusicOn) {
            backgroundMusic.currentTime = 0;
            backgroundMusic.play().catch(e => console.warn("Music play failed:", e));
        }

        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        gameLoop();
    }

    function gameLoop() {
        const elapsedTime = (Date.now() - startTime) / 1000;

        if (elapsedTime >= LEVEL_DURATION) {
            handleLevelComplete();
            return;
        }

        updateGameState();
        drawGame();

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function updateGameState() {
        player.update();

        // Scroll obstacles
        obstacles.forEach(obstacle => obstacle.update());

        // Collision detection
        let onPlatform = false;
        obstacles.forEach(obstacle => {
            if (checkCollision(player, obstacle)) {
                if (obstacle.type === 'spike') {
                    handleDeath();
                    return;
                } else if (obstacle.isPlatform) {
                    // Platform collision
                    // Check if player is landing ON TOP of the platform
                    if (player.velocityY > 0 && // Moving downwards
                        player.y + player.height - player.velocityY <= obstacle.y + 1 && // Was above or at same level in prev frame
                        player.x + player.width > obstacle.x && player.x < obstacle.x + obstacle.width) {
                        player.y = obstacle.y - player.height;
                        player.velocityY = 0;
                        player.onGround = true;
                        isJumping = false;
                        onPlatform = true;
                    }
                    // Basic side collision (stop movement - can be more complex)
                    // If player hits side of block, stop them. For simplicity, this is not fully implemented here.
                    // A more robust platformer engine would handle this.
                }
            }
        });
         if (!onPlatform && player.y + player.height < canvas.height) {
            player.onGround = false; // If not on any specific platform, and not on ground, not onGround
        }


        // Remove off-screen obstacles (to the left) for performance
        obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
    }

    function checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    function drawGame() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw player
        player.draw();

        // Draw obstacles
        obstacles.forEach(obstacle => obstacle.draw());

        // Update progress bar
        const progress = Math.min(1, ((Date.now() - startTime) / 1000) / LEVEL_DURATION);
        progressBar.style.width = `${progress * 100}%`;
    }

    function handleDeath() {
        // if (isSoundOn) deathSound.play();
        if (isMusicOn) backgroundMusic.pause();
        cancelAnimationFrame(animationFrameId);
        currentScreen = 'gameover';

        gameOverScreen.classList.add('active');
        gameOverScreen.classList.remove('fade-out'); // Ensure visible if previously faded
        gameScreen.classList.add('fade-out'); // Fade out game screen

        setTimeout(() => {
            // Button will handle actual restart
        }, DEATH_DELAY);
    }

    function handleLevelComplete() {
        if (isMusicOn) backgroundMusic.pause();
        cancelAnimationFrame(animationFrameId);
        currentScreen = 'levelcomplete';

        levelCompleteScreen.classList.add('active');
        levelCompleteScreen.classList.remove('fade-out');
        gameScreen.classList.add('fade-out');
    }

    function switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }


    // --- Event Listeners ---
    playButton.addEventListener('click', startGame);
    restartButtonGameOver.addEventListener('click', () => {
        gameOverScreen.classList.remove('active'); // Hide immediately
        startGame();
    });
    restartButtonComplete.addEventListener('click', () => {
        levelCompleteScreen.classList.remove('active');
        startGame();
    });

    window.addEventListener('keydown', (e) => {
        if (currentScreen === 'game' && e.code === 'Space') {
            e.preventDefault(); // Prevent page scrolling if space is pressed
            player.jump();
        }
    });

    musicIcon.addEventListener('click', () => {
        isMusicOn = !isMusicOn;
        musicIcon.textContent = isMusicOn ? '🎵' : '🚫🎵';
        musicIcon.classList.toggle('active-icon', isMusicOn);
        if (isMusicOn && currentScreen === 'game' && backgroundMusic.paused) {
            backgroundMusic.play().catch(e => console.warn("Music play failed:", e));
        } else if (!isMusicOn) {
            backgroundMusic.pause();
        }
    });
    // Initialize icon state
    musicIcon.textContent = isMusicOn ? '🎵' : '🚫🎵';
    musicIcon.classList.toggle('active-icon', isMusicOn);


    soundIcon.addEventListener('click', () => {
        isSoundOn = !isSoundOn;
        soundIcon.textContent = isSoundOn ? '🔊' : '🔇';
        soundIcon.classList.toggle('active-icon', isSoundOn);
        // Logic for sound effects would go here
    });
    // Initialize icon state
    soundIcon.textContent = isSoundOn ? '🔊' : '🔇';
    soundIcon.classList.toggle('active-icon', isSoundOn);


    window.addEventListener('resize', () => {
        if (currentScreen === 'game') {
            resizeCanvas();
            // Potentially redraw or adjust elements if game is active
            // For this simple version, a full redraw on next gameLoop is often sufficient
        }
    });

    // Initial setup
    resizeCanvas(); // Also sets canvas size for menu view if needed
    switchScreen('menu-screen'); // Show menu first
});