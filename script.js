const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: 400,
    y: 200,
    size: 30,
    color: 'red'
};

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    
    player.x = event.clientX - rect.left - player.size / 2;
    player.y = event.clientY - rect.top - player.size / 2;
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);

    requestAnimationFrame(gameLoop);
}

gameLoop();