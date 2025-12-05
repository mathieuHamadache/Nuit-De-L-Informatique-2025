# 🏋️ DECATHLON COACH - Générateur de Séances Personnalisées

> Une application web interactive pour générer des séances d'entraînement sur mesure basées sur votre profil, vos objectifs et vos équipements disponibles.

---

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [Technologie](#-technologie)
- [Données](#-données)
- [Architecture](#-architecture)
- [Contribution](#-contribution)
- [Licence](#-licence)

---

## 🎯 À propos

**DECATHLON COACH** est une application web développée lors de la **Nuit de l'Info 2025** par l'équipe Décathlon. L'application utilise un formulaire interactif multi-étapes pour collecter les préférences de l'utilisateur et génère automatiquement une séance d'entraînement personnalisée sélectionnée parmi plus de **113 exercices**.

### Objectifs du projet
✅ Démocratiser l'accès au coaching sportif  
✅ Adapter les séances au profil et aux contraintes de chacun  
✅ Fournir des exercices visuels (GIF) pour une meilleure compréhension  
✅ Proposer des produits Décathlon adaptés aux besoins  

---

## ✨ Fonctionnalités

### 1. **Formulaire Interactif Multi-Étapes**
- **Étape 1** : Sélection du niveau (Débutant / Intermédiaire / Avancé)
- **Étape 2** : Choix de l'objectif (Perte de poids / Renforcement / Bien-être)
- **Étape 3** : Sélection des sports pratiqués (multi-choix)
- **Étape 4** : Localisation de l'entraînement (Maison / Extérieur / Salle)
- **Étape 5** : Équipement disponible (Aucun / Basique / Complet)
- **Étape 6** : Génération et affichage de la séance

### 2. **Génération Intelligente de Séances**
- Filtrage des exercices selon les critères :
  - 🎯 Niveau de difficulté
  - 💪 Objectif d'entraînement
  - ⚙️ Équipement disponible
  - 🏃 Sports pratiqués
- Structure en 3 phases :
  - 🔥 Échauffement
  - 💯 Corps de séance
  - 😌 Retour au calme

### 3. **Affichage Visuel**
- 🎬 GIF animés pour chaque exercice
- 📊 Nombre de séries et répétitions adaptées au niveau
- 📝 Instructions détaillées pour chaque mouvement
- 🏷️ Icônes de type d'exercice colorées

### 4. **Modale Interactive**
- Clic sur un exercice pour voir les détails complets
- Vue agrandie du GIF de l'exercice
- Type, difficulté, matériel et groupes musculaires
- Instructions étape par étape
- Suggestions de produits Décathlon adaptés

### 5. **Recommandations Produits**
- Analyse automatique du matériel nécessaire
- Suggestions de produits Décathlon pertinents
- Liens directs vers le catalogue produits

### 6. **UX/UI Décathlon**
- Barre de progression visuelle
- Bouton "Précédent" et "Accueil"
- Indicateur de défilement sur l'étape 3
- Animations fluides et transitions élégantes
- Responsive design (mobile-first)
- Typographie Décathlon (Roboto Condensed + Roboto)

---

## 🚀 Installation

### Prérequis
- Un navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Aucune dépendance externe requise (HTML/CSS/JavaScript vanilla)

### Étapes

1. **Cloner ou télécharger le projet**
```bash
git clone https://github.com/decathlon/nuit-info-2025-coach.git
cd nuit_info_2025_decathlon
```

2. **Ouvrir l'application**
   - Double-cliquez sur `welcome.html`
   - Ou servez via un serveur local :
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server
```

3. **Accéder l'application**
   - Ouvrez `http://localhost:8000/welcome.html` dans votre navigateur

---

## 📖 Utilisation

### Flux Utilisateur

1. **Page d'accueil** → Cliquez sur "COMMENCER" (ou démarrez directement)
2. **Étape 1 - Niveau** → Sélectionnez votre niveau d'expérience
3. **Étape 2 - Objectif** → Choisissez votre but (perte de poids, renforcement, bien-être)
4. **Étape 3 - Sports** → Cochez tous les sports que vous pratiquez
5. **Étape 4 - Localisation** → Indiquez où vous allez vous entraîner
6. **Étape 5 - Équipement** → Sélectionnez ce dont vous disposez
7. **Étape 6 - Séance** → Visualisez votre programme personnalisé

### Conseils d'Utilisation

- 💡 Cliquez sur une carte d'exercice pour voir les détails et instructions
- 📱 Vos sélections sont traitées en temps réel
- ⬅️ Utilisez le bouton "Précédent" pour modifier vos choix
- 🔄 Recommencez quand vous le souhaitez pour une nouvelle séance

---

## 📁 Structure du Projet

```
nuit_info_2025_decathlon/
├── welcome.html
├── index.html
├── style/
│   ├── style.css
│   └── ...
├── script/
│   ├── app.js
│   └── ...
├── src/
│   ├── logo.png
│   ├── gif/
│   │   ├── squat.gif
│   │   ├── pompes.gif
│   │   └── ...
│   ├── icon/
│   │   ├── icon_site.png
│   │   └── ...
│   └── img/
│       ├── produit1.avig
│       ├── produit2.avig
│       └── ...
└── README.md
```

- **`welcome.html`** : La page d'accueil de l'application
- **`index.html`** : La page principale de l'application
- **`css/`** : Dossier contenant les fichiers CSS
- **`js/`** : Dossier contenant les fichiers JavaScript
- **`images/`** : Dossier contenant les images, GIFs et logos
- **`README.md`** : Ce fichier README

---

## ⚙️ Technologie

- **HTML5** : Structure et sémantique
- **CSS3** : Styles et mise en page
- **JavaScript** : Interactivité et logique
- **Git** : Gestion de version

---

## 📊 Données

- Les données des exercices sont stockées dans des fichiers JSON
- Les images et GIFs sont optimisés pour le web
- Aucune donnée personnelle n'est collectée

---

## 🏗️ Architecture

L'application est structurée en plusieurs modules :

1. **Module de Collecte** : Gère le formulaire et les préférences utilisateur
2. **Module de Génération** : Crée la séance d'entraînement personnalisée
3. **Module d'Affichage** : Présente les exercices et la séance
4. **Module de Recommandation** : Suggère des produits Décathlon

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment vous pouvez aider :

- Signaler des problèmes ou des bugs
- Proposer des améliorations ou des fonctionnalités
- Soumettre des demandes de tirage (pull requests)

---

## 📜 Licence

Ce projet est sous licence MIT.