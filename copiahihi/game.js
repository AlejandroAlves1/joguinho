const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const birdImg = document.getElementById('birdImg');

// Configura a força do pulo
const jumpStrength = -8;

// Carrega as imagens dos canos
const canoBottom = new Image();
canoBottom.src = 'canoBottom.png'; // Certifique-se de que o caminho para a imagem esteja correto

const canoTop = new Image();
canoTop.src = 'canoTop.png'; // Certifique-se de que o caminho para a imagem esteja correto

// Objeto bird que representa o pássaro no jogo
const bird = {
    x: 50,
    y: 150,
    width: 50, // Largura 
    height: 50, // Altura
    gravity: 0.6,
    lift: jumpStrength,
    velocity: 0,
    score: 0, // Adicionando score inicial
    // Atualiza a posição do pássaro baseado na gravidade e velocidade
    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;
        // Verifica se o pássaro toca o chão ou o topo do canvas
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
        }
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },
    // Faz o pássaro pular
    flap() {
        this.velocity = this.lift;
    },
    // Incrementa o score
    increaseScore() {
        this.score++;
    }
};

// Define as dimensões do canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    bird.width = canvas.width * 0.05;
    bird.height = canvas.height * 0.05;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Array para armazenar os canos
const pipes = [];
const pipeWidth = 62; // Largura do cano ajustada para o tamanho da imagem
const pipeGap = 250; // Gap entre os canos superior e inferior (aumentado)
let frame = 0;
let gameStarted = false;

// Função para adicionar um novo cano ao jogo
function addPipe() {
    const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap));
    pipes.push({
        x: canvas.width,
        y: pipeHeight,
        width: pipeWidth,
        height: pipeHeight
    });
}

// Atualiza a posição dos canos
function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= 2;
        // Remove o cano do array se ele sair da tela
        if (pipe.x + pipe.width < 0) {
            pipes.shift();
            // Incrementa o score ao passar pelo cano
            bird.increaseScore();
        }
    });
    // Adiciona um novo cano a cada 120 frames (aumentado)
    if (frame % 120 === 0) {
        addPipe();
    }
}

// Desenha os canos no canvas
function drawPipes() {
    pipes.forEach(pipe => {
        // Desenha o cano superior
        context.drawImage(canoTop, pipe.x, pipe.y - canoTop.height, pipe.width, canoTop.height);
        // Desenha o cano inferior
        context.drawImage(canoBottom, pipe.x, pipe.y + pipeGap, pipe.width, canvas.height - pipe.y - pipeGap);
    });
}

// Exibe o score na tela
function drawScore() {
    const text = `Score: ${bird.score}`;
    const textWidth = context.measureText(text).width;

    // Desenha o fundo semi-transparente para o score
    context.fillStyle = "rgba(0, 0, 0, 0.3)"; // Cor do fundo transparente (preto com 30% de transparência)
    context.fillRect(5, 5, textWidth + 30, 30);

    // Configurações de estilo para o texto
    context.font = "24px Arial";
    context.fillStyle = "#fff"; // Cor do texto
    context.fillText(text, 20, 30); // Desenha o texto do score
}

// Verifica colisão entre o pássaro e os canos, o topo e o fundo da página
function checkCollision() {
    // Coordenadas do pássaro
    const birdLeft = bird.x;
    const birdRight = bird.x + bird.width;
    const birdTop = bird.y;
    const birdBottom = bird.y + bird.height;

    let passedPipe = false; // Variável para verificar se o pássaro passou pelo cano

    pipes.forEach((pipe, index) => {
        // Coordenadas do cano superior e inferior
        const pipeTopHeight = pipe.y; // Altura do cano superior
        const pipeBottomHeight = canvas.height - (pipe.y + pipeGap); // Altura do cano inferior

        // Verifica se o pássaro está entre os canos na horizontal
        if (birdRight > pipe.x && birdLeft < pipe.x + pipeWidth) {
            // Verifica se o pássaro passou pelo cano
            if (birdLeft > pipe.x + pipeWidth) {
                passedPipe = true;
            }

            // Verifica colisão com o cano superior
            if (birdTop < pipeTopHeight && birdBottom > pipeTopHeight) {
                // Verifica se o pássaro não passou pelo gap
                if (!passedPipe) {
                    resetGame();
                }
            }

            // Verifica colisão com o cano inferior
            if (birdBottom > canvas.height - pipeBottomHeight && birdTop < canvas.height - pipeBottomHeight) {
                // Verifica se o pássaro não passou pelo gap
                if (!passedPipe) {
                    resetGame();
                }
            }
        }

        // Remove o cano do array se ele sair da tela
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
        }
    });

    // Verifica colisão com o topo da página
    if (birdTop <= 0) {
        resetGame();
    }

    // Verifica colisão com o fundo da página
    if (birdBottom >= canvas.height) {
        resetGame();
    }
}


// Reseta o jogo para o estado inicial
function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    bird.score = 0; // Reseta o score ao reiniciar o jogo
    pipes.length = 0;
    frame = 0;
    gameStarted = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = "20px Arial";
    context.fillStyle = "#fff";
    context.fillText("Pressione Espaço para Iniciar", canvas.width / 2 - 100, canvas.height / 2);
    startScreen.style.display = 'flex';
    birdImg.style.display = 'none';
}

// Loop principal do jogo
function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (gameStarted) {
        bird.update();
        birdImg.style.left = bird.x + 'px';
        birdImg.style.top = bird.y + 'px';
        updatePipes();
        drawPipes();
        drawScore(); // Adiciona a função para desenhar o score
        checkCollision();
        frame++;
    } else {
        context.font = "20px Arial";
        context.fillStyle = "#fff";
        context.fillText("Pressione Espaço para Iniciar", canvas.width / 2 - 100, canvas.height / 2);
    }
    requestAnimationFrame(gameLoop);
}

// Evento para iniciar o jogo ao pressionar a tecla Espaço
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameStarted) {
            gameStarted = true;
            pipes.length = 0;
            frame = 0;
            bird.y = 150;
            bird.velocity = 0;
            startScreen.style.display = 'none';
            birdImg.style.display = 'block';
        }
        bird.flap();
    }
});

// Evento para iniciar o jogo ao clicar no botão de iniciar
startButton.addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        pipes.length = 0;
        frame = 0;
        bird.y = 150;
        bird.velocity = 0;
        startScreen.style.display = 'none';
        birdImg.style.display = 'block';
    }
    bird.flap();
});

// Inicia o loop do jogo
gameLoop();
