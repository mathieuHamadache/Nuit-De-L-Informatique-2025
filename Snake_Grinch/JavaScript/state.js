export const STATE = {
    menu: true,
    gameOver: false,
    score: 0,
    highScore: parseInt(localStorage.getItem('grinch_highscore')) || 0,
    obstacles: [],
    snake: { x: 0, y: 0, dirX: 0, dirY: 0, nextDirX: 0, nextDirY: 0 },
    history: [],
    length: 0,
    cadeau: null,
    doree: { active: false, rect: null, timerStart: 0 },
    bgCanvas: null
};