import { CONFIG } from './config.js';
import { STATE } from './state.js';
import { assets, playMusic } from './assets.js';
import { genererCarte, creerFond, trouverPositionCadeau } from './map.js';
import { drawGame, drawMenu, initNeige } from './draw.js';
import { checkCollision, mouseInRect } from './utils.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let lastTime = 0;
let mousePos = {x:0, y:0};

// Initialisation globale
initNeige();

function initGame() {
    STATE.obstacles = genererCarte();
    STATE.bgCanvas = creerFond(STATE.obstacles);
    let startC = Math.floor(CONFIG.NB_COLONNES / 2) - 2;
    let startR = Math.floor(CONFIG.NB_LIGNES / 2) - 1;
    STATE.snake = {
        x: startC * CONFIG.TAILLE_CASE + CONFIG.TAILLE_CASE/2,
        y: startR * CONFIG.TAILLE_CASE + CONFIG.TAILLE_CASE/2,
        dirX: 0, dirY: 0, nextDirX: 0, nextDirY: 0
    };
    STATE.history = [];
    STATE.length = 0;
    STATE.score = 0;
    STATE.gameOver = false;
    STATE.cadeau = trouverPositionCadeau(STATE.obstacles);
    STATE.doree = { active: false, rect: null, timerStart: 0 };
}



function doGameOver() {
    STATE.gameOver = true;
    playMusic('menu');
    if (STATE.score > STATE.highScore) {
        STATE.highScore = STATE.score;
        localStorage.setItem('grinch_highscore', STATE.highScore);
    }
    setTimeout(() => { STATE.menu = true; }, 1000);
}

function demarrerAudioInteraction() {
    if (assets.musiqueMenu.paused && STATE.menu) {
        playMusic('menu');
    }
    // On retire les écouteurs une fois que c'est fait pour ne pas spammer
    window.removeEventListener('click', demarrerAudioInteraction);
    window.removeEventListener('keydown', demarrerAudioInteraction);
}

// On écoute le premier clic ou la première touche
window.addEventListener('click', demarrerAudioInteraction);
window.addEventListener('keydown', demarrerAudioInteraction);

// Lancement initial (qui sera bloqué par le navigateur, mais c'est normal)
playMusic('menu');
requestAnimationFrame(gameLoop);

function updateGame(timestamp) {
    const s = STATE.snake;
    const alignX = (s.x - CONFIG.TAILLE_CASE/2) % CONFIG.TAILLE_CASE === 0;
    const alignY = (s.y - CONFIG.TAILLE_CASE/2) % CONFIG.TAILLE_CASE === 0;
    
    if (alignX && alignY) {
        if (s.nextDirX !== 0 || s.nextDirY !== 0) {
            s.dirX = s.nextDirX; s.dirY = s.nextDirY;
        }
    }
    
    s.x += s.dirX * CONFIG.VITESSE;
    s.y += s.dirY * CONFIG.VITESSE;
    
    let headRect = {
        x: s.x - CONFIG.TAILLE_HITBOX_GRINCH/2,
        y: s.y - CONFIG.TAILLE_HITBOX_GRINCH/2,
        w: CONFIG.TAILLE_HITBOX_GRINCH, h: CONFIG.TAILLE_HITBOX_GRINCH
    };
    
    STATE.history.push({x: headRect.x + 10, y: headRect.y + 10});
    let maxHist = (STATE.length * CONFIG.GAP_QUEUE) + CONFIG.GAP_QUEUE + 50;
    if (STATE.history.length > maxHist) STATE.history.shift();

    // Logique Cadeau Doré
    if (STATE.doree.active) {
        if (timestamp - STATE.doree.timerStart > CONFIG.DUREE_VIE_DOREE) {
            STATE.doree.active = false; STATE.doree.rect = null;
        }
    } else {
        if (Math.floor(Math.random() * 300) === 0) {
            STATE.doree.rect = trouverPositionCadeau(STATE.obstacles, [STATE.cadeau]);
            STATE.doree.active = true; STATE.doree.timerStart = timestamp;
        }
    }

    // Collision Cadeaux
    if (checkCollision(headRect, STATE.cadeau)) {
        STATE.score += CONFIG.POINTS_NORMAL;
        STATE.length++;
        let interdits = STATE.doree.active ? [STATE.doree.rect] : [];
        STATE.cadeau = trouverPositionCadeau(STATE.obstacles, interdits);
    }
    
    if (STATE.doree.active && checkCollision(headRect, STATE.doree.rect)) {
        STATE.score += CONFIG.POINTS_DOREE;
        STATE.length++;
        STATE.doree.active = false; STATE.doree.rect = null;
    }

    // Collision Obstacles
    for(let obs of STATE.obstacles) {
        let obsRect = { x: obs.col * CONFIG.TAILLE_CASE, y: obs.row * CONFIG.TAILLE_CASE, w: CONFIG.TAILLE_CASE, h: CONFIG.TAILLE_CASE };
        let margin = -CONFIG.MARGE_TOLERANCE_MAISON;
        let reducedObs = { x: obsRect.x + margin, y: obsRect.y + margin, w: CONFIG.TAILLE_CASE - margin*2, h: CONFIG.TAILLE_CASE - margin*2 };
        if (checkCollision(headRect, reducedObs)) doGameOver();
    }

    // Collision Murs
    if (headRect.x < 0 || headRect.x + headRect.w > CONFIG.LARGEUR_FENETRE || headRect.y < 0 || headRect.y + headRect.h > CONFIG.LARGEUR_FENETRE) {
        doGameOver();
    }

    // Collision Queue
    for(let i = 4; i <= STATE.length; i++) {
        let idx = STATE.history.length - 1 - (i * CONFIG.GAP_QUEUE);
        if (idx >= 0) {
            let pos = STATE.history[idx];
            let tailRect = { x: pos.x - 10, y: pos.y - 10, w: 20, h: 20 };
            if (checkCollision(headRect, tailRect)) doGameOver();
        }
    }
}

function gameLoop(timestamp) {
    let dt = timestamp - lastTime;
    lastTime = timestamp;
    if (STATE.menu) {
        drawMenu(ctx, timestamp, mousePos, canvas.width, canvas.height);
    } else if (!STATE.gameOver) {
        updateGame(timestamp);
        drawGame(ctx);
    }
    requestAnimationFrame(gameLoop);
}


window.addEventListener('mousemove', e => {
    let rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
});

window.addEventListener('mousedown', e => {
    if (assets.musiqueMenu.paused && STATE.menu) { playMusic('menu'); }
    if (STATE.menu) {
        let btnRect = { x: canvas.width/2 - 140, y: canvas.height - 150, w: 280, h: 80 };
        if (mouseInRect(mousePos, btnRect)) {
            playMusic('game');
            STATE.menu = false;
            initGame();
        }
    }
});

window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    const s = STATE.snake;
    if ((k === 'z' || k === 'arrowup') && s.dirY === 0) { s.nextDirX = 0; s.nextDirY = -1; }
    if ((k === 's' || k === 'arrowdown') && s.dirY === 0) { s.nextDirX = 0; s.nextDirY = 1; }
    if ((k === 'q' || k === 'arrowleft') && s.dirX === 0) { s.nextDirX = -1; s.nextDirY = 0; }
    if ((k === 'd' || k === 'arrowright') && s.dirX === 0) { s.nextDirX = 1; s.nextDirY = 0; }
});

// Lancement
playMusic('menu');
requestAnimationFrame(gameLoop);