# MUSEA — Musée Virtuel 3D

MUSEA est une galerie virtuelle 3D interactive développée avec Three.js. Elle permet de découvrir une petite collection d'objets numériques (modèles `.glb`) et de composer sa propre exposition, pièce par pièce, en les plaçant sur des socles dans une salle immersive.

🔗 **Démo en ligne :** https://musea-2026.netlify.app

## Aperçu

> Explorez. Sélectionnez. Exposez.

Le visiteur navigue à la souris dans une salle de musée en 3D, choisit un objet dans le panneau "Collection", puis clique sur un socle libre pour l'exposer. Un clic sur un objet déjà posé ouvre une fiche d'information (catégorie, description) avec la possibilité de zoomer dessus ou de le retirer.

## Fonctionnalités

- 🖱️ Navigation libre à la souris (rotation, zoom) via `OrbitControls`
- 🏛️ Salle 3D avec sol, murs, plafond et éclairage type galerie d'art
- 📦 Chargement de modèles `.glb` via `GLTFLoader`, mis à l'échelle automatiquement
- 🗂️ Panneau "Collection" pour choisir l'objet à exposer
- 📍 Placement sur des socles dédiés (3 emplacements)
- 📄 Fiche d'information par objet, avec vue rapprochée animée
- ♻️ Réinitialisation complète de l'exposition en un clic
- 📱 Rendu responsive (redimensionnement de la fenêtre)

## Technologies utilisées

- [Three.js](https://threejs.org/)  — moteur de rendu 3D WebGL
- JavaScript , HTML5, CSS3
- Modèles 3D au format `.glb` 
- Hébergement : Netlify (https://www.netlify.com/)

## Structure du projet

```
├── index.html      # structure de la page + import map Three.js
├── style.css        # habillage de l'interface (thème "musée contemporain")
├── main.js          # logique 3D : scène, caméra, chargement des objets, interactions
└── models/          # fichiers .glb des objets exposés
```


## Auteur

[Fernande2006]
