(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');

  // Game constants
  const GRAVITY = 0.6;
  const JUMP_VELOCITY = -11;
  const PLAYER_SIZE = 30;
  const LEVEL_LENGTH = 4000; // in pixels

  // Input state
  let pressingJump = false;

  // Player state
  let player = {
    x: 50,
    y: canvas.height - PLAYER_SIZE - 40,
    vy: 0,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    grounded: false,
  };

  // Level data: obstacles as rectangles {x, y, width, height}
  const spikes = [
    { x: 300, y: canvas.height - 40, width: 40, height: 40 },
    { x: 600, y: canvas.height - 40, width: 40, height: 40 },
    { x: 1200, y: canvas.height - 40, width: 40, height: 40 },
    { x: 1500, y: canvas.height - 40, width: 40, height: 40 },
  ];

  const jumpPads = [
    { x: 900, y: canvas.height - 20, width: 30, height: 10 },
  ];

  // Scroll offset
  let scrollX = 0;

  // Game state
  let gameOver = false;
  let gameStarted = false;

  // Start the game on click or space
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      if (!gameStarted) {
        gameStarted = true;
      }
      pressingJump = true;
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') pressingJump = false;
  });
  window.addEventListener('mousedown', () => {
    if (!gameStarted) gameStarted = true;
    pressingJump = true;
  });
  window.addEventListener('mouseup', () => {
    pressingJump = false;
  });

  function reset() {
    player.x = 50;
    player.y = canvas.height - PLAYER_SIZE - 40;
    player.vy = 0;
    scrollX = 0;
    gameOver = false;
    gameStarted = false;
  }

  function rectsOverlap(r1, r2) {
    return !(r1.x + r1.width < r2.x ||
             r1.x > r2.x + r2.width ||
             r1.y + r1.height < r2.y ||
             r1.y > r2.y + r2.height);
  }

  function update() {
    if (!gameStarted) {
      drawStartScreen();
      requestAnimationFrame(update);
      return;
    }

    if (gameOver) {
      drawGameOver();
      requestAnimationFrame(update);
      return;
    }

    // Horizontal scroll speed
    const speed = 5;

    // Move player horizontally by scrolling the level left
    scrollX += speed;

    // Player vertical movement
    player.vy += GRAVITY;
    player.y += player.vy;

    // Ground collision
    if (player.y + player.height > canvas.height - 40) {
      player.y = canvas.height - 40 - player.height;
      player.vy = 0;
      player.grounded = true;
    } else {
      player.grounded = false;
    }

    // Jump
    if (pressingJump && player.grounded) {
      player.vy = JUMP_VELOCITY;
      player.grounded = false;
    }

    // Check collisions with spikes
    for (let spike of spikes) {
      const spikeRect = {
        x: spike.x - scrollX,
        y: spike.y,
        width: spike.width,
        height: spike.height,
      };
      const playerRect = {
        x: player.x,
        y: player.y,
        width: player.width,
        height: player.height,
      };
      if (rectsOverlap(spikeRect, playerRect)) {
        gameOver = true;
      }
    }

    // Check collisions with jump pads
    for (let pad of jumpPads) {
      const padRect = {
        x: pad.x - scrollX,
        y: pad.y,
        width: pad.width,
        height: pad.height,
      };
      const playerRect = {
        x: player.x,
        y: player.y,
        width: player.width,
        height: player.height,
      };
      if (rectsOverlap(padRect, playerRect) && player.vy >= 0) {
        player.vy = JUMP_VELOCITY * 1.5; // bigger jump
      }
    }

    // Check level complete
    if (scrollX > LEVEL_LENGTH) {
      drawLevelComplete();
      return;
    }

    draw();

    requestAnimationFrame(update);
  }

  function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#eee';
    ctx.font = '28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Press Space or Click to Start', canvas.width / 2, canvas.height / 2);
  }

  function drawGameOver() {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f00';
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    ctx.font = '24px monospace';
    ctx.fillText('Press Space or Click to Retry', canvas.width / 2, canvas.height / 2 + 40);
  }

  function drawLevelComplete() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f0';
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Level Complete!', canvas.width / 2, canvas.height / 2);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#444';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    // Draw player (cube)
    ctx.fillStyle = '#0af';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw spikes
    ctx.fillStyle = '#f33';
    for (let spike of spikes) {
      const spikeX = spike.x - scrollX;
      if (spikeX + spike.width < 0 || spikeX > canvas.width) continue;
      // draw triangle spikes
      ctx.beginPath();
      ctx.moveTo(spikeX, spike.y + spike.height);
      ctx.lineTo(spikeX + spike.width / 2, spike.y);
      ctx.lineTo(spikeX + spike.width, spike.y + spike.height);
      ctx.closePath();
      ctx.fill();
    }

    // Draw jump pads
    ctx.fillStyle = '#0f3';
    for (let pad of jumpPads) {
      const padX = pad.x - scrollX;
      if (padX + pad.width < 0 || padX > canvas.width) continue;
      ctx.fillRect(padX, pad.y, pad.width, pad.height);
    }

    // Draw progress bar
    let progress = Math.min(scrollX / LEVEL_LENGTH, 1);
    progressBar.style.width = (progress * 100) + '%';
    progressText.textContent = Math.floor(progress * 100) + '%';
  }

  // Restart on input when game over or level complete
  window.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'Enter') && (gameOver || scrollX > LEVEL_LENGTH)) {
      reset();
      update();
    }
  });
  window.addEventListener('mousedown', () => {
    if (gameOver || scrollX > LEVEL_LENGTH) {
      reset();
      update();
    }
  });

  reset();
  update();
})();
