import { CONFIG } from './config.js';
import { assets } from './assets.js';
import { checkCollision } from './utils.js';

function estAccessible(obstacles, startX, startY) {
    let blocked = new Set();
    obstacles.forEach(o => blocked.add(`${o.col},${o.row}`));
    if (blocked.has(`${startX},${startY}`)) return false;

    let queue = [{c: startX, r: startY}];
    let visited = new Set([`${startX},${startY}`]);
    let cols = CONFIG.NB_COLONNES;
    let rows = CONFIG.NB_LIGNES;
    let head = 0;
    
    while(head < queue.length) {
        let curr = queue[head++];
        const dirs = [[0,1], [0,-1], [1,0], [-1,0]];
        for(let d of dirs) {
            let nc = curr.c + d[0];
            let nr = curr.r + d[1];
            let key = `${nc},${nr}`;
            if (nc >= 0 && nc < cols && nr >= 0 && nr < rows && 
                !blocked.has(key) && !visited.has(key)) {
                visited.add(key);
                queue.push({c: nc, r: nr});
            }
        }
    }
    let totalCases = cols * rows;
    let totalLibres = totalCases - obstacles.length;
    return visited.size === totalLibres;
}

export function genererCarte() {
    let centerC = Math.floor(CONFIG.NB_COLONNES / 2);
    let centerR = Math.floor(CONFIG.NB_LIGNES / 2);
    let targetObstacles = Math.floor(CONFIG.NB_COLONNES * CONFIG.NB_LIGNES * CONFIG.POURCENTAGE_OBSTACLES);
    let startC = centerC - 2;
    let startR = centerR - 1;
    
    while(true) {
        let obstacles = [];
        let occupied = new Set();
        let candidates = [];
        for(let c=0; c<CONFIG.NB_COLONNES; c++) {
            for(let r=0; r<CONFIG.NB_LIGNES; r++) {
                if (Math.abs(c - centerC) <= 1 && Math.abs(r - centerR) <= 1) continue;
                if (c === startC && r === startR) continue;
                candidates.push({c, r});
            }
        }
        // Fisher-Yates Shuffle
        for (let i = candidates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }
        
        for(let pos of candidates) {
            if (obstacles.length >= targetObstacles) break;
            let diags = [`${pos.c-1},${pos.r-1}`, `${pos.c+1},${pos.r-1}`, `${pos.c-1},${pos.r+1}`, `${pos.c+1},${pos.r+1}`];
            if (!diags.some(d => occupied.has(d))) {
                obstacles.push({
                    col: pos.c, 
                    row: pos.r, 
                    img: assets.maisons[Math.floor(Math.random() * assets.maisons.length)]
                });
                occupied.add(`${pos.c},${pos.r}`);
            }
        }
        if (estAccessible(obstacles, centerC, centerR)) return obstacles;
    }
}

export function creerFond(obstacles) {
    const bg = document.createElement('canvas');
    bg.width = CONFIG.LARGEUR_FENETRE;
    bg.height = CONFIG.LARGEUR_FENETRE;
    const ctx = bg.getContext('2d');
    ctx.fillStyle = CONFIG.COULEURS.BG;
    ctx.fillRect(0, 0, bg.width, bg.height);
    let obsSet = new Set(obstacles.map(o => `${o.col},${o.row}`));

    for(let c=0; c<CONFIG.NB_COLONNES; c++) {
        for(let r=0; r<CONFIG.NB_LIGNES; r++) {
            let cx = c * CONFIG.TAILLE_CASE + CONFIG.TAILLE_CASE/2;
            let cy = r * CONFIG.TAILLE_CASE + CONFIG.TAILLE_CASE/2;
            if (!obsSet.has(`${c},${r}`)) {
                ctx.fillStyle = CONFIG.COULEURS.GRAY;
                ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI*2); ctx.fill();
            } else {
                for(let k=0; k<3; k++) {
                    ctx.fillStyle = `rgba(200, 200, 200, ${Math.random() * 0.2 + 0.1})`;
                    ctx.beginPath();
                    let ox = cx + (Math.random()*10 - 5);
                    let oy = cy + (Math.random()*10 - 5);
                    ctx.arc(ox, oy, Math.random()*10 + 20, 0, Math.PI*2); ctx.fill();
                }
            }
        }
    }
    return bg;
}

export function trouverPositionCadeau(obstacles, rectsInterdits = []) {
    let positionsObstacles = new Set(obstacles.map(o => `${o.col},${o.row}`));
    let centerC = Math.floor(CONFIG.NB_COLONNES / 2);
    let centerR = Math.floor(CONFIG.NB_LIGNES / 2);
    while(true) {
        let c = Math.floor(Math.random() * CONFIG.NB_COLONNES);
        let r = Math.floor(Math.random() * CONFIG.NB_LIGNES);
        if (positionsObstacles.has(`${c},${r}`)) continue;
        if (Math.abs(c - centerC) < 2 && Math.abs(r - centerR) < 2) continue;
        let rect = {x: c * CONFIG.TAILLE_CASE, y: r * CONFIG.TAILLE_CASE, w: CONFIG.TAILLE_CASE, h: CONFIG.TAILLE_CASE};
        let collision = false;
        for(let interdit of rectsInterdits) {
            if (interdit && checkCollision(rect, interdit)) collision = true;
        }
        if(!collision) return rect;
    }
}