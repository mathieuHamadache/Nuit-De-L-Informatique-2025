export const assets = {
    grinch: new Image(),
    cadeau: new Image(),
    cadeau_doree: new Image(),
    corps: new Image(),
    maisons: [],
    logo: new Image(),
    musiqueMenu: new Audio("assets/musique/menu.mp3"),
    musiqueGame: new Audio("assets/musique/game.mp3")
};

// Initialisation
assets.musiqueMenu.loop = true;
assets.musiqueGame.loop = true;
assets.musiqueMenu.volume = 0.5;
assets.musiqueGame.volume = 0.4;

assets.grinch.src = "assets/Grinch.png";
assets.cadeau.src = "assets/Cadeau.png";
assets.cadeau_doree.src = "assets/Cadeau_doree.png";
assets.corps.src = "assets/Corps.png";
assets.logo.src = "assets/Logo.png";

for(let i=1; i<=5; i++) {
    let img = new Image();
    img.src = `assets/Objet_template/Maison${i}.png`;
    assets.maisons.push(img);
}

export function playMusic(track) {
    assets.musiqueMenu.pause();
    assets.musiqueMenu.currentTime = 0;
    assets.musiqueGame.pause();
    assets.musiqueGame.currentTime = 0;

    if (track === 'menu') {
        assets.musiqueMenu.play().catch(e => console.log("Attente interaction utilisateur"));
    } else if (track === 'game') {
        assets.musiqueGame.play().catch(e => console.log("Erreur audio game", e));
    }
}