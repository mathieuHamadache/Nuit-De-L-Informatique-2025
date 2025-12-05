// On attend que le DOM soit chargé pour éviter les erreurs "null"
document.addEventListener("DOMContentLoaded", () => {
    // Variables de gestion d'état
    let currentStep = 1
    const totalSteps = 6
    const progressBar = document.getElementById("progressBar")
    let isAnimating = false // Sécurité pour empêcher le double clic rapide
    const btnBack = document.getElementById("btnBack")
    let scrollIndicator = null // Déclarer ici, initialiser plus bas
    let validateBtnVisible = false // Nouvel état pour la visibilité du bouton

    // --- Gestion du bouton "Valider mes sports" ---
    const sportsInputs = document.querySelectorAll('input[name="sports"]')
    const validateBtn = document.querySelector(".btn-validate")

    if (validateBtn) {
        // Fonction qui active/désactive le bouton
        function updateValidateButton() {
            const count = document.querySelectorAll(
                'input[name="sports"]:checked'
            ).length

            validateBtn.disabled = count === 0
        }

        // On ajoute l'écouteur sur chaque checkbox
        sportsInputs.forEach((input) => {
            input.addEventListener("change", updateValidateButton)
        })

        // On lance la fonction une première fois pour désactiver le bouton au démarrage
        updateValidateButton()
    }
    // -------------------------------------------------------------

    // Initialisation du scroll indicator et du gestionnaire de scroll
    scrollIndicator = document.getElementById("scrollIndicator")
    const mainScrollContainer = document.documentElement // Utilise document.documentElement pour le scroll de la page entière

    // Nouvelle approche : observer la visibilité du bouton avec IntersectionObserver
    let observer = null
    function setupValidateBtnObserver() {
        if (!validateBtn) return
        if (observer) observer.disconnect()

        observer = new IntersectionObserver(
            (entries) => {
                validateBtnVisible = entries[0].isIntersecting
                updateScrollIndicator()
            },
            {
                root: null, // viewport
                threshold: 0, // dès qu'une partie du bouton est visible
            }
        )
        observer.observe(validateBtn)
    }
    setupValidateBtnObserver()

    // Fonction pour afficher ou cacher la flèche selon la visibilité du bouton et le scroll
    function updateScrollIndicator() {
        if (currentStep === 3 && scrollIndicator) {
            // La page est considérée en fin de défilement si le bas du contenu est très proche du bas du viewport
            const hasReachedEndOfContent =
                mainScrollContainer.scrollHeight -
                    mainScrollContainer.scrollTop <=
                mainScrollContainer.clientHeight + 5

            // La flèche est active si le bouton n'est PAS visible ET qu'on n'est PAS en bas
            if (!validateBtnVisible && !hasReachedEndOfContent) {
                scrollIndicator.classList.add("active")
            } else {
                scrollIndicator.classList.remove("active")
            }
        } else if (scrollIndicator) {
            scrollIndicator.classList.remove("active")
        }
    }

    // Sur chaque scroll, on met à jour l'indicateur
    mainScrollContainer.addEventListener("scroll", updateScrollIndicator)

    // Initialisation
    updateProgress()
    updateUI() // Important de l'appeler au début aussi

    // Fonction pour passer à l'étape suivante (rendue globale pour le HTML)
    window.nextStep = function () {
        // Validation étape 3 (Sports) - On garde ton code existant
        if (currentStep === 3) {
            const sportsCoques = document.querySelectorAll(
                'input[name="sports"]:checked'
            )
            if (sportsCoques.length === 0) {
                alert("Veuillez sélectionner au moins un sport pour continuer.")
                return
            }
        }

        if (currentStep < totalSteps && !isAnimating) {
            isAnimating = true

            setTimeout(() => {
                document
                    .querySelector(`.step[data-step="${currentStep}"]`)
                    .classList.remove("active")
                currentStep++
                document
                    .querySelector(`.step[data-step="${currentStep}"]`)
                    .classList.add("active")

                // --- AJOUT ICI : Réinitialiser l'étape finale si on y arrive ---
                if (currentStep === totalSteps) {
                    resetFinalStepUI()
                }
                // -------------------------------------------------------------

                updateUI()
                isAnimating = false
                if (currentStep === 3) setupValidateBtnObserver()
            }, 300)
        }
    }

    // Fonction pour revenir en arrière (rendue globale)
    // --- 1. MODIFIER LA FONCTION DE RETOUR (window.prevStep) ---
    window.prevStep = function () {
        // Cas spécial : Si on est à l'étape 1, on retourne à l'accueil
        if (currentStep === 1) {
            window.location.href = "welcome.html"
            return
        }

        // Sinon, comportement normal (étape précédente du formulaire)
        if (currentStep > 1 && !isAnimating) {
            document
                .querySelector(`.step[data-step="${currentStep}"]`)
                .classList.remove("active")
            currentStep--
            document
                .querySelector(`.step[data-step="${currentStep}"]`)
                .classList.add("active")
            updateUI()

            if (currentStep === 3) setupValidateBtnObserver()
        }
    }

    // --- 2. MODIFIER LA MISE À JOUR DE L'INTERFACE (updateUI) ---
    function updateUI() {
        // Barre de progression
        const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100
        progressBar.style.width = percentage + "%"

        // Bouton retour :
        // AVANT : Il était caché à l'étape 1.
        // MAINTENANT : Il est toujours visible.
        if (btnBack) {
            btnBack.style.visibility = "visible"

            // Optionnel : Changer le texte pour être plus précis sur l'étape 1
            // Tu peux supprimer ce bloc si tu veux garder juste "Précédent"
            const btnText = btnBack.lastChild // Le noeud texte après le SVG
            if (currentStep === 1) {
                // Sur l'étape 1, on peut suggérer "Accueil" ou garder "Précédent"
                if (btnText.nodeType === 3) btnText.textContent = " Accueil"
            } else {
                if (btnText.nodeType === 3) btnText.textContent = " Précédent"
            }
        }

        // Gérer l'indicateur de défilement pour l'étape 3
        updateScrollIndicator()
    }

    // Fonction de mise à jour initiale
    function updateProgress() {
        progressBar.style.width = "0%"
    }

    // Remplace ta fonction window.submitForm actuelle par celle-ci :
    // On stocke le catalogue produits pour la modale
    let globalProductsCatalog = null

    window.submitForm = function () {
        const form = document.getElementById("quizForm")
        const formData = new FormData(form)
        const profilData = {}

        formData.forEach((value, key) => {
            if (profilData.hasOwnProperty(key)) {
                if (!Array.isArray(profilData[key])) {
                    profilData[key] = [profilData[key]]
                }
                profilData[key].push(value)
            } else {
                profilData[key] = value
            }
        })

        const finalStepContent = document.querySelector(".final-step-content")
        const btn = finalStepContent.querySelector(".btn-decathlon")
        const loader = document.getElementById("loader")
        const title = finalStepContent.querySelector("h2")
        const subtitle = finalStepContent.querySelector(".subtitle")
        const productsSection = document.getElementById("products-section")

        finalStepContent.classList.add("is-loading")
        if (productsSection) productsSection.style.display = "none"

        btn.style.display = "none"
        title.innerText = "GÉNÉRATION EN COURS..."
        subtitle.style.display = "none"
        loader.style.display = "block"

        setTimeout(async () => {
            try {
                // 1. Charger les deux fichiers JSON en parallèle
                const [exoResponse, prodResponse] = await Promise.all([
                    fetch("exo.json"),
                    fetch("produits.json"),
                ])

                if (!exoResponse.ok || !prodResponse.ok)
                    throw new Error("Erreur chargement JSON")

                const allExos = await exoResponse.json()
                const allProducts = await prodResponse.json()
                globalProductsCatalog = allProducts // ✅ STOCKER GLOBALEMENT

                // 2. Générer la séance
                const workout = generateWorkout(profilData, allExos)

                // 3. Afficher la séance
                displayWorkout(workout, profilData)

                // 4. Générer et afficher les produits recommandés
                displayRecommendedProducts(workout, allProducts, profilData)
            } catch (error) {
                console.error("Erreur:", error)
                finalStepContent.classList.remove("is-loading")
                title.innerText = "Oops !"
                subtitle.innerText = "Une erreur est survenue."
                subtitle.style.display = "block"
                loader.style.display = "none"
            }
        }, 1500)
    }

    /**
     * Analyse la séance, trouve le matériel manquant et affiche les produits.
     */
    // function displayRecommendedProducts(workout, catalog) {
    //     const productsSection = document.getElementById("products-section")
    //     const grid = document.getElementById("products-grid")
    //     grid.innerHTML = "" // Vider

    //     // Correction : s'assurer que catalog est bien un tableau
    //     let catalogArray = catalog
    //     if (!Array.isArray(catalogArray)) {
    //         // Essaye de trouver la clé qui contient le tableau (ex: "products" ou "data")
    //         if (Array.isArray(catalog.products)) {
    //             catalogArray = catalog.products
    //         } else if (Array.isArray(catalog.data)) {
    //             catalogArray = catalog.data
    //         } else {
    //             // Si rien ne correspond, on ne fait rien
    //             return
    //         }
    //     }

    //     // 1. Extraire les équipements uniques nécessaires pour cette séance
    //     const neededEquipment = new Set()
    //     workout.forEach((exo) => {
    //         if (exo.equipment) {
    //             exo.equipment.forEach((eq) => {
    //                 // On normalise (minuscule) et on ignore "aucun", "mur", etc.
    //                 const cleanEq = eq.toLowerCase()
    //                 if (
    //                     ![
    //                         "aucun",
    //                         "mur",
    //                         "mur pour support",
    //                         "chaises",
    //                         "cadre de porte",
    //                     ].includes(cleanEq)
    //                 ) {
    //                     neededEquipment.add(cleanEq)
    //                 }
    //             })
    //         }
    //     })

    //     // S'il n'y a besoin de rien (ex: full poids du corps sans tapis), on n'affiche rien
    //     if (neededEquipment.size === 0) return

    //     // 2. Trouver les produits correspondants dans le catalogue JSON
    //     const suggestions = []

    //     // Dictionnaire de mapping : Mot clé exercice => Type de produit dans le JSON
    //     // Cela permet de relier "tapis" (exo) à "Tapis de Sol" (produit)
    //     const mapping = {
    //         tapis: "Tapis de Sol",
    //         elastique: "Bandes Élastiques",
    //         bande: "Bandes Élastiques",
    //         haltère: "Haltères",
    //         barre: "Barre et Poids",
    //         bancs: "Banc de Musculation",
    //         kettlebell: "Kettlebell",
    //         corde: "Cardio & Abdos", // Corde à sauter
    //         roues: "Cardio & Abdos", // Roue abdos
    //         disques: "Accessoires Spécifiques", // Sliders
    //     }

    //     neededEquipment.forEach((eq) => {
    //         // On cherche un mot clé correspondant
    //         let targetCategory = null
    //         for (const [keyword, category] of Object.entries(mapping)) {
    //             if (eq.includes(keyword)) {
    //                 targetCategory = category
    //                 break
    //             }
    //         }

    //         if (targetCategory) {
    //             // Correction ici : passer catalogArray au lieu de catalog
    //             const foundProducts = findProductsByCategory(
    //                 catalogArray,
    //                 targetCategory
    //             )
    //             // On en prend 1 ou 2 max pour ne pas spammer
    //             if (foundProducts.length > 0) {
    //                 // On évite les doublons globaux (si plusieurs exos demandent des haltères)
    //                 foundProducts
    //                     .slice(0, 1)
    //                     .forEach((p) => suggestions.push(p))
    //             }
    //         }
    //     })

    //     // 3. Afficher les cartes HTML
    //     if (suggestions.length > 0) {
    //         // Supprimer les doublons (au cas où)
    //         const uniqueSuggestions = [
    //             ...new Set(suggestions.map(JSON.stringify)),
    //         ].map(JSON.parse)

    //         uniqueSuggestions.forEach((product) => {
    //             const card = document.createElement("a")
    //             card.className = "product-card"
    //             card.href = product.url
    //             card.target = "_blank" // Ouvrir dans un nouvel onglet

    //             card.innerHTML = `
    //             <div class="product-top">
    //                 <div class="product-image-placeholder">
    //                    <svg viewBox="0 0 24 24"><path d="M22,12V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V12A1,1 0 0,1 1,11V8A2,2 0 0,1 3,6H21A2,2 0 0,1 23,8V11A1,1 0 0,1 22,12M4,8V11H20V8H4M4,13V20H20V13H4Z" /></svg>
    //                 </div>
    //                 <div class="product-title">${product.label}</div>
    //             </div>
    //             <button class="btn-shop">
    //                 <svg viewBox="0 0 24 24"><path d="M11,9H13V6H16V4H13V1H11V4H8V6H11M7,18A2,2 0 0,0 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20A2,2 0 0,0 7,18M17,18A2,2 0 0,0 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20A2,2 0 0,0 17,18M7.17,14.75L7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.59 17.3,11.97L21.16,4.96L19.42,4H19.41L18.31,6L15.55,11H8.53L8.4,10.73L6.16,6L5.21,4L4.27,2H1V4H3L6.6,11.59L5.25,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42C7.29,15 7.17,14.89 7.17,14.75Z" /></svg>
    //                 Voir
    //             </button>
    //         `
    //             grid.appendChild(card)
    //         })

    //         // Afficher la section
    //         productsSection.style.display = "block"
    //     }
    // }

    /**
 * Affiche 4 produits recommandés + 1 carte "Voir tout"
 */
function displayRecommendedProducts(workout, catalog, userProfile) {
    const productsSection = document.getElementById("products-section");
    const grid = document.getElementById("products-grid");
    
    // Nettoyer la grille et afficher la section
    grid.innerHTML = "";
    productsSection.style.display = "block";
    
    // --- 1. LOGIQUE DE SELECTION DES PRODUITS ---
    let suggestions = [];
    const neededEquipment = new Set();
    
    // Récupérer le matériel nécessaire pour la séance générée
    workout.forEach(exo => {
        if (exo.equipment) {
            exo.equipment.forEach(eq => {
                const cleanEq = eq.toLowerCase();
                if (!['aucun', 'mur', 'chaise', 'sol'].includes(cleanEq)) {
                    neededEquipment.add(cleanEq);
                }
            });
        }
    });

    // Chercher les produits correspondants dans le catalogue
    // On utilise une fonction helper (déjà présente ou à adapter)
    if (globalProductsCatalog && globalProductsCatalog.categories) {
        neededEquipment.forEach(eq => {
            // Logique simplifiée pour trouver la catégorie correspondante
            // On cherche dans les noms de produits ou tags
            const found = findProductsByKeyword(globalProductsCatalog.categories, eq);
            if(found) suggestions.push(...found);
        });

        // Si on n'a pas assez de produits (ex: séance poids du corps), on complète
        // avec des produits liés à l'objectif (ex: Tapis, Elastiques, Protéines)
        if (suggestions.length < 4) {
            const objectiveMap = {
                "Perte de poids": ["corde", "cardio", "tapis"],
                "Renforcement": ["halteres", "elastique", "proteine"],
                "Souplesse": ["yoga", "brique", "tapis"],
                "Bien-Être": ["yoga", "massage", "ball"]
            };
            
            const keywords = objectiveMap[userProfile.objectif] || ["fitness"];
            keywords.forEach(kw => {
                if (suggestions.length < 4) {
                    const found = findProductsByKeyword(globalProductsCatalog.categories, kw);
                    if(found) suggestions.push(...found);
                }
            });
        }
    }

    // Déduplication et limitation à 4 produits
    const uniqueIds = new Set();
    const finalProducts = [];
    for (const p of suggestions) {
        if (!uniqueIds.has(p.id)) {
            uniqueIds.add(p.id);
            finalProducts.push(p);
        }
        if (finalProducts.length >= 4) break;
    }

    // --- 2. GENERATION HTML DES 4 PRODUITS ---
    finalProducts.forEach(prod => {
        const priceDisplay = prod.prix ? `${prod.prix.valeur}€` : "Voir prix";
        const imgDisplay = prod.image_path ? prod.image_path : "src/icon/icon_site.png";
        
        const cardHTML = `
            <a href="${prod.url}" target="_blank" class="decathlon-product-card">
                <div class="d-card-img-container">
                    <img src="${imgDisplay}" alt="${prod.nom}" class="d-card-img" onerror="this.src='src/icon/icon_site.png'">
                </div>
                <div class="d-card-content">
                    <span class="d-card-price-tag">${priceDisplay}</span>
                    <span class="d-card-title">${prod.nom}</span>
                </div>
            </a>
        `;
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });

    // --- 3. GENERATION DE LA 5EME CARTE "VOIR TOUT" ---
    // Déterminer l'URL de catégorie la plus pertinente
    let categoryUrl = "https://www.decathlon.fr/tous-les-sports/fitness-cardio-training"; // Défaut
    
    // Mapping simple basé sur le sport ou l'objectif
    const urlMap = {
        "Yoga": "https://www.decathlon.fr/tous-les-sports/yoga",
        "Pilates": "https://www.decathlon.fr/tous-les-sports/pilates-gym-douce",
        "Musculation": "https://www.decathlon.fr/tous-les-sports/musculation-cross-training",
        "Crossfit": "https://www.decathlon.fr/tous-les-sports/musculation-cross-training/cross-training",
        "Running": "https://www.decathlon.fr/tous-les-sports/course-a-pied",
        "Cyclisme": "https://www.decathlon.fr/tous-les-sports/velo-cyclisme",
        "Perte de poids": "https://www.decathlon.fr/tous-les-sports/fitness-cardio-training",
        "Souplesse": "https://www.decathlon.fr/tous-les-sports/yoga"
    };

    // On regarde d'abord les sports sélectionnés
    if (userProfile.sports && userProfile.sports.length > 0) {
        // On prend le premier sport coché pour simplifier
        const mainSport = Array.isArray(userProfile.sports) ? userProfile.sports[0] : userProfile.sports;
        // On cherche une correspondance partielle
        for (const [key, url] of Object.entries(urlMap)) {
            if (mainSport.includes(key) || key.includes(mainSport)) {
                categoryUrl = url;
                break;
            }
        }
    } else {
        // Sinon on regarde l'objectif
        categoryUrl = urlMap[userProfile.objectif] || categoryUrl;
    }

    const seeMoreCardHTML = `
        <a href="${categoryUrl}" target="_blank" class="decathlon-product-card see-more-card">
            <div class="see-more-icon">
                <svg viewBox="0 0 24 24"><path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-8.9-5h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4l-3.87 7H8.53L4.27 2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l1.1-2z"/></svg>
            </div>
            <span>PARCOURIR LE RAYON</span>
        </a>
    `;
    grid.insertAdjacentHTML('beforeend', seeMoreCardHTML);

    // --- 4. AJOUT DU BOUTON RETOUR ACCUEIL (S'il n'existe pas déjà) ---
    const existingBtn = document.getElementById("btn-final-home");
    if (!existingBtn) {
        const btnHome = document.createElement("a");
        btnHome.id = "btn-final-home";
        btnHome.href = "welcome.html";
        btnHome.className = "btn-home-final";
        btnHome.innerText = "Accueil";
        productsSection.appendChild(btnHome);
    }
}

// Fonction utilitaire simple pour chercher dans le catalogue JSON
function findProductsByKeyword(categories, keyword) {
    let results = [];
    categories.forEach(cat => {
        if (cat.produits) {
            cat.produits.forEach(prod => {
                const searchStr = (prod.nom + " " + (prod.tags_objectif || []).join(" ")).toLowerCase();
                if (searchStr.includes(keyword.toLowerCase())) {
                    results.push(prod);
                }
            });
        }
    });
    return results;
}

    /**
     * Affiche les équipements recommandés pour la séance complète
     */
    function displayWorkoutEquipmentSection(workout, allExos) {
        const workoutContainer = document.getElementById("workout-container")

        // Collecter tous les équipements uniques de la séance
        const allEquipment = new Set()
        const equipmentToProducts = {}

        workout.forEach((exo) => {
            if (exo.equipment && Array.isArray(exo.equipment)) {
                exo.equipment.forEach((eq) => {
                    const cleanEq = eq.toLowerCase()
                    if (
                        ![
                            "aucun",
                            "mur",
                            "mur pour support",
                            "cadre de porte",
                            "sol",
                        ].includes(cleanEq)
                    ) {
                        allEquipment.add(cleanEq)
                        if (!equipmentToProducts[cleanEq]) {
                            equipmentToProducts[cleanEq] = []
                        }
                    }
                })
            }
        })

        if (allEquipment.size === 0) return

        // Mapping des équipements aux catégories de produits
        const equipmentCategoryMapping = {
            tapis: "Tapis de Sol",
            élastique: "Bandes Élastiques",
            bande: "Bandes Élastiques",
            haltère: "Haltères",
            "haltère (ou barre)": "Haltères",
            barre: "Barre et Poids",
            disques: "Barre et Poids",
            bancs: "Banc de Musculation",
            chaises: "Banc de Musculation",
            kettlebell: "Kettlebell",
            corde: "Cordes à Sauter",
            "roues d'abdos": "Cardio & Abdos",
            box: "Plyométrie & Agilité",
            marche: "Plyométrie & Agilité",
            cônes: "Plyométrie & Agilité",
            "bande de résistance": "Bandes Élastiques",
        }

        // Trouver les produits correspondants
        const suggestedProducts = new Map()
        const bonusProducts = []

        allEquipment.forEach((eq) => {
            const categoryKey = Object.keys(equipmentCategoryMapping).find(
                (key) => eq.includes(key)
            )
            if (categoryKey) {
                const categoryName = equipmentCategoryMapping[categoryKey]
                const foundProducts = findProductsByCategory(
                    globalProductsCatalog.categories,
                    categoryName
                )

                foundProducts.slice(0, 1).forEach((prod) => {
                    if (!suggestedProducts.has(prod.id)) {
                        suggestedProducts.set(prod.id, prod)
                    }
                })
            }
        })

        // Ajouter quelques produits bonus optionnels (pas strictement nécessaires mais utiles)
        const bonusCategories = [
            "Sangles de Yoga",
            "Briques de Yoga",
            "Swiss Balls (Gym Ball)",
            "Accessoires de Glisse",
        ]
        bonusCategories.forEach((cat) => {
            const bonusProds = findProductsByCategory(
                globalProductsCatalog.categories,
                cat
            )
            if (
                bonusProds.length > 0 &&
                !suggestedProducts.has(bonusProds[0].id)
            ) {
                bonusProducts.push(bonusProds[0])
            }
        })

        // Générer le HTML
        if (suggestedProducts.size > 0 || bonusProducts.length > 0) {
            let equipmentHTML = `<h3 class="workout-section-title">Équipements pour cette séance</h3>`
            equipmentHTML += `<p class="subtitle" style="margin-bottom: 20px;">Voici le matériel recommandé pour réaliser tous les exercices.</p>`
            equipmentHTML += `<div class="workout-equipment-grid">`

            // Produits recommandés (essentiels)
            suggestedProducts.forEach((prod) => {
                equipmentHTML += createEquipmentCard(prod, true)
            })

            // Produits bonus (optionnels)
            if (bonusProducts.length > 0) {
                equipmentHTML += `<div class="equipment-divider"></div>`
                equipmentHTML += `<div class="equipment-bonus-label">Bonus optionnel</div>`
                bonusProducts.forEach((prod) => {
                    equipmentHTML += createEquipmentCard(prod, false)
                })
            }

            equipmentHTML += `</div>`
            workoutContainer.insertAdjacentHTML("beforeend", equipmentHTML)
        }
    }

    /**
     * Crée une carte produit pour la section équipements
     */
    function createEquipmentCard(prod, isEssential) {
        return `
            <a href="${prod.url}" class="equipment-card ${
            isEssential ? "essential" : "bonus"
        }" target="_blank" rel="noopener">
                <div class="equipment-card-img">
                    ${
                        prod.image_path
                            ? `<img src="${prod.image_path}" alt="${prod.nom}">`
                            : `<svg viewBox="0 0 24 24" width="60" height="60"><circle cx="12" cy="12" r="10" fill="#e3e8ef"/></svg>`
                    }
                </div>
                <div class="equipment-card-info">
                    <p class="equipment-card-name">${prod.nom}</p>
                    <p class="equipment-card-price">${
                        prod.prix
                            ? prod.prix.valeur + " " + prod.prix.devise
                            : ""
                    }</p>
                    ${
                        !isEssential
                            ? '<span class="equipment-bonus-tag">Optionnel</span>'
                            : ""
                    }
                </div>
            </a>
        `
    }

    /**
     * Enveloppe pour findProductsByCategory si besoin
     */
    function findProductsByCategory(categoriesArray, categoryType) {
        let results = []
        if (!Array.isArray(categoriesArray)) return results

        categoriesArray.forEach((group) => {
            if (group.produits && Array.isArray(group.produits)) {
                group.produits.forEach((prod) => {
                    // Cherche si le produit correspond (par nom ou tags)
                    const prodName = (prod.nom || "").toLowerCase()
                    if (prodName.includes(categoryType.toLowerCase())) {
                        results.push(prod)
                    }
                })
            }
        })
        return results
    }

    /**
     * Filtre et sélectionne les exercices en fonction du profil utilisateur.
     * @param {object} profile - Les données du formulaire de l'utilisateur.
     * @param {Array} allExos - La liste de tous les exercices disponibles.
     * @returns {Array} Une sélection d'exercices structurée.
     */
    function generateWorkout(profile, allExos) {
        const difficultyMap = {
            Debutant: ["débutant"],
            Intermediaire: ["débutant", "intermédiaire"],
            Avancé: ["intermédiaire", "avancé"],
        }
        const allowedDifficulties = difficultyMap[profile.experience] || [
            "débutant",
        ]

        const equipmentMap = {
            Aucun: ["aucun", "tapis", "mur pour support", "cadre de porte"],
            Basique: [
                "aucun",
                "tapis",
                "mur pour support",
                "cadre de porte",
                "chaises",
                "bancs",
                "box",
                "marche",
                "haltère (ou barre)",
                "bande de résistance (optionnel)",
                "cônes (optionnel)",
                "roues d'abdos",
            ],
            Complet: null,
        }
        const allowedEquipment = equipmentMap[profile.materiel]

        const objectiveMap = {
            "Perte de poids": ["cardio", "explosivité"],
            Renforcement: ["renforcement"],
            Souplesse: ["étirement", "mobilité", "souplesse", "relaxation"],
        }
        const allowedMainTypes = objectiveMap[profile.objectif] || [
            "renforcement",
        ]

        const userSports = Array.isArray(profile.sports)
            ? profile.sports
            : profile.sports
                ? [profile.sports]
                : []

        // 1. Filtrer les exercices éligibles par difficulté et matériel
        const eligibleExos = allExos.filter((exo) => {
            const difficultyMatch = allowedDifficulties.includes(exo.difficulty)
            const equipmentMatch =
                profile.materiel === "Complet" ||
                (exo.equipment &&
                    exo.equipment.every((eq) => allowedEquipment.includes(eq)))
            return difficultyMatch && equipmentMatch
        })

        // 2. Créer des listes pour chaque phase de l'entraînement
        const warmupPool = eligibleExos.filter((exo) =>
            exo.type.includes("échauffement")
        )

        const mainPool = eligibleExos.filter((exo) => {
            const isMainType = allowedMainTypes.some((type) =>
                exo.type.includes(type)
            )
            if (!isMainType) return false

            const isWarmup = exo.type.includes("échauffement")
            if (isWarmup) return false

            // Pour les objectifs autres que "Souplesse", les étirements sont pour le retour au calme
            if (profile.objectif !== "Souplesse") {
                const isCooldown =
                    exo.type.includes("étirement") || exo.type.includes("repos")
                if (isCooldown) return false
            }

            return true
        })

        const cooldownPool = eligibleExos.filter(
            (exo) =>
                (exo.type.includes("étirement") ||
                    exo.type.includes("repos")) &&
                !exo.type.includes("échauffement")
        )

        const sportValueMap = {
            Crossfit: ["crossfit", "plyométrie", "explosivité", "calisthenics"],
            Cyclisme: ["cyclisme"],
            Musculation: ["musculation", "force", "calisthenics"],
            SportsAquatiques: ["sports_aquatique"],
            SportsRelaxation: [
                "yoga",
                "étirement",
                "relaxation",
                "récupération",
                "souplesse",
                "pilates",
            ],
            Randonnees: ["randonnee"],
            Running: ["course à pied"],
            SportsCollectifs: ["sport", "agilité"],
            SportsRaquettes: ["sports de raquette"],
        }

        // 3. Fonction pour sélectionner les meilleurs exercices d'une liste
        const selectExos = (pool, count) => {
            if (!pool || pool.length === 0) return []

            const scored = pool
                .map((exo) => {
                    let score = 0
                    if (userSports.length > 0) {
                        userSports.forEach((sport) => {
                            const jsonSports = sportValueMap[sport] || []
                            if (
                                jsonSports.some((jsonSport) =>
                                    exo.sport_category.includes(jsonSport)
                                )
                            ) {
                                score++
                            }
                        })
                    }
                    return { ...exo, score }
                })
                .sort((a, b) => b.score - a.score)

            // On mélange les meilleurs candidats pour la variété
            let candidates = scored.slice(0, 15)
            for (let i = candidates.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
            }

            return candidates.slice(0, count)
        }

        // 4. Composer la séance
        let mainExosCount = 3 // Par défaut pour Intermédiaire
        if (profile.experience === "Debutant") {
            mainExosCount = 2
        } else if (profile.experience === "Avancé") {
            mainExosCount = 5
        }

        const warmupExos = selectExos(warmupPool, 1)
        const mainExos = selectExos(mainPool, mainExosCount)
        const cooldownExos = selectExos(cooldownPool, 1)

        return [...warmupExos, ...mainExos, ...cooldownExos].filter(Boolean) // Supprime les éléments null/undefined si une pool est vide
    }

    /**
     * Affiche la séance générée dans le DOM.
     * @param {Array} workout - La liste des exercices à afficher.
     * @param {object} profile - Le profil de l'utilisateur pour adapter les répétitions.
     */
    /**
     * Affiche la séance générée dans le DOM.
     * @param {Array} workout - La liste des exercices à afficher.
     * @param {object} profile - Le profil de l'utilisateur pour adapter les répétitions.
     */
    function displayWorkout(workout, profile) {
        const finalStepContent = document.querySelector(".final-step-content")
        const title = finalStepContent.querySelector("h2")
        const subtitle = finalStepContent.querySelector(".subtitle")
        const loader = document.getElementById("loader")
        const workoutContainer = document.getElementById("workout-container")

        finalStepContent.classList.remove("is-loading") // On retire la classe
        loader.style.display = "none"

        if (!workout || workout.length === 0) {
            title.innerText = "Désolé !"
            subtitle.innerText =
                "Aucun exercice ne correspond parfaitement à vos critères. Essayez une autre sélection."
            subtitle.style.display = "block"
            return
        }

        const repsMap = {
            Debutant: { sets: "3", reps: "10 Répétitions", time: "30 sec" },
            Intermediaire: {
                sets: "3",
                reps: "15 Répétitions",
                time: "45 sec",
            },
            Avancé: { sets: "4", reps: "20 Répétitions", time: "60 sec" },
        }
        const levelConfig = repsMap[profile.experience] || repsMap["Debutant"]

        // Mappage des types d'exercices
        const typeIconMap = {
            renforcement: "src/icon/muscle_V.png",
            cardio: "src/icon/coeurs_V.png",
            explosivité: "src/icon/fonctionnement_V.png",
            étirement: "src/icon/yoga_V.png",
            mobilité: "src/icon/carriere_V.png",
            relaxation: "src/icon/lotus_V.png",
            repos: "src/icon/lotus_V.png",
            échauffement: "src/icon/debut_V.png",
            // Types composites
            cardio_renforcement: "src/icon/fonctionnement_V.png",
            renforcement_équilibre: "src/icon/personnes_V.png",
            mobilité_étirement: "src/icon/yoga_V.png",
            renforcement_étirement: "src/icon/muscle_V.png",
            cardio_explosivité: "src/icon/fonctionnement_V.png",
            mobilité_renforcement: "src/icon/personnes_V.png",
            échauffement_mobilité: "src/icon/carriere_V.png",
            cardio_échauffement: "src/icon/coeurs_V.png",
            échauffement_dynamique: "src/icon/debut_V.png",
            échauffement_étirement: "src/icon/yoga_V.png",
        }

        let warmupHtml = ""
        let mainHtml = ""
        let cooldownHtml = ""

        workout.forEach((exo) => {
            const isTimeBased =
                exo.type.includes("étirement") ||
                exo.type.includes("repos") ||
                exo.type.includes("cardio") ||
                exo.title.toLowerCase().includes("planche") ||
                exo.title.toLowerCase().includes("chaise")
            const effort = isTimeBased ? levelConfig.time : levelConfig.reps

            let iconSrc = ""
            const exoTypesComponents = exo.type.split("_")
            const searchOrder = [
                exo.type,
                ...exoTypesComponents.filter((t) => t !== exo.type),
            ].filter((value, index, self) => self.indexOf(value) === index)

            for (const t of searchOrder) {
                if (typeIconMap[t]) {
                    iconSrc = typeIconMap[t]
                    break
                }
            }
            if (!iconSrc) {
                iconSrc = "src/icon/kettlebell_V.png"
            }

            const cardHtml = `
                <div class="exo-card" tabindex="0" role="button" aria-label="Voir détails de l'exercice" data-exo-id="${exo.id}">
                    <img src="src/gif/${exo.gif}" alt="${exo.title}" class="exo-gif" loading="lazy">
                    <div class="exo-details">
                        <h3>${exo.title}</h3>
                        <div class="exo-meta">
                             <img src="${iconSrc}" class="exo-type-icon" alt="Type d'exercice">
                             <p class="exo-reps">${levelConfig.sets} Séries de ${effort}</p>
                        </div>
                        <p class="exo-desc">${exo.description}</p>
                    </div>
                </div>
            `

            if (exo.type.includes("échauffement")) {
                warmupHtml += cardHtml
            } else if (
                exo.type.includes("étirement") ||
                exo.type.includes("repos")
            ) {
                cooldownHtml += cardHtml
            } else {
                mainHtml += cardHtml
            }
        })

        let finalHtml = ""
        if (warmupHtml) {
            finalHtml += `<h3 class="workout-section-title">Échauffement</h3>${warmupHtml}`
        }
        if (mainHtml) {
            finalHtml += `<h3 class="workout-section-title">Corps de séance</h3>${mainHtml}`
        }
        if (cooldownHtml) {
            finalHtml += `<h3 class="workout-section-title">Retour au calme</h3>${cooldownHtml}`
        }

        title.innerText = "Votre séance sur mesure"
        subtitle.innerText = `Voici ${workout.length} exercices conçus pour vous. Bon courage !`
        subtitle.style.display = "block"
        workoutContainer.innerHTML = finalHtml

        // --- GESTION DU BOUTON ACCUEIL ---
        // On affiche le bouton uniquement maintenant que la séance est là
        const btnHome = document.getElementById("btnHome")
        if (btnHome) {
            btnHome.style.display = "inline-flex"
        }
        // ---------------------------------

        // Ajout de l'écouteur sur chaque carte exercice pour ouvrir la modale
        setTimeout(() => {
            const allExos = workout
            document.querySelectorAll(".exo-card").forEach((card, idx) => {
                card.onclick = () => openExerciseModal(allExos[idx])
                card.onkeydown = (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        openExerciseModal(allExos[idx])
                    }
                }
            })
        }, 0)
    }

    // Ajout de la modale exercice
    function createExerciseModal() {
        if (document.getElementById("exercise-modal")) return
        const modal = document.createElement("div")
        modal.id = "exercise-modal"
        modal.className = "exercise-modal"
        modal.innerHTML = `
            <div class="exercise-modal-backdrop"></div>
            <div class="exercise-modal-content">
                <button class="exercise-modal-close" aria-label="Fermer">&times;</button>
                <div class="exercise-modal-body"></div>
            </div>
        `
        document.body.appendChild(modal)

        // Fermer la modale sur clic croix ou backdrop
        modal.querySelector(".exercise-modal-close").onclick =
            closeExerciseModal
        modal.querySelector(".exercise-modal-backdrop").onclick =
            closeExerciseModal
    }

    // Utilitaire pour mettre la première lettre de chaque mot en majuscule
    function capitalizeWords(str) {
        if (!str) return ""
        return str
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ")
    }
    function capitalizeArray(arr) {
        if (!arr) return ""
        return arr.map(capitalizeWords).join(", ")
    }

    function openExerciseModal(exo) {
        createExerciseModal()
        const modal = document.getElementById("exercise-modal")
        const body = modal.querySelector(".exercise-modal-body")
        
        // Utiliser la variable globale
        const products = exo.recommended_products || getProductsForExercise(exo, globalProductsCatalog || {})

        // Section produits HTML
        let productsHtml = ""
        if (products && products.length > 0) {
            productsHtml = `
                <div class="exercise-modal-products">
                    <div class="exercise-modal-products-title">Matériel utile pour cet exercice</div>
                    <div class="exercise-modal-products-list">
                        ${products
                            .map(
                                (prod) => `
                            <a href="${prod.url}" class="exercise-modal-product-card" target="_blank" rel="noopener noreferrer">
                                <div class="exercise-modal-product-img">
                                    ${
                                        prod.image_path
                                            ? `<img src="${prod.image_path}" alt="${prod.nom}" onerror="this.src='src/icon/icon_site.png'">`
                                            : `<svg viewBox="0 0 24 24" width="48" height="48"><path d="M22,12V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V12A1,1 0 0,1 1,11V8A2,2 0 0,1 3,6H21A2,2 0 0,1 23,8V11A1,1 0 0,1 22,12M4,8V11H20V8H4M4,13V20H20V13H4Z" fill="#3643ba"/></svg>`
                                    }
                                </div>
                                <div class="exercise-modal-product-info">
                                    <div class="exercise-modal-product-name">${prod.nom}</div>
                                    <div class="exercise-modal-product-price">${
                                        prod.prix ? prod.prix.valeur.toFixed(2) + " " + prod.prix.devise : "Consulter"
                                    }</div>
                                </div>
                            </a>
                        `
                            )
                            .join("")}
                    </div>
                </div>
            `
        }

        // ✅ NOUVELLE SECTION : BULLES D'INFORMATION
        let infoBubblesHtml = `
            <div class="exercise-modal-info-section">
                <div class="exercise-modal-info-bubbles">
                    <div class="exercise-modal-info-bubble">
                        <div class="exercise-modal-bubble-label">Type</div>
                        <div class="exercise-modal-bubble-value">${capitalizeWords(exo.type.replace(/_/g, " "))}</div>
                    </div>
                    
                    <div class="exercise-modal-info-bubble">
                        <div class="exercise-modal-bubble-label">Difficulté</div>
                        <div class="exercise-modal-bubble-value">${capitalizeWords(exo.difficulty)}</div>
                    </div>
                    
                    <div class="exercise-modal-info-bubble">
                        <div class="exercise-modal-bubble-label">Matériel</div>
                        <div class="exercise-modal-bubble-value">${capitalizeArray(exo.equipment) || "Aucun"}</div>
                    </div>
                </div>
            </div>
        `

        body.innerHTML = `
            <h2>${exo.title}</h2>
            <div class="exercise-modal-main-row">
                <img src="src/gif/${exo.gif}" alt="${exo.title}" class="exercise-modal-gif" />
                <div class="exercise-modal-meta-col">
                    ${infoBubblesHtml}
                </div>
            </div>
            
            <p class="exercise-modal-desc">${exo.description || ""}</p>
            
            <div class="exercise-modal-instructions">
                <b>Instructions :</b>
                <ol>
                    ${(exo.instructions || []).map((step) => `<li>${step}</li>`).join("")}
                </ol>
            </div>
            
            ${productsHtml}
        `
        modal.classList.add("active")
        document.body.style.overflow = "hidden"

        // Ajustement dynamique : si le contenu dépasse la fenêtre, réduit la taille du gif
        setTimeout(() => {
            const content = modal.querySelector(".exercise-modal-content")
            const gif = modal.querySelector(".exercise-modal-gif")
            if (content && gif) {
                const winH = window.innerHeight
                const contentH = content.offsetHeight
                if (contentH > winH - 40) {
                    gif.style.width = "120px"
                    gif.style.height = "120px"
                }
            }
        }, 0)
    }

    function closeExerciseModal() {
        const modal = document.getElementById("exercise-modal")
        if (modal) {
            modal.classList.remove("active")
            setTimeout(() => {
                modal.remove()
            }, 200)
        }
        document.body.style.overflow = ""
    }

    function showStep(stepIndex) {
        // ... ton code existant qui affiche l'étape ...

        // GESTION DU BOUTON PRÉCÉDENT
        const btnBack = document.getElementById("btnBack")

        if (stepIndex === 1) {
            // Si on est à l'étape 1, on cache le bouton (ou on le rend invisible)
            btnBack.style.visibility = "hidden"
            // ou btnBack.style.display = 'none';
        } else {
            // Sinon, on l'affiche
            btnBack.style.visibility = "visible"
            // ou btnBack.style.display = 'flex';
        }
    }
    // Fonction pour remettre l'étape 6 à zéro (réafficher le bouton, vider les résultats)
    // Fonction pour remettre l'étape 6 à zéro (réafficher le bouton générer, vider les résultats, cacher le bouton accueil)
    function resetFinalStepUI() {
        const btn = document.getElementById("btnGenerate")
        const title = document.getElementById("finalTitle")
        const subtitle = document.getElementById("finalSubtitle")
        const loader = document.getElementById("loader")
        const workoutContainer = document.getElementById("workout-container")
        const productsSection = document.getElementById("products-section")
        const btnHome = document.getElementById("btnHome") // On récupère le bouton accueil

        // Sélecteurs de secours si IDs manquants
        const finalContent = document.querySelector(".final-step-content")
        const safeBtn = btn || finalContent.querySelector(".btn-decathlon")
        const safeTitle = title || finalContent.querySelector("h2")
        const safeSubtitle = subtitle || finalContent.querySelector(".subtitle")

        // Réinitialisation de l'état "Prêt à générer"
        if (safeBtn) safeBtn.style.display = "block"
        if (loader) loader.style.display = "none"
        
        if (safeTitle) safeTitle.innerText = "Profil Terminé !"
        if (safeSubtitle) {
            safeSubtitle.innerText = "Nous avons toutes les infos pour créer votre séance sur mesure."
            safeSubtitle.style.display = "block"
        }
        
        // On vide les anciens résultats
        if (workoutContainer) workoutContainer.innerHTML = ""
        if (productsSection) productsSection.style.display = "none"
        
        // --- CACHER LE BOUTON ACCUEIL ---
        if (btnHome) {
            btnHome.style.display = "none"
        }
        // --------------------------------

        // On retire la classe de chargement
        if (finalContent) finalContent.classList.remove("is-loading")
    }

    /**
     * Utilitaire pour trouver les produits pertinents pour un exercice
     */
    function getProductsForExercise(exo, catalog) {
        // ✅ VÉRIFIER SI CATALOG EST VIDE
        if (!catalog || !catalog.categories || catalog.categories.length === 0) {
            console.warn("Catalogue produits non disponible")
            return []
        }

        const keywords = []
        
        // Extraire les mots-clés du matériel
        if (Array.isArray(exo.equipment)) {
            exo.equipment.forEach((eq) => {
                keywords.push(eq.toLowerCase().trim())
            })
        }
        
        // Extraire les mots-clés du type d'exercice
        if (exo.type) {
            const typeKeywords = exo.type.toLowerCase().split("_")
            keywords.push(...typeKeywords)
        }
        
        // Extraire les mots-clés des muscles ciblés
        if (Array.isArray(exo.target_muscles)) {
            exo.target_muscles.forEach((muscle) => {
                keywords.push(muscle.toLowerCase().trim())
            })
        }

        if (keywords.length === 0) {
            return []
        }

        // Dictionnaire de mapping pour améliorer la recherche
        const mappingKeywords = {
            "tapis": ["tapis", "sol", "yoga", "pilates"],
            "aucun": ["bodyweight", "poids du corps", "calisthenics"],
            "élastique": ["elastique", "bande", "resistance", "training"],
            "haltère": ["haltere", "dumbbell", "poids"],
            "barre": ["barre", "barbell", "disque"],
            "kettlebell": ["kettlebell"],
            "banc": ["banc", "bench", "musculation"],
            "box": ["box", "plyo", "saut"],
            "abdominaux": ["abdominaux", "roulette", "ab wheel", "ceinture"],
            "cardio": ["corde", "jump rope", "cardiaque"],
            "yoga": ["yoga", "bien-etre", "relaxation", "etirement"],
            "mobilité": ["sangle", "support", "yoga"],
            "gainage": ["gainage", "planche", "swiss", "core"]
        }

        const foundProductIds = new Set()
        const products = []

        // Parcourir les catégories et chercher les produits correspondants
        catalog.categories.forEach((categorie) => {
            if (!categorie.produits || categorie.produits.length === 0) return

            categorie.produits.forEach((product) => {
                if (foundProductIds.has(product.id)) return

                const productName = (product.nom || "").toLowerCase()
                const productTags = product.tags_objectif ? product.tags_objectif.map(t => t.toLowerCase()) : []

                let isMatch = false
                
                // Recherche directe
                keywords.forEach((keyword) => {
                    if (productName.includes(keyword) || 
                        productTags.some(tag => tag.includes(keyword) || keyword.includes(tag))) {
                        isMatch = true
                    }
                })

                // Recherche par mapping
                if (!isMatch) {
                    keywords.forEach((keyword) => {
                        if (mappingKeywords[keyword]) {
                            mappingKeywords[keyword].forEach((mappedKeyword) => {
                                if (productName.includes(mappedKeyword) || 
                                    productTags.some(tag => mappedKeyword.includes(tag) || tag.includes(mappedKeyword))) {
                                    isMatch = true
                                }
                            })
                        }
                    })
                }

                if (isMatch) {
                    foundProductIds.add(product.id)
                    products.push(product)
                }
            })
        })

        return products.slice(0, 3)
    }
})
