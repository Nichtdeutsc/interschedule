const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

let score = 0;


const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    size: 30,
    color: '#00ff00'
};

let bullets = [];
let enemies = [];

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.x = e.clientX - rect.left - player.size / 2;
});

canvas.addEventListener('mousedown', () => {
    bullets.push({
        x: player.x + player.size / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 10,
        speed: 7
    });
});

setInterval(() => {
    enemies.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        size: 30,
        color: '#ff4444',
        speed: 2 + Math.random() * 2
    });
}, 1500);

function update() {
    bullets.forEach((bullet, bIndex) => {
        bullet.y -= bullet.speed;
        
        if (bullet.y < 0) bullets.splice(bIndex, 1);
    });

    enemies.forEach((enemy, eIndex) => {
        enemy.y += enemy.speed;

        bullets.forEach((bullet, bIndex) => {
            if (bullet.x < enemy.x + enemy.size &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.size &&
                bullet.y + bullet.height > enemy.y) {
                
                // Попадание!
                setTimeout(() => {
                    enemies.splice(eIndex, 1);
                    bullets.splice(bIndex, 1);
                    score += 10;
                    scoreElement.innerText = score;
                }, 0);
            }
        });

        if (enemy.y > canvas.height) {
            enemies.splice(eIndex, 1);
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // bullets
    ctx.fillStyle = 'yellow';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.size, e.size);
    });

    update();
    requestAnimationFrame(draw);
}

draw();
