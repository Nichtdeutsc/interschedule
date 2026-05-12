const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

let score = 0;
let isGameOver = false;
let animationId; // Переменная для контроля цикла

const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    size: 30,
    color: '#00ff00'
};

let bullets = [];
let enemies = [];

canvas.addEventListener('mousemove', (e) => {
    if (isGameOver) return;
    const rect = canvas.getBoundingClientRect();
    player.x = e.clientX - rect.left - player.size / 2;
});

canvas.addEventListener('mousedown', () => {
    if (isGameOver) {
        restartGame();
        return;
    }
    bullets.push({
        x: player.x + player.size / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 10,
        speed: 7
    });
});

function spawnEnemy() {
    if (isGameOver) return;
    enemies.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        size: 30,
        color: '#ff4444',
        speed: 2 + Math.random() * 2
    });
    
    setTimeout(spawnEnemy, 500 + Math.random() * 1000);
}

function restartGame() {
    score = 0;
    isGameOver = false;
    enemies = [];
    bullets = [];
    scoreElement.innerText = score;
    
    cancelAnimationFrame(animationId);
    
    spawnEnemy();
    draw(); 
}

function update() {
    if (isGameOver) return;

    bullets.forEach((bullet, bIndex) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) bullets.splice(bIndex, 1);
    });

    enemies.forEach((enemy, eIndex) => {
        enemy.y += enemy.speed;

        if (enemy.y + enemy.size > canvas.height) {
            isGameOver = true;
        }

        if (enemy.x < player.x + player.size &&
            enemy.x + enemy.size > player.x &&
            enemy.y < player.y + player.size &&
            enemy.y + enemy.size > player.y) {
            isGameOver = true;
        }

        bullets.forEach((bullet, bIndex) => {
            if (bullet.x < enemy.x + enemy.size &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.size &&
                bullet.y + bullet.height > enemy.y) {
                enemies.splice(eIndex, 1);
                bullets.splice(bIndex, 1);
                score += 10;
                scoreElement.innerText = score;
            }
        });
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);

    ctx.fillStyle = 'yellow';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.size, e.size);
    });

    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        
        ctx.font = '24px Arial';
        ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 50);
        
        return; 
    }

    update();
    // Сохраняем ID анимации, чтобы можно было управлять циклом
    animationId = requestAnimationFrame(draw);
}

spawnEnemy();
draw();
