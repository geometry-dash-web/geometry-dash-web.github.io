function startGame() {
        currentScreen = 'game';
        menuScreen.classList.remove('active');
        gameOverScreen.classList.remove('active');
        levelCompleteScreen.classList.remove('active');
        gameScreen.classList.add('active');
        gameScreen.classList.remove('fade-out'); // Ensure it's visible

        resizeCanvas(); // Set initial canvas size

        // Find the initial ground block and position the player on it
        const initialGround = levelData.find(obj => obj.x === 0 && obj.t === 'block');
        let initialPlayerY = canvas.height - PLAYER_SIZE - 40; // Default if no ground found at x=0

        if (initialGround) {
            initialPlayerY = initialGround.y - PLAYER_SIZE;
        }

        player = new Player(50, initialPlayerY, PLAYER_SIZE, '#3498db'); // Blue player
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