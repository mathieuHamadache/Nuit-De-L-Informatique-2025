import { CONFIG } from './config.js';
import { assets } from './assets.js';
import { STATE } from './state.js';
import { mouseInRect } from './utils.js';

let flocons = [];

export function initNeige() {
    flocons = [];
    for(let i=0; i<100; i++) {
        flocons.push({
            x: Math.random() * CONFIG.LARGEUR_FENETRE,
            y: Math.random() * CONFIG.LARGEUR_FENETRE,
            speed: Math.random() * 2 + 1,
            size: Math.random() * 3 + 2
        });
    }
}

export function drawGame(ctx) {
    if (STATE.bgCanvas) ctx.drawImage(STATE.bgCanvas, 0, 0);

    drawCadeau(ctx, STATE.cadeau, false);
    if (STATE.doree.active) drawCadeau(ctx, STATE.doree.rect, true);

    // Dessin du corps
    for(let i = STATE.length; i > 0; i--) {
        let idx = STATE.history.length - 1 - (i * CONFIG.GAP_QUEUE);
        if (idx >= 0) {
            let pos = STATE.history[idx];
            ctx.fillStyle = CONFIG.COULEURS.GRINCH_CERCLE;
            ctx.beginPath(); ctx.arc(pos.x, pos.y, 30, 0, Math.PI*2); ctx.fill();
            let corpsW = CONFIG.DIMENSIONS_CORPS[0] / 0.95;
            let corpsH = CONFIG.DIMENSIONS_CORPS[1] / 0.95;
            ctx.drawImage(assets.corps, pos.x - corpsW/2, pos.y - corpsH/2, corpsW, corpsH);
        }
    }

    // Dessin de la tête (Grinch)
    const s = STATE.snake;
    ctx.fillStyle = CONFIG.COULEURS.GRINCH_CERCLE;
    ctx.beginPath(); ctx.arc(s.x, s.y, 30, 0, Math.PI*2); ctx.fill();
    let grinchW = CONFIG.DIMENSIONS_GRINCH[0] / 0.95;
    let grinchH = CONFIG.DIMENSIONS_GRINCH[1] / 0.95;
    ctx.drawImage(assets.grinch, s.x - grinchW/2, s.y - grinchH/2, grinchW, grinchH);
    
    // Bords décoratifs
    ctx.fillStyle = CONFIG.COULEURS.GRAY;
    const borderThickness = 3;
    const circleRadius = 10;
    for (let x = 0; x < CONFIG.LARGEUR_FENETRE; x += circleRadius * 3) {
        ctx.beginPath(); ctx.arc(x, borderThickness / 2, circleRadius, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x, CONFIG.LARGEUR_FENETRE - borderThickness / 2, circleRadius, 0, Math.PI * 2); ctx.fill();
    }
    for (let y = 0; y < CONFIG.LARGEUR_FENETRE; y += circleRadius * 2.5) {
        ctx.beginPath(); ctx.arc(borderThickness / 2 - 2, y, circleRadius + 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(CONFIG.LARGEUR_FENETRE - borderThickness / 2 + 2, y, circleRadius + 1, 0, Math.PI * 2); ctx.fill();
    }

    // Obstacles
    for(let obs of STATE.obstacles) {
        let ox = obs.col * CONFIG.TAILLE_CASE;
        let oy = obs.row * CONFIG.TAILLE_CASE;
        ctx.drawImage(obs.img, ox, oy, CONFIG.TAILLE_CASE, CONFIG.TAILLE_CASE);
    }

    // UI Score
    ctx.fillStyle = "rgba(0,0,0,0.6)"; 
    ctx.fillRect(10, 10, 150, 40); 
    
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "left"; 
    ctx.textBaseline = "middle"; 
    ctx.fillText(`Cadeaux: ${STATE.score}`, 25, 30); 
    ctx.textBaseline = "alphabetic"; 
}

function drawCadeau(ctx, rect, isGold) {
    let cx = rect.x + rect.w/2;
    let cy = rect.y + rect.h/2;
    ctx.fillStyle = isGold ? CONFIG.COULEURS.DOREE_CERCLE : CONFIG.COULEURS.CADEAU_CERCLE;
    ctx.beginPath(); ctx.arc(cx, cy, isGold ? 40 : 30, 0, Math.PI*2); ctx.fill();
    let img = isGold ? assets.cadeau_doree : assets.cadeau;
    ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h);
}

export function drawMenu(ctx, time, mousePos, canvasWidth, canvasHeight) {
    ctx.fillStyle = CONFIG.COULEURS.MENU_BG;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = "rgba(200, 200, 255, 0.8)";
    flocons.forEach(f => {
        ctx.beginPath(); ctx.arc(f.x, f.y, f.size, 0, Math.PI*2); ctx.fill();
        f.y += f.speed;
        f.x += Math.sin(time / 500 + f.size) * 0.5;
        if (f.y > CONFIG.LARGEUR_FENETRE) { f.y = -5; f.x = Math.random() * CONFIG.LARGEUR_FENETRE; }
    });

    let yCursor = 150;
    if (assets.logo.complete && assets.logo.naturalWidth !== 0) {
        let ratio = 200 / assets.logo.height;
        let w = assets.logo.width * ratio;
        let h = 200;
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.beginPath(); ctx.ellipse(canvasWidth/2, yCursor + h/2, w/1.5, h/1.5, 0, 0, Math.PI*2); ctx.fill();
        ctx.drawImage(assets.logo, canvasWidth/2 - w/2, yCursor, w, h);
        yCursor += h + 50;
    } else {
        ctx.font = "bold 60px Comic Sans MS";
        drawTextWithBorder(ctx, "GRINCH SNAKE", canvasWidth/2, 200, "#78BE21", "black", 2);
        yCursor = 300;
    }

    ctx.font = "bold 26px Arial";
    drawTextWithBorder(ctx, "Aide le Grinch à voler", canvasWidth/2, yCursor + 10, "white", "black", 1);
    drawTextWithBorder(ctx, "les cadeaux des enfants !", canvasWidth/2, yCursor + 45, "white", "black", 1);
    drawTextWithBorder(ctx, "[ Z, Q, S, D]", canvasWidth/2, yCursor + 220, "white", "black", 1);

    let scoreTxt = `RECORD : ${STATE.highScore}`;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.strokeStyle = CONFIG.COULEURS.TEXTE_OR;
    ctx.lineWidth = 2;
    let rectW = 300, rectH = 50;
    let rectX = canvasWidth/2 - rectW/2;
    let rectY = yCursor + 80;
    
    ctx.fillRect(rectX, rectY, rectW, rectH);
    ctx.strokeRect(rectX, rectY, rectW, rectH);
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = CONFIG.COULEURS.TEXTE_OR;
    ctx.textAlign = "center";
    ctx.fillText(scoreTxt, canvasWidth/2, rectY + 35);

    let btnRect = { x: canvasWidth/2 - 140, y: canvasHeight - 150, w: 280, h: 80 };
    let hover = mouseInRect(mousePos, btnRect);
    
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.roundRect(btnRect.x, btnRect.y+5, btnRect.w, btnRect.h, 20);
    ctx.fill();

    ctx.fillStyle = hover ? "#ff3232" : "#dc143c";
    ctx.beginPath(); ctx.roundRect(btnRect.x - (hover?5:0), btnRect.y, btnRect.w + (hover?10:0), btnRect.h, 20); ctx.fill();
    ctx.strokeStyle = hover ? "#ffc8c8" : "#640000";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "bold 45px Arial";
    ctx.shadowColor = "rgba(50,0,0,1)";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;
    ctx.fillText("JOUER", canvasWidth/2, btnRect.y + 55);
    ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
}

function drawTextWithBorder(ctx, txt, x, y, color, border, thickness) {
    ctx.textAlign = "center";
    ctx.fillStyle = border;
    for(let dx=-thickness; dx<=thickness; dx++) {
        for(let dy=-thickness; dy<=thickness; dy++) {
            ctx.fillText(txt, x+dx, y+dy);
        }
    }
    ctx.fillStyle = color;
    ctx.fillText(txt, x, y);
}