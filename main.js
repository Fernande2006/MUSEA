
// Une scène Three.js a TOUJOURS besoin de 3 choses minimum :
//   1. Une SCÈNE      -> le "monde" où on place les objets
//   2. Une CAMÉRA      -> le point de vue du visiteur
//   3. Un RENDERER    -> celui qui dessine (rend) la scène dans le <canvas>
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ---- 1. LA SCÈNE ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe4e4e0); // gris très clair, ambiance galerie lumineuse
scene.fog = new THREE.Fog(0xe4e4e0, 18, 40);   // brouillard quasi imperceptible, juste pour adoucir le lointain

// ---- 2. LA CAMÉRA ----
// PerspectiveCamera(angle de vue, ratio largeur/hauteur, distance min visible, distance max visible)
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 3, 7); // (x, y, z) -> un peu en hauteur, reculée

// ---- 3. LE RENDERER ----
const canvas = document.getElementById('scene-3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // netteté sur écrans Retina, sans exagérer (perf)
renderer.shadowMap.enabled = true; // active les ombres portées

// ============================================================
// ÉCRAN D'INTRO
// ============================================================
const introScreen = document.getElementById('intro-screen');
const introEnter = document.getElementById('intro-enter');

introEnter.addEventListener('click', () => {
  introScreen.classList.add('hidden');
  // On attend la fin du fondu (0.8s défini en CSS) avant de le retirer du flux
  setTimeout(() => { introScreen.style.display = 'none'; }, 800);
});

// ============================================================
// LES CONTRÔLES DE CAMÉRA (souris)
// ============================================================
// OrbitControls permet à l'utilisateur de tourner autour de la scène
// avec la souris (clic gauche = tourner, molette = zoom, clic droit = déplacer)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;      // mouvement "fluide" avec inertie
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.1; // empêche de passer sous le sol
controls.minDistance = 3;
controls.maxDistance = 7.8; // reste à l'intérieur des murs (rayon 8.2)
controls.target.set(0, 1, 0); // le point autour duquel la caméra tourne

// ============================================================
// LA LUMIÈRE
// ============================================================
// Sans lumière, les objets 3D apparaissent noirs (sauf matériaux "basic").
// On combine plusieurs types de lumière pour un effet "galerie d'art" :

// Lumière ambiante forte et neutre : c'est elle qui donne l'effet "galerie lumineuse"
// (à l'inverse de la version sombre, ici l'ambiance porte la majorité de la lumière,
// les spots ne font qu'accentuer légèrement)
const ambient = new THREE.AmbientLight(0xffffff, 0.85);
scene.add(ambient);

// Lumière directionnelle douce, façon "lumière de jour filtrée" (verrière/plafond lumineux)
const jour = new THREE.DirectionalLight(0xffffff, 0.6);
jour.position.set(3, 10, 4);
jour.castShadow = true;
jour.shadow.mapSize.set(1024, 1024);
scene.add(jour);

// Spot doré au-dessus, gardé mais très atténué : juste un accent chaud sur le socle central
const spot = new THREE.SpotLight(0xfff2d9, 22, 20, Math.PI / 6, 0.5, 1.5);
spot.position.set(0, 8, 2);
spot.castShadow = true;
spot.shadow.mapSize.set(1024, 1024);
scene.add(spot);
scene.add(spot.target); // le spot pointe vers spot.target.position (par défaut : 0,0,0)

// ============================================================
// LE SOL DU MUSÉE
// ============================================================
const floorGeometry = new THREE.CircleGeometry(8, 64); // cercle plutôt qu'un carré, plus "galerie"
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0xcfd0cc, // gris clair poli, façon sol de galerie
  roughness: 0.35,
  metalness: 0.15,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // on couche le cercle à plat (il est vertical par défaut)
floor.receiveShadow = true;      // le sol peut recevoir des ombres
scene.add(floor);

// Petit cercle doré fin pour marquer le bord du sol (touche esthétique liée à --accent)
const ringGeometry = new THREE.RingGeometry(7.9, 8, 64);
const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xc9a24a, side: THREE.DoubleSide });
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = -Math.PI / 2;
ring.position.y = 0.01; // légèrement au-dessus du sol pour éviter le "z-fighting" (scintillement)
scene.add(ring);

// ============================================================
// LES MURS DE LA SALLE
// ============================================================
// Un cylindre géant, ouvert en haut et en bas, qu'on regarde DE L'INTÉRIEUR.
// THREE.BackSide = on affiche la face intérieure du cylindre (sinon invisible
// depuis l'intérieur, car par défaut Three.js n'affiche que les faces extérieures).
const muRayon = 8.2; // légèrement plus grand que le sol (rayon 8)
const muHauteur = 6.5;
const wallGeometry = new THREE.CylinderGeometry(muRayon, muRayon, muHauteur, 64, 1, true);
const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0x1a1c22, // blanc cassé, façon mur de galerie
  roughness: 0.85,
  metalness: 0,
  side: THREE.BackSide,
});
const murs = new THREE.Mesh(wallGeometry, wallMaterial);
murs.position.y = muHauteur / 2; // le cylindre est centré sur son axe, on le remonte pour qu'il parte du sol
murs.receiveShadow = true;
scene.add(murs);

// Un plafond simple (disque) pour fermer la salle — clair aussi, façon verrière lumineuse
const plafondGeometry = new THREE.CircleGeometry(muRayon, 64);
const plafondMaterial = new THREE.MeshStandardMaterial({ color: 0xf7f6f2, roughness: 0.9, side: THREE.BackSide });
const plafond = new THREE.Mesh(plafondGeometry, plafondMaterial);
plafond.rotation.x = Math.PI / 2;
plafond.position.y = muHauteur;
scene.add(plafond);

// Bandeau doré discret à mi-hauteur des murs, pour rythmer l'espace (esthétique galerie)
const bandeauGeometry = new THREE.CylinderGeometry(muRayon - 0.02, muRayon - 0.02, 0.03, 64, 1, true);
const bandeauMaterial = new THREE.MeshBasicMaterial({ color: 0xc9a24a, side: THREE.BackSide, transparent: true, opacity: 0.6 });
const bandeau = new THREE.Mesh(bandeauGeometry, bandeauMaterial);
bandeau.position.y = 2.6;
scene.add(bandeau);

// ============================================================
// QUELQUES LUMIÈRES D'APPOINT (fill lights douces, pour éviter les zones grises)
// ============================================================
const spotMural1 = new THREE.SpotLight(0xffffff, 14, 15, Math.PI / 5, 0.6, 1.2);
spotMural1.position.set(-6, 5, -4);
spotMural1.target.position.set(-6, 0, -6);
scene.add(spotMural1, spotMural1.target);

const spotMural2 = new THREE.SpotLight(0xffffff, 14, 15, Math.PI / 5, 0.6, 1.2);
spotMural2.position.set(6, 5, -4);
spotMural2.target.position.set(6, 0, -6);
scene.add(spotMural2, spotMural2.target);

// ============================================================
// ============================================================
// SOCLES (chacun peut recevoir un objet — on clique dessus pour poser)
// ============================================================
// Gardés dans un gris foncé : par contraste avec le sol/murs clairs, ils
// ressortent bien et guident l'œil (comme les socles gris de ta référence).
const socleGeometry = new THREE.CylinderGeometry(0.55, 0.6, 0.9, 32);
const socleMaterial = new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.45, metalness: 0.25 });
const socleHauteur = 0.9;

const positionsSocles = [
  [0, -3],   // socle du fond, centré
  [-3.2, 1], // socle gauche
  [3.2, 1],  // socle droit
];

// On garde une référence à chaque socle + s'il est déjà occupé
const socles = positionsSocles.map(([x, z]) => {
  const socle = new THREE.Mesh(socleGeometry, socleMaterial);
  socle.position.set(x, socleHauteur / 2, z);
  socle.castShadow = true;
  socle.receiveShadow = true;
  scene.add(socle);
  return { mesh: socle, occupe: false };
});

// ============================================================
// ÉTAPE 2 : LE CATALOGUE D'OBJETS À EXPOSER
// ============================================================
// Un tableau JS qui décrit chaque objet disponible.
// Pour l'instant on n'en a qu'un, mais c'est déjà structuré pour
// en accueillir plusieurs à l'étape 3 (il suffira d'ajouter des lignes ici).
const catalogue = [
  {
    id: 'dodo',
    nom: 'Le Dodo',
    fichier: 'models/dodo_model.glb', // ⚠️ ajuste ce nom si ton fichier s'appelle autrement
    categorie: 'Histoire naturelle',
    annee: 'Espèce éteinte (XVIIe s.)',
    description: "Reconstitution numérique du dodo (Raphus cucullatus), oiseau originaire de l'île Maurice, aujourd'hui éteint. Il est devenu le symbole de la disparition des espèces causée par l'activité humaine et de la fragilité des écosystèmes insulaires.",
  },
  {
    id: 'lion_skull',
    nom: 'Crâne de lion',
    fichier: 'models/objet2.glb', // ⚠️ ajuste ce nom si ton fichier s'appelle autrement
    categorie: 'Ostéologie',
    annee: 'Spécimen d\'étude',
    description: "Étude ostéologique d'un crâne de lion (Panthera leo). La structure crânienne — mâchoires puissantes, orbites orientées vers l'avant — illustre l'anatomie d'un grand prédateur adapté à la chasse.",
  },
  {
    id: 'buste_roza',
    nom: 'Buste de Roza Loewenfeld',
    fichier: 'models/sculpture_bust_of_roza_loewenfeld.glb', // ⚠️ ajuste ce nom si ton fichier s'appelle autrement
    categorie: 'Sculpture',
    annee: '—',
    description: "Portrait sculpté dans la tradition du buste commémoratif. L'œuvre capture l'expression et le caractère du modèle à travers le traitement des volumes du visage.",
  },
];

// ============================================================
// CHARGEMENT DES MODÈLES .glb
// ============================================================
// GLTFLoader lit le fichier .glb et nous donne une "scène" 3D
// qu'on peut ensuite dupliquer (.clone()) autant de fois qu'on veut.
const loader = new GLTFLoader();

// On stocke ici les modèles déjà chargés, pour ne pas les recharger
// à chaque clic (chargement une seule fois, réutilisation ensuite).
const modelesCharges = {}; // ex: { objet1: <Object3D> }

function chargerModele(item) {
  return new Promise((resolve, reject) => {
    // Si déjà chargé, on renvoie directement une copie
    if (modelesCharges[item.id]) {
      resolve(modelesCharges[item.id].clone());
      return;
    }

    loader.load(
      item.fichier + '?v=' + Date.now(), // cache-bust : force le navigateur à recharger le vrai fichier à chaque fois (utile pendant que tu modifies tes .glb)
      (gltf) => {
        const modele = gltf.scene;

        // On uniformise la taille : chaque modèle Blender/Sketchfab
        // arrive avec une échelle différente, donc on la recalcule
        // pour que l'objet fasse toujours ~1.5 unité de haut.
        const box = new THREE.Box3().setFromObject(modele);
        const taille = new THREE.Vector3();
        box.getSize(taille);
        const hauteurCible = 1.5;
        const facteur = hauteurCible / (taille.y || 1);
        modele.scale.setScalar(facteur);

        // Les ombres : on les active sur chaque partie du modèle
        modele.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        modelesCharges[item.id] = modele;
        resolve(modele.clone());
      },
      undefined, // callback de progression (pas utilisé ici)
      (erreur) => reject(erreur)
    );
  });
}

// ============================================================
// LE PANNEAU COLLECTION (liste des objets à gauche)
// ============================================================
const collectionList = document.getElementById('collection-list');
const collectionCount = document.getElementById('collection-count');
const objectCounter = document.getElementById('object-counter');
let objetSelectionne = null; // quel item du catalogue est actuellement sélectionné
let nombreObjetsExposes = 0;

function mettreAJourCompteur() {
  const mot = nombreObjetsExposes <= 1 ? 'objet exposé' : 'objets exposés';
  objectCounter.textContent = `${nombreObjetsExposes} ${mot}`;
}

collectionCount.textContent = `${catalogue.length} objet${catalogue.length > 1 ? 's' : ''} disponible${catalogue.length > 1 ? 's' : ''}`;

catalogue.forEach((item) => {
  const li = document.createElement('li');
  li.className = 'collection-item';
  li.innerHTML = `<span class="item-nom">${item.nom}</span><span class="item-categorie">${item.categorie}</span>`;
  li.addEventListener('click', () => {
    document.querySelectorAll('.collection-item').forEach((el) => el.classList.remove('selected'));
    li.classList.add('selected');
    objetSelectionne = item;
  });
  collectionList.appendChild(li);
});

// ============================================================
// SUIVI DES OBJETS POSÉS DANS LA SCÈNE
// ============================================================
// Chaque entrée : { mesh: <Object3D dans la scène>, item: <infos du catalogue> }
const objetsExposes = [];

// ============================================================
// LA FICHE D'INFORMATION (panneau qui apparaît au clic sur un objet posé)
// ============================================================
const infoPanel = document.getElementById('info-panel');
const infoNom = document.getElementById('info-nom');
const infoCategorie = document.getElementById('info-categorie');
const infoDescription = document.getElementById('info-description');
const infoClose = document.getElementById('info-close');
const infoView = document.getElementById('info-view');

let objetActuellementAffiche = null; // le mesh de l'objet dont la fiche est ouverte

function afficherFiche(item, mesh) {
  infoNom.textContent = item.nom;
  infoCategorie.textContent = `${item.categorie} · ${item.annee}`;
  infoDescription.textContent = item.description;
  infoPanel.classList.add('visible');
  objetActuellementAffiche = mesh;
}

function fermerFiche() {
  infoPanel.classList.remove('visible');
  objetActuellementAffiche = null;
}

infoClose.addEventListener('click', fermerFiche);

// ============================================================
// "VOIR L'OBJET" — anime la caméra pour se rapprocher de l'objet
// ============================================================
// On interpole (lerp) progressivement la position de la caméra et
// le point qu'elle regarde, image par image, plutôt qu'un saut brutal.
let animationCamera = null; // { depart, arrivee, cibleDepart, cibleArrivee, t }

function voirObjet(mesh) {
  const positionObjet = new THREE.Vector3();
  mesh.getWorldPosition(positionObjet);

  // Position caméra cible : reculée par rapport à l'objet, légèrement en hauteur
  const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
  const nouvellePosition = positionObjet.clone().add(direction.multiplyScalar(3.2)).add(new THREE.Vector3(0, 0.8, 0));

  animationCamera = {
    depart: camera.position.clone(),
    arrivee: nouvellePosition,
    cibleDepart: controls.target.clone(),
    cibleArrivee: positionObjet.clone().add(new THREE.Vector3(0, 0.9, 0)),
    t: 0,
  };
}

infoView.addEventListener('click', () => {
  if (objetActuellementAffiche) voirObjet(objetActuellementAffiche);
});

// ============================================================
// "RETIRER DE L'EXPOSITION" — enlève seulement l'objet affiché dans la fiche
// ============================================================
const infoRemove = document.getElementById('info-remove');

infoRemove.addEventListener('click', () => {
  if (!objetActuellementAffiche) return;

  const index = objetsExposes.findIndex((o) => o.mesh === objetActuellementAffiche);
  if (index === -1) return;

  const [objetRetire] = objetsExposes.splice(index, 1);
  scene.remove(objetRetire.mesh);
  if (objetRetire.socle) objetRetire.socle.occupe = false; // le socle redevient disponible

  nombreObjetsExposes--;
  mettreAJourCompteur();
  fermerFiche();
});

// ============================================================
// BOUTON RESET — retire tous les objets exposés
// ============================================================
const resetBtn = document.getElementById('reset-btn');
resetBtn.addEventListener('click', () => {
  objetsExposes.forEach((o) => {
    scene.remove(o.mesh);
    if (o.socle) o.socle.occupe = false; // on libère le socle s'il y en avait un
  });
  objetsExposes.length = 0; // vide le tableau
  nombreObjetsExposes = 0;
  mettreAJourCompteur();
  fermerFiche();
  document.querySelectorAll('.collection-item').forEach((el) => el.classList.remove('selected'));
  objetSelectionne = null;
});

// ============================================================
// MODAL "À PROPOS"
// ============================================================
const aboutOverlay = document.getElementById('about-overlay');
const navAbout = document.getElementById('nav-about');
const aboutClose = document.getElementById('about-close');

navAbout.addEventListener('click', () => aboutOverlay.classList.add('visible'));
aboutClose.addEventListener('click', () => aboutOverlay.classList.remove('visible'));
aboutOverlay.addEventListener('click', (e) => {
  if (e.target === aboutOverlay) aboutOverlay.classList.remove('visible'); // clic en dehors du modal = ferme
});

// ============================================================
// RAYCASTER : détecte ce que la souris touche dans la scène
// ============================================================
const raycaster = new THREE.Raycaster();
const pointeur = new THREE.Vector2();

canvas.addEventListener('click', async (event) => {
  pointeur.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointeur.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointeur, camera);

  // --- PRIORITÉ 1 : a-t-on cliqué sur un objet déjà exposé ? ---
  const meshesExposes = objetsExposes.map((o) => o.mesh);
  const hitsObjets = raycaster.intersectObjects(meshesExposes, true); // true = regarde aussi dans les enfants du modèle

  if (hitsObjets.length > 0) {
    // On remonte jusqu'à trouver à quel "objetExposé" appartient la pièce touchée
    const meshTouche = hitsObjets[0].object;
    const trouve = objetsExposes.find((o) => {
      let appartient = false;
      o.mesh.traverse((child) => { if (child === meshTouche) appartient = true; });
      return appartient;
    });
    if (trouve) afficherFiche(trouve.item, trouve.mesh);
    return; // on s'arrête là : on ne pose pas un nouvel objet par-dessus
  }

  if (!objetSelectionne) return; // rien à poser si aucun objet choisi dans le panneau Collection

  // --- PRIORITÉ 2 : a-t-on cliqué sur un socle libre ? ---
  const meshesSocles = socles.filter((s) => !s.occupe).map((s) => s.mesh);
  const hitsSocles = raycaster.intersectObjects(meshesSocles, true);

  if (hitsSocles.length > 0) {
    const socleTouche = socles.find((s) => s.mesh === hitsSocles[0].object);

    try {
      const modele = await chargerModele(objetSelectionne);
      // On pose l'objet exactement au centre du socle, en haut de celui-ci (y = hauteur du socle)
      modele.position.set(socleTouche.mesh.position.x, socleHauteur, socleTouche.mesh.position.z);
      scene.add(modele);

      socleTouche.occupe = true;
      objetsExposes.push({ mesh: modele, item: objetSelectionne, socle: socleTouche });

      nombreObjetsExposes++;
      mettreAJourCompteur();
    } catch (erreur) {
      console.error('Impossible de charger le modèle :', erreur);
      alert("Erreur : le fichier " + objetSelectionne.fichier + " est introuvable ou invalide.");
    }
  }
  // Si le clic n'a touché ni un objet, ni un socle libre : on ne fait rien.
  // (avant, on posait l'objet n'importe où sur le sol — supprimé volontairement :
  // le placement doit se faire uniquement sur un socle, plus cohérent avec le concept musée)
});

// ============================================================
// LA BOUCLE D'ANIMATION
// ============================================================
// Un jeu/site 3D redessine l'écran ~60 fois par seconde.
// requestAnimationFrame appelle notre fonction juste avant le prochain rafraîchissement d'écran.
function animate() {
  requestAnimationFrame(animate);

  // Si une animation "voir l'objet" est en cours, on avance l'interpolation
  if (animationCamera) {
    animationCamera.t += 0.04; // vitesse de l'animation (plus petit = plus lent)
    const t = Math.min(animationCamera.t, 1);
    const easing = 1 - Math.pow(1 - t, 3); // "ease-out" : rapide au début, ralentit à la fin

    camera.position.lerpVectors(animationCamera.depart, animationCamera.arrivee, easing);
    controls.target.lerpVectors(animationCamera.cibleDepart, animationCamera.cibleArrivee, easing);

    if (t >= 1) animationCamera = null; // animation terminée
  }

  controls.update(); // nécessaire car enableDamping = true
  renderer.render(scene, camera);
}
animate();

// ============================================================
// RESPONSIVE : si la fenêtre change de taille
// ============================================================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix(); // obligatoire après avoir changé aspect/fov
  renderer.setSize(window.innerWidth, window.innerHeight);
});