const objects = [
    { type: 'block', x: 400, y: 300, width: 50, height: 50 },
    { type: 'block', x: 450, y: 300, width: 50, height: 50 },
    { type: 'spike', x: 600, y: 320, width: 30, height: 30 },
    { type: 'slab', x: 800, y: 320, width: 100, height: 20 }
];

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

let isDead = false; // Global state to prevent multiple triggers

function restartLevel() {
    player = { x: 50, y: 300, width: 30, height: 30, vy: 0, jumping: false };
    isDead = false;
    bgMusic.currentTime = 0;
    bgMusic.play();
}


function update() {
    if (isDead) return; // Skip update loop if dead

    // Auto-scroll the player forward
    player.x += 3;

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

    // Object collisions
    for (let obj of objects) {
        // Block and slab collision
        if (
            (obj.type === 'block' || obj.type === 'slab') &&
            player.x + player.width > obj.x &&
            player.x < obj.x + obj.width &&
            player.y + player.height > obj.y &&
            player.y < obj.y + obj.height
        ) {
            player.y = obj.y - player.height;
            player.vy = 0;
            player.jumping = false;
        }

        if (
    obj.type === 'spike' &&
    player.x + player.width > obj.x &&
    player.x < obj.x + obj.width &&
    player.y + player.height > obj.y &&
    player.y < obj.y + obj.height
) {
    isDead = true;
    let spinAngle = 0;

    const deathAnim = () => {
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(100, player.y + player.height / 2);
        ctx.rotate(spinAngle);
        ctx.fillStyle = "red";
        ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
        ctx.restore();

        spinAngle += 0.3;
        if (spinAngle < 6 * Math.PI) {
            requestAnimationFrame(deathAnim);
        } else {
            setTimeout(restartLevel, 500);
        }
    };

    deathAnim();
    bgMusic.pause();
}

}

    // Update progress bar
    const levelLength = platforms[0].width;
    const playerProgress = Math.min(player.x / levelLength, 1);
    progressBar.style.width = (playerProgress * 100) + "%";

    // Level completion
    if (player.x >= levelLength) {
    isDead = true;
    bgMusic.pause();

    let flashAlpha = 0;
    const flashAnim = () => {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        flashAlpha += 0.05;

        if (flashAlpha < 1) {
            requestAnimationFrame(flashAnim);
        } else {
            setTimeout(() => {
                alert("Level Complete!");
                restartLevel();
            }, 1000);
        }
    };

    flashAnim();
}

}



function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw objects
for (let obj of objects) {
    const screenX = obj.x - player.x + 50; // camera follows player

    if (obj.type === 'block') {
        ctx.fillStyle = '#3498db';
        ctx.fillRect(screenX, obj.y, obj.width, obj.height);
    } else if (obj.type === 'spike') {
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(screenX, obj.y + obj.height);
        ctx.lineTo(screenX + obj.width / 2, obj.y);
        ctx.lineTo(screenX + obj.width, obj.y + obj.height);
        ctx.closePath();
        ctx.fill();
    } else if (obj.type === 'slab') {
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(screenX, obj.y, obj.width, obj.height);
    }
}

}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
    const bgMusic = document.getElementById("bgMusic");
bgMusic.volume = 0.5;

document.body.addEventListener("click", () => {
    bgMusic.play(); // Starts music on first click due to browser policy
}, { once: true });

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
