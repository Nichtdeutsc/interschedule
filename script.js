const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

let score = 0;
let isGameOver = false;

const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    size: 30,
    color: '#00ff00'
};

let bullets = [];
let enemies = [];

// Управление
canvas.addEventListener('mousemove', (e) => {
    if (isGameOver) return; // Если игра окончена, не двигаемся
    const rect = canvas.getBoundingClientRect();
    player.x = e.clientX - rect.left - player.size / 2;
});

// Стрельба
canvas.addEventListener('mousedown', () => {
    if (isGameOver) {
        // Перезапуск игры при клике после проигрыша
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
    // Случайное время до следующего врага (от 0.5 до 1.5 сек)
    setTimeout(spawnEnemy, 500 + Math.random() * 1000);
}

function restartGame() {
    score = 0;
    isGameOver = false;
    enemies = [];
    bullets = [];
    scoreElement.innerText = score;
    spawnEnemy();
    gameLoop();
}

function update() {
    if (isGameOver) return;

    bullets.forEach((bullet, bIndex) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) bullets.splice(bIndex, 1);
    });

    enemies.forEach((enemy, eIndex) => {
        enemy.y += enemy.speed;

        // 1. Проверка: Враг дошел до низа
        if (enemy.y + enemy.size > canvas.height) {
            isGameOver = true;
        }

        // 2. Проверка: Враг коснулся игрока
        if (enemy.x < player.x + player.size &&
            enemy.x + enemy.size > player.x &&
            enemy.y < player.y + player.size &&
            enemy.y + enemy.size > player.y) {
            isGameOver = true;
        }

        // Столкновение пули с врагом
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
        ctx.fillText('game over', canvas.width / 2, canvas.height / 2);
        
        ctx.font = '24px Arial';
        ctx.fillText('mouseclick to restart', canvas.width / 2, canvas.height / 2 + 50);
        return; // Останавливаем цикл отрисовки
    }

    update();
    requestAnimationFrame(draw);
}

// Запуск
spawnEnemy();
draw();
