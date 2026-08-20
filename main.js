// ============================================================
// ÉTAPE 1 : LA SCÈNE 3D DE BASE
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ---- 1. LA SCÈNE ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe4e4e0);
scene.fog = new THREE.Fog(0xe4e4e0, 15, 26);

// ---- 2. LA CAMÉRA ----
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 3, 5); // repositionnée pour rester DANS la salle désormais fermée sur ses 4 côtés

// ---- 3. LE RENDERER ----
const canvas = document.getElementById('scene-3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

// ============================================================
// ÉCRAN D'INTRO
// ============================================================
const introScreen = document.getElementById('intro-screen');
const introEnter = document.getElementById('intro-enter');

introEnter.addEventListener('click', () => {
  introScreen.classList.add('hidden');
  setTimeout(() => { introScreen.style.display = 'none'; }, 800);
});

// ============================================================
// LES CONTRÔLES DE CAMÉRA (souris)
// ============================================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.1;
controls.minDistance = 2.5;
controls.maxDistance = 6.3; // ⚠️ volontairement réduit : reste TOUJOURS à l'intérieur des 4 murs, quel que soit l'angle
controls.target.set(0, 1, 0);

// ============================================================
// LA LUMIÈRE
// ============================================================
const ambient = new THREE.AmbientLight(0xffffff, 0.85);
scene.add(ambient);

const jour = new THREE.DirectionalLight(0xffffff, 0.6);
jour.position.set(3, 10, 4);
jour.castShadow = true;
jour.shadow.mapSize.set(1024, 1024);
scene.add(jour);

const spot = new THREE.SpotLight(0xfff2d9, 22, 20, Math.PI / 6, 0.5, 1.5);
spot.position.set(0, 8, 2);
spot.castShadow = true;
spot.shadow.mapSize.set(1024, 1024);
scene.add(spot);
scene.add(spot.target);

// ============================================================
// DIMENSIONS DE LA SALLE (pièce rectangulaire)
// ============================================================
const salleLargeur = 14;
const salleProfondeur = 12;
const salleHauteur = 6.5;

// ============================================================
// LE SOL DU MUSÉE
// ============================================================
const floorGeometry = new THREE.PlaneGeometry(salleLargeur, salleProfondeur);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0xcfd0cc,
  roughness: 0.35,
  metalness: 0.15,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// ============================================================
// LES MURS DE LA SALLE — 4 murs, la pièce est maintenant COMPLÈTEMENT FERMÉE
// ============================================================
// side: THREE.DoubleSide en filet de sécurité : même si la caméra se retrouvait
// du "mauvais côté" d'un mur, il resterait visible (avant, avec FrontSide,
// un mur devenait invisible dès qu'on le regardait par l'arrière — c'est ce qui
// causait la disparition des murs que tu as remarquée).
const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0xf2f1ec, // blanc cassé — corrigé, c'était resté sur une couleur sombre par erreur
  roughness: 0.85,
  metalness: 0,
  side: THREE.DoubleSide,
});

const murFond = new THREE.Mesh(new THREE.PlaneGeometry(salleLargeur, salleHauteur), wallMaterial);
murFond.position.set(0, salleHauteur / 2, -salleProfondeur / 2);
murFond.receiveShadow = true;
scene.add(murFond);

// Mur d'entrée (NOUVEAU) — ferme le 4e côté
const murEntree = new THREE.Mesh(new THREE.PlaneGeometry(salleLargeur, salleHauteur), wallMaterial);
murEntree.position.set(0, salleHauteur / 2, salleProfondeur / 2);
murEntree.rotation.y = Math.PI;
murEntree.receiveShadow = true;
scene.add(murEntree);

const murGauche = new THREE.Mesh(new THREE.PlaneGeometry(salleProfondeur, salleHauteur), wallMaterial);
murGauche.position.set(-salleLargeur / 2, salleHauteur / 2, 0);
murGauche.rotation.y = Math.PI / 2;
murGauche.receiveShadow = true;
scene.add(murGauche);

const murDroit = new THREE.Mesh(new THREE.PlaneGeometry(salleProfondeur, salleHauteur), wallMaterial);
murDroit.position.set(salleLargeur / 2, salleHauteur / 2, 0);
murDroit.rotation.y = -Math.PI / 2;
murDroit.receiveShadow = true;
scene.add(murDroit);

// ============================================================
// LE PLAFOND
// ============================================================
const plafondGeometry = new THREE.PlaneGeometry(salleLargeur, salleProfondeur);
const plafondMaterial = new THREE.MeshStandardMaterial({ color: 0xf7f6f2, roughness: 0.9, side: THREE.DoubleSide });
const plafond = new THREE.Mesh(plafondGeometry, plafondMaterial);
plafond.rotation.x = Math.PI / 2;
plafond.position.y = salleHauteur;
scene.add(plafond);

// Bandeau doré discret à mi-hauteur, sur les 4 murs
const bandeauMaterial = new THREE.MeshBasicMaterial({ color: 0xc9a24a, side: THREE.DoubleSide });
function ajouterBandeau(largeur, x, z, rotationY) {
  const bandeau = new THREE.Mesh(new THREE.PlaneGeometry(largeur, 0.03), bandeauMaterial);
  bandeau.position.set(x, 2.6, z);
  bandeau.rotation.y = rotationY;
  scene.add(bandeau);
}
ajouterBandeau(salleLargeur, 0, -salleProfondeur / 2 + 0.01, 0);
ajouterBandeau(salleLargeur, 0, salleProfondeur / 2 - 0.01, 0);
ajouterBandeau(salleProfondeur, -salleLargeur / 2 + 0.01, 0, Math.PI / 2);
ajouterBandeau(salleProfondeur, salleLargeur / 2 - 0.01, 0, -Math.PI / 2);

// ============================================================
// EMPLACEMENTS MURAUX POUR LES TABLEAUX
// ============================================================
const emplacementsMuraux = [
  { x: -3.5, y: 3, z: -salleProfondeur / 2 + 0.03, rotationY: 0, occupe: false, mesh: null },
  { x: 0,    y: 3, z: -salleProfondeur / 2 + 0.03, rotationY: 0, occupe: false, mesh: null },
  { x: 3.5,  y: 3, z: -salleProfondeur / 2 + 0.03, rotationY: 0, occupe: false, mesh: null },
  { x: -salleLargeur / 2 + 0.03, y: 3, z: -2.5, rotationY: Math.PI / 2, occupe: false, mesh: null },
  { x: -salleLargeur / 2 + 0.03, y: 3, z: 2.5,  rotationY: Math.PI / 2, occupe: false, mesh: null },
  { x: salleLargeur / 2 - 0.03, y: 3, z: -2.5, rotationY: -Math.PI / 2, occupe: false, mesh: null },
  { x: salleLargeur / 2 - 0.03, y: 3, z: 2.5,  rotationY: -Math.PI / 2, occupe: false, mesh: null },
];

function creerRepereEmplacement(emplacement) {
  const largeur = 1.3, hauteur = 1.6;
  const fondGeometry = new THREE.PlaneGeometry(largeur, hauteur);
  const fondMaterial = new THREE.MeshBasicMaterial({ color: 0xc9a24a, transparent: true, opacity: 0.16, side: THREE.DoubleSide });
  const fond = new THREE.Mesh(fondGeometry, fondMaterial);

  const contourGeometry = new THREE.EdgesGeometry(fondGeometry);
  const contourMaterial = new THREE.LineBasicMaterial({ color: 0xc9a24a });
  const contour = new THREE.LineSegments(contourGeometry, contourMaterial);

  const groupe = new THREE.Group();
  groupe.add(fond, contour);
  groupe.position.set(emplacement.x, emplacement.y, emplacement.z);
  groupe.rotation.y = emplacement.rotationY;
  scene.add(groupe);

  emplacement.repere = fond;
  emplacement.repereGroupe = groupe;
}

emplacementsMuraux.forEach(creerRepereEmplacement);

// ============================================================
// QUELQUES LUMIÈRES D'APPOINT
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
// SOCLES
// ============================================================
const socleGeometry = new THREE.CylinderGeometry(0.55, 0.6, 0.9, 32);
const socleMaterial = new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.45, metalness: 0.25 });
const socleHauteur = 0.9;

const positionsSocles = [
  [0, -3],
  [-3.2, 1],
  [3.2, 1],
];

const socles = positionsSocles.map(([x, z]) => {
  const socle = new THREE.Mesh(socleGeometry, socleMaterial);
  socle.position.set(x, socleHauteur / 2, z);
  socle.castShadow = true;
  socle.receiveShadow = true;
  scene.add(socle);
  return { mesh: socle, occupe: false };
});

// ============================================================
// LE CATALOGUE DES SCULPTURES
// ============================================================

const catalogueSculptures = [
  {
    id: 'dodo',
    nom: 'Le Dodo',
    fichier: 'models/dodo_model.glb',
    categorie: 'Histoire naturelle',
    annee: 'Espèce éteinte (XVIIe s.)',
    description: "Reconstitution numérique du dodo (Raphus cucullatus), oiseau originaire de l'île Maurice, aujourd'hui éteint. Il est devenu le symbole de la disparition des espèces causée par l'activité humaine et de la fragilité des écosystèmes insulaires.",
    videoEmbed: 'https://www.dailymotion.com/embed/video/xrj4gs', 
  },
  {
    id: 'lion_skull',
    nom: 'Crâne de lion',
    fichier: 'models/objet2.glb',
    categorie: 'Ostéologie',
    annee: "Spécimen d'étude",
    description: "Étude ostéologique d'un crâne de lion (Panthera leo). La structure crânienne — mâchoires puissantes, orbites orientées vers l'avant — illustre l'anatomie d'un grand prédateur adapté à la chasse.",
    videoEmbed: 'https://www.youtube.com/embed/P59er5TsvoI', 
  },
  {
    id: 'buste_roza',
    nom: 'Buste de Roza Loewenfeld',
    fichier: 'models/sculpture_bust_of_roza_loewenfeld.glb',
    categorie: 'Sculpture',
    annee: '—',
    description: "Portrait sculpté dans la tradition du buste commémoratif. L'œuvre capture l'expression et le caractère du modèle à travers le traitement des volumes du visage.",
    videoEmbed: 'https://www.youtube.com/embed/4BLzg7KejO4',
  },
];

// ============================================================
// LE CATALOGUE DES TABLEAUX
// ============================================================
const catalogueTableaux = [
  {
    id: 'tableau_1',
    nom: 'Les Tournesols',
    fichier: 'models/les_tournesols.glb',
    categorie: 'Peinture — Post-impressionnisme',
    annee: '1888',
    description: "Reconstitution du célèbre tableau de Vincent van Gogh, l'une des œuvres les plus emblématiques du mouvement post-impressionniste. La série des Tournesols illustre la fascination de l'artiste pour la couleur jaune et la lumière du Sud de la France, peinte durant son séjour à Arles.",
    defaut: true,
    videoEmbed: 'https://www.youtube.com/embed/iI7HD2uF0x0',
  },
  {
    id: 'tableau_2',
    nom: 'La Gare Saint-Lazare',
    fichier: 'models/deco_cadre_-_la_gare_st_lazare_monet.glb',
    categorie: 'Peinture — Impressionnisme',
    annee: '1877',
    description: "Œuvre de Claude Monet représentant la gare Saint-Lazare à Paris, l'une des huit toiles de la série consacrée à ce lieu. Monet y capture la vapeur, la lumière et le mouvement ferroviaire, symboles de la modernité industrielle de son époque.",
    defaut: true,
    videoEmbed: 'https://www.youtube.com/embed/BfEQbmWC4Xk',
  },
  {
    id: 'tableau_3',
    nom: 'Gyé Nyame',
    fichier: 'models/tableau_gye_nyame.glb',
    categorie: 'Symbole culturel — Art akan (Ghana)',
    annee: 'Tradition ancienne (origine précoloniale)',
    description: "Représentation d'un symbole Adinkra du peuple Akan, originaire du Ghana. Gyé Nyame signifie Excepté Dieu et symbolise la suprématie divine et la toute-puissance spirituelle. Ce motif figure parmi les plus répandus et les plus vénérés de l'iconographie Adinkra.",
    defaut: false,
    videoEmbed: 'https://www.youtube.com/embed/cCsMTTc0beg', // ⚠️ exemple — remplace par le lien embed de TA vidéo
    correctionRotationY: 0, // ⚠️ corrige l'orientation "perpendiculaire" — ajuste si besoin (voir note ci-dessous)
  },
  {
    id: 'tableau_4',
    nom: 'La Gare Saint-Lazare',
    fichier: 'models/deco_cadre_-_la_gare_st_lazare_monet.glb',
    categorie: 'Peinture — Impressionnisme',
    annee: '1877',
    description: "Œuvre de Claude Monet représentant la gare Saint-Lazare à Paris, l'une des huit toiles de la série consacrée à ce lieu. Monet y capture la vapeur, la lumière et le mouvement ferroviaire, symboles de la modernité industrielle de son époque.",
    defaut: false,
  },
 
  {
    id: 'tableau_6',
    nom: 'Paysage',
    fichier: 'models/tableau_paysage.glb',
    categorie: 'Peinture — Paysagisme',
    annee: '',
    description: "Étude paysagère explorant la représentation de la nature à travers la composition, la lumière et la profondeur. Le genre du paysage occupe une place centrale dans l'histoire de la peinture occidentale depuis le XVIIe siècle.",
    defaut: false,
    correctionRotationY: -Math.PI / 2, // ⚠️ corrige l'orientation "perpendiculaire" — ajuste si besoin (voir note ci-dessous)
  },
];

// ============================================================
// CHARGEMENT DES MODÈLES .glb
// ============================================================
const loader = new GLTFLoader();
const modelesCharges = {};

function chargerModele(item, mode = 'hauteur') {
  return new Promise((resolve, reject) => {
    if (modelesCharges[item.id]) {
      resolve(modelesCharges[item.id].clone());
      return;
    }

    loader.load(
      item.fichier + '?v=' + Date.now(),
      (gltf) => {
        const modele = gltf.scene;

        const box = new THREE.Box3().setFromObject(modele);
        const taille = new THREE.Vector3();
        box.getSize(taille);

        if (mode === 'max') {
          const dimensionMax = Math.max(taille.x, taille.y, taille.z) || 1;
          modele.scale.setScalar(1.3 / dimensionMax);
        } else {
          const hauteurCible = 1.5;
          modele.scale.setScalar(hauteurCible / (taille.y || 1));
        }

        modele.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        modelesCharges[item.id] = modele;
        resolve(modele.clone());
      },
      undefined,
      (erreur) => reject(erreur)
    );
  });
}

// ============================================================
// ACCROCHAGE DES TABLEAUX PAR DÉFAUT
// ============================================================
async function accrocherTableau(item, emplacement) {
  try {
    const modele = await chargerModele(item, 'max');
    modele.position.set(emplacement.x, emplacement.y, emplacement.z);
    modele.rotation.y = emplacement.rotationY + (item.correctionRotationY || 0);
    scene.add(modele);

    emplacement.occupe = true;
    emplacement.mesh = modele;
    emplacement.repereGroupe.visible = false;

    objetsExposes.push({ mesh: modele, item, emplacement });
    nombreObjetsExposes++;
    mettreAJourCompteur();
  } catch (erreur) {
    console.error(`Impossible de charger le tableau ${item.fichier} :`, erreur);
  }
}

const tableauxParDefaut = catalogueTableaux.filter((t) => t.defaut);
tableauxParDefaut.forEach((item, i) => {
  if (emplacementsMuraux[i]) accrocherTableau(item, emplacementsMuraux[i]);
});

// ============================================================
// LE PANNEAU COLLECTION
// ============================================================
const collectionList = document.getElementById('collection-list');
const collectionCount = document.getElementById('collection-count');
const objectCounter = document.getElementById('object-counter');
let selection = null;
let nombreObjetsExposes = 0;

function mettreAJourCompteur() {
  const mot = nombreObjetsExposes <= 1 ? 'objet exposé' : 'objets exposés';
  objectCounter.textContent = `${nombreObjetsExposes} ${mot}`;
}

const tableauxAjoutables = catalogueTableaux.filter((t) => !t.defaut);
const totalDisponible = catalogueSculptures.length + tableauxAjoutables.length;
collectionCount.textContent = `${totalDisponible} pièce${totalDisponible > 1 ? 's' : ''} disponible${totalDisponible > 1 ? 's' : ''}`;

function ajouterSectionCollection(titre, items, type) {
  const titreEl = document.createElement('li');
  titreEl.className = 'collection-section-titre';
  titreEl.textContent = titre;
  collectionList.appendChild(titreEl);

  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'collection-item';
    li.innerHTML = `<span class="item-nom">${item.nom}</span><span class="item-categorie">${item.categorie}</span>`;
    li.addEventListener('click', () => {
      document.querySelectorAll('.collection-item').forEach((el) => el.classList.remove('selected'));
      li.classList.add('selected');
      selection = { item, type };
    });
    collectionList.appendChild(li);
  });
}

ajouterSectionCollection('Sculptures', catalogueSculptures, 'sculpture');
if (tableauxAjoutables.length > 0) {
  ajouterSectionCollection('Tableaux', tableauxAjoutables, 'tableau');
}

// ============================================================
// SUIVI DES OBJETS POSÉS
// ============================================================
const objetsExposes = [];

// ============================================================
// LA FICHE D'INFORMATION
// ============================================================
const infoPanel = document.getElementById('info-panel');
const infoNom = document.getElementById('info-nom');
const infoCategorie = document.getElementById('info-categorie');
const infoDescription = document.getElementById('info-description');
const infoVideo = document.getElementById('info-video');
const infoVideoEmbedWrapper = document.getElementById('info-video-embed-wrapper');
const infoVideoEmbed = document.getElementById('info-video-embed');
const infoClose = document.getElementById('info-close');
const infoView = document.getElementById('info-view');

let objetActuellementAffiche = null;

function afficherFiche(item, mesh) {
  infoNom.textContent = item.nom;
  infoCategorie.textContent = `${item.categorie} · ${item.annee}`;
  infoDescription.textContent = item.description;

  // Cas 1 : fichier vidéo direct (hébergé dans models/videos/)
  if (item.video) {
    infoVideo.src = item.video;
    infoVideo.style.display = 'block';
  } else {
    infoVideo.pause();
    infoVideo.removeAttribute('src');
    infoVideo.style.display = 'none';
  }

  // Cas 2 : lien "embed" externe (Dailymotion, YouTube...) — pas besoin de fichier
  if (item.videoEmbed) {
    infoVideoEmbed.src = item.videoEmbed;
    infoVideoEmbedWrapper.style.display = 'block';
  } else {
    infoVideoEmbed.removeAttribute('src'); // coupe la lecture en retirant le src
    infoVideoEmbedWrapper.style.display = 'none';
  }

  infoPanel.classList.add('visible');
  objetActuellementAffiche = mesh;
}

function fermerFiche() {
  infoPanel.classList.remove('visible');
  infoVideo.pause();
  infoVideoEmbed.removeAttribute('src'); // coupe la lecture de l'iframe en fermant la fiche
  objetActuellementAffiche = null;
}

infoClose.addEventListener('click', fermerFiche);

// ============================================================
// "VOIR L'OBJET"
// ============================================================
let animationCamera = null;

function voirObjet(mesh) {
  const positionObjet = new THREE.Vector3();
  mesh.getWorldPosition(positionObjet);

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
// "RETIRER DE L'EXPOSITION"
// ============================================================
const infoRemove = document.getElementById('info-remove');

infoRemove.addEventListener('click', () => {
  if (!objetActuellementAffiche) return;

  const index = objetsExposes.findIndex((o) => o.mesh === objetActuellementAffiche);
  if (index === -1) return;

  const [objetRetire] = objetsExposes.splice(index, 1);
  scene.remove(objetRetire.mesh);
  if (objetRetire.socle) objetRetire.socle.occupe = false;
  if (objetRetire.emplacement) {
    objetRetire.emplacement.occupe = false;
    objetRetire.emplacement.repereGroupe.visible = true;
  }

  nombreObjetsExposes--;
  mettreAJourCompteur();
  fermerFiche();
});

// ============================================================
// BOUTON RESET
// ============================================================
const resetBtn = document.getElementById('reset-btn');
resetBtn.addEventListener('click', () => {
  objetsExposes.forEach((o) => {
    scene.remove(o.mesh);
    if (o.socle) o.socle.occupe = false;
    if (o.emplacement) {
      o.emplacement.occupe = false;
      o.emplacement.repereGroupe.visible = true;
    }
  });
  objetsExposes.length = 0;
  nombreObjetsExposes = 0;
  mettreAJourCompteur();
  fermerFiche();
  document.querySelectorAll('.collection-item').forEach((el) => el.classList.remove('selected'));
  selection = null;
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
  if (e.target === aboutOverlay) aboutOverlay.classList.remove('visible');
});

// ============================================================
// RAYCASTER
// ============================================================
const raycaster = new THREE.Raycaster();
const pointeur = new THREE.Vector2();

canvas.addEventListener('click', async (event) => {
  pointeur.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointeur.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointeur, camera);

  const meshesExposes = objetsExposes.map((o) => o.mesh);
  const hitsObjets = raycaster.intersectObjects(meshesExposes, true);

  if (hitsObjets.length > 0) {
    const meshTouche = hitsObjets[0].object;
    const trouve = objetsExposes.find((o) => {
      let appartient = false;
      o.mesh.traverse((child) => { if (child === meshTouche) appartient = true; });
      return appartient;
    });
    if (trouve) afficherFiche(trouve.item, trouve.mesh);
    return;
  }

  if (!selection) return;

  if (selection.type === 'sculpture') {
    const meshesSocles = socles.filter((s) => !s.occupe).map((s) => s.mesh);
    const hitsSocles = raycaster.intersectObjects(meshesSocles, true);
    if (hitsSocles.length === 0) return;

    const socleTouche = socles.find((s) => s.mesh === hitsSocles[0].object);
    try {
      const modele = await chargerModele(selection.item, 'hauteur');
      modele.position.set(socleTouche.mesh.position.x, socleHauteur, socleTouche.mesh.position.z);
      scene.add(modele);

      socleTouche.occupe = true;
      objetsExposes.push({ mesh: modele, item: selection.item, socle: socleTouche });

      nombreObjetsExposes++;
      mettreAJourCompteur();
    } catch (erreur) {
      console.error('Impossible de charger le modèle :', erreur);
      alert("Erreur : le fichier " + selection.item.fichier + " est introuvable ou invalide.");
    }
  } else if (selection.type === 'tableau') {
    const reperesLibres = emplacementsMuraux.filter((e) => !e.occupe).map((e) => e.repere);
    const hitsEmplacements = raycaster.intersectObjects(reperesLibres, true);
    if (hitsEmplacements.length === 0) return;

    const emplacementTouche = emplacementsMuraux.find((e) => e.repere === hitsEmplacements[0].object);
    try {
      const modele = await chargerModele(selection.item, 'max');
      modele.position.set(emplacementTouche.x, emplacementTouche.y, emplacementTouche.z);
      modele.rotation.y = emplacementTouche.rotationY + (selection.item.correctionRotationY || 0);
      scene.add(modele);

      emplacementTouche.occupe = true;
      emplacementTouche.mesh = modele;
      emplacementTouche.repereGroupe.visible = false;

      objetsExposes.push({ mesh: modele, item: selection.item, emplacement: emplacementTouche });

      nombreObjetsExposes++;
      mettreAJourCompteur();
    } catch (erreur) {
      console.error('Impossible de charger le tableau :', erreur);
      alert("Erreur : le fichier " + selection.item.fichier + " est introuvable ou invalide.");
    }
  }
});

// ============================================================
// LA BOUCLE D'ANIMATION
// ============================================================
function animate() {
  requestAnimationFrame(animate);

  if (animationCamera) {
    animationCamera.t += 0.04;
    const t = Math.min(animationCamera.t, 1);
    const easing = 1 - Math.pow(1 - t, 3);

    camera.position.lerpVectors(animationCamera.depart, animationCamera.arrivee, easing);
    controls.target.lerpVectors(animationCamera.cibleDepart, animationCamera.cibleArrivee, easing);

    if (t >= 1) animationCamera = null;
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// ============================================================
// RESPONSIVE
// ============================================================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
