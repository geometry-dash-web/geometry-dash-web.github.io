const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Player setup
let player = { x: 50, y: 300, width: 30, height: 30, vy: 0, jumping: false };
let gravity = 0.6;
let platforms = [{ x: 0, y: 350, width: 2000, height: 50 }]; // Total level width

// Progress bar element
const progressBar = document.querySelector('#level-progress-bar'); // Use ID if it's the top bar

function update() {
    // Apply gravity
    player.vy += gravity;
    player.y += player.vy;

    // Platform collision
    for (let platform of platforms) {
        if (
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height > platform.y &&
            player.y < platform.y + platform.height
        ) {
            player.y = platform.y - player.height;
            player.vy = 0;
            player.jumping = false;
        }
    }

    // Update progress bar based on player position
    const levelLength = platforms[0].width;
    const playerProgress = Math.min(player.x / levelLength, 1);
    progressBar.style.width = (playerProgress * 100) + "%";

    // Level completion check
    if (player.x >= levelLength) {
        alert("Level Complete!");
        window.location.href = "menu.html";
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw platforms
    ctx.fillStyle = "gray";
    for (let platform of platforms) {
        ctx.fillRect(platform.x - player.x + 50, platform.y, platform.width, platform.height);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Jumping
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !player.jumping) {
        player.vy = -12;
        player.jumping = true;
    }
});

// Simulate movement to the right (auto-run)
setInterval(() => {
    player.x += 5;
}, 50);

gameLoop();
