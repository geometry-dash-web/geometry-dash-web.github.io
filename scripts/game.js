const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

let player = { x: 50, y: 300, width: 30, height: 30, vy: 0, jumping: false };
let gravity = 0.6;
let platforms = [{x: 0, y: 350, width: 2000, height: 50}];
let startTime = Date.now();
let duration = 90 * 1000; // 1:30

function update() {
    // Gravity
    player.vy += gravity;
    player.y += player.vy;

    // Collision with platforms
    for (let platform of platforms) {
        if (player.x + player.width > platform.x && player.x < platform.x + platform.width &&
            player.y + player.height > platform.y && player.y < platform.y + platform.height) {
            player.y = platform.y - player.height;
            player.vy = 0;
            player.jumping = false;
        }
    }

    // Check for level completion
    if (Date.now() - startTime > duration) {
        alert("Level Complete!");
        window.location.href = "index.html";
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
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", e => {
    if (e.code === "Space" && !player.jumping) {
        player.vy = -12;
        player.jumping = true;
    }
});

gameLoop();