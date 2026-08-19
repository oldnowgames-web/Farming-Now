// ===============================================
// ESTADO DO JOGO E SISTEMA DE MISSÕES
// ===============================================
let isGameStarted = false;

const questList = [
  { id: 'till', title: '1. Preparando o Solo', desc: 'Are 3 canteiros de terra usando E.', type: 'till', target: 3, rewardCoins: 15, progress: 0, completed: false },
  { id: 'plant', title: '2. Primeira Plantação', desc: 'Plante 3 sementes de trigo.', type: 'plant', target: 3, rewardCoins: 20, progress: 0, completed: false },
  { id: 'water', title: '3. Hora de Regar', desc: 'Regue 3 plantas para elas crescerem.', type: 'water', target: 3, rewardCoins: 25, progress: 0, completed: false },
  { id: 'harvest', title: '4. Primeira Colheita', desc: 'Colha 3 trigos prontos.', type: 'harvest', target: 3, rewardCoins: 30, progress: 0, completed: false },
  { id: 'sell', title: '5. Indo ao Mercadinho', desc: 'Venda 1 Trigo na Loja Física 3D.', type: 'sell', target: 1, rewardCoins: 50, progress: 0, completed: false }
];

let currentQuestIndex = 0;

function updateQuestHUD() {
  const currentQuest = questList[currentQuestIndex];
  const questHud = document.getElementById('quest-hud');

  if (!currentQuest) {
    if (questHud) questHud.classList.add('hidden');
    return;
  }

  document.getElementById('quest-title').textContent = currentQuest.title;
  document.getElementById('quest-desc').textContent = currentQuest.desc;
  document.getElementById('quest-reward').textContent = `+${currentQuest.rewardCoins} 💰`;
  document.getElementById('quest-progress-text').textContent = `${currentQuest.progress} / ${currentQuest.target}`;

  const percentage = Math.min(100, (currentQuest.progress / currentQuest.target) * 100);
  document.getElementById('quest-progress-fill').style.width = `${percentage}%`;
}

function registerQuestAction(actionType) {
  const currentQuest = questList[currentQuestIndex];
  if (!currentQuest || currentQuest.completed) return;

  if (currentQuest.type === actionType) {
    currentQuest.progress += 1;

    if (currentQuest.progress >= currentQuest.target) {
      currentQuest.completed = true;
      playerData.coins += currentQuest.rewardCoins;
      showQuestToast(currentQuest.rewardCoins);
      currentQuestIndex++;

      // Todas as missões do tutorial concluídas: desbloqueia a conquista "Mestre Fazendeiro"
      if (currentQuestIndex >= questList.length) {
        unlockMasterFarmerAchievement();
      }
    }

    updateQuestHUD();
    updateUIElements();
  }
}

let masterFarmerUnlocked = false;
function unlockMasterFarmerAchievement() {
  if (masterFarmerUnlocked) return;
  masterFarmerUnlocked = true;

  const card = document.getElementById('achievement-master-farmer');
  if (card) {
    card.classList.add('done');
    card.innerHTML = `
      <div>
        <div style="font-weight:bold; color: #ffeb3b">🚜 Mestre Fazendeiro ✅</div>
        <small style="color:#d7ccc8">Conclua todas as missões do tutorial.</small>
      </div>
    `;
  }

  playSound('achievement');

  // Mostra o banner de conquista um pouco depois do toast de missão, para não sobrepor
  setTimeout(() => {
    const toast = document.getElementById('achievement-toast');
    if (!toast) return;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3500);
  }, 600);
}

function showQuestToast(reward) {
  const toast = document.getElementById('quest-complete-toast');
  document.getElementById('toast-reward-text').textContent = `+${reward} Moedas recebidas!`;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function renderMissionsModal() {
  const listEl = document.getElementById('missions-list');
  if (!listEl) return;

  listEl.innerHTML = '';
  questList.forEach((q, idx) => {
    const card = document.createElement('div');
    const isCurrent = idx === currentQuestIndex;
    const isDone = q.completed;

    card.className = `mission-item-card ${isDone ? 'done' : ''} ${isCurrent ? 'active-item' : ''}`;
    card.innerHTML = `
      <div>
        <div style="font-weight:bold; color: ${isDone ? '#81c784' : '#ffeb3b'}">
          ${q.title} ${isDone ? '✅' : ''}
        </div>
        <small style="color:#d7ccc8">${q.desc}</small>
      </div>
      <div>
        <span style="font-size:12px; font-weight:bold; color:#ffb74d">
          ${isDone ? 'Concluída' : `${q.progress}/${q.target}`}
        </span>
      </div>
    `;
    listEl.appendChild(card);
  });
}

// ===============================================
// SISTEMA DE SOM
// ===============================================
const sounds = {
  walk: new Audio('sounds/walk.mp3'),
  buy: new Audio('sounds/buy.mp3'),
  drop: new Audio('sounds/drop.mp3'),
  till: new Audio('sounds/drop.mp3'),
  plant: new Audio('sounds/semente.mp3'),
  water: new Audio('sounds/regar.mp3'),
  cow: new Audio('sounds/cow.mp3'),
  chicken: new Audio('sounds/chicken.mp3'),
  sheep: new Audio('sounds/sheep.mp3'),
  achievement: new Audio('sounds/conquest.mp3')
};
sounds.walk.loop = true;
sounds.walk.volume = 0.35;
sounds.buy.volume = 0.6;
sounds.drop.volume = 0.6;
sounds.till.volume = 0.6;
sounds.plant.volume = 0.6;
sounds.water.volume = 0.6;
sounds.cow.loop = true;
sounds.chicken.loop = true;
sounds.sheep.loop = true;
sounds.cow.volume = 0.55;
sounds.chicken.volume = 0.55;
sounds.sheep.volume = 0.55;
sounds.achievement.volume = 0.7;

// Música de fundo (loop, separada dos efeitos sonoros pois toca continuamente)
const backgroundMusic = new Audio('sounds/farmingnow.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.25;

let isMuted = false;
let soundsUnlocked = false;
let isWalkSoundPlaying = false;

// Navegadores bloqueiam áudio até haver um gesto do usuário (clique/toque).
// Chamamos isso no clique do botão "Jogar" para destravar tudo de uma vez.
function unlockAudio() {
  if (soundsUnlocked) return;
  soundsUnlocked = true;
  Object.values(sounds).forEach(audio => {
    const p = audio.play();
    if (p && p.then) {
      p.then(() => { audio.pause(); audio.currentTime = 0; }).catch(() => {});
    }
  });
}

// Toca um efeito sonoro (não-loop). Usa clone para permitir sons sobrepostos
// (ex: colher vários itens rapidamente em sequência).
function playSound(name) {
  if (isMuted) return;
  const base = sounds[name];
  if (!base) return;
  try {
    const clone = base.cloneNode();
    clone.volume = base.volume;
    clone.play().catch(() => {});
  } catch (e) { /* arquivo de som ausente ou bloqueado, ignora silenciosamente */ }
}

function startWalkSound() {
  if (isMuted || isWalkSoundPlaying) return;
  isWalkSoundPlaying = true;
  sounds.walk.currentTime = 0;
  sounds.walk.play().catch(() => {});
}

function stopWalkSound() {
  if (!isWalkSoundPlaying) return;
  isWalkSoundPlaying = false;
  sounds.walk.pause();
}

// Sons ambiente dos animais (mugido/cacarejo/balido): tocam em loop enquanto o
// jogador estiver perto do cercado, e param assim que ele se afasta.
const animalLoopState = { cow: false, chicken: false, sheep: false };

function startAnimalSound(key) {
  if (isMuted || animalLoopState[key]) return;
  const audio = sounds[key];
  if (!audio) return;
  animalLoopState[key] = true;
  audio.play().catch(() => {});
}

function stopAnimalSound(key) {
  if (!animalLoopState[key]) return;
  animalLoopState[key] = false;
  const audio = sounds[key];
  if (audio) audio.pause();
}

function stopAllAnimalSounds() {
  Object.keys(animalLoopState).forEach(stopAnimalSound);
}

// Inicia a música de fundo (chamado no clique de "Jogar", já dentro do gesto do usuário)
function startBackgroundMusic() {
  if (isMuted) return;
  backgroundMusic.play().catch(() => {});
}

function toggleMute() {
  isMuted = !isMuted;
  Object.values(sounds).forEach(a => { a.muted = isMuted; });
  backgroundMusic.muted = isMuted;
  if (isMuted) {
    stopWalkSound();
    stopAllAnimalSounds();
  } else if (isGameStarted) {
    startBackgroundMusic();
  }
  const btn = document.getElementById('btn-mute');
  if (btn) btn.textContent = isMuted ? '🔇' : '🔊';
}

// ===============================================
// 1. CENA, CÂMERA E RENDERIZADOR
// ===============================================
const scene = new THREE.Scene();
const skyColor = 0x8ecae6;
scene.background = new THREE.Color(skyColor);
// Névoa suave: dá profundidade e esconde a borda do terreno no horizonte
scene.fog = new THREE.Fog(skyColor, 34, 62);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const colliders = [];

// ===============================================
// 2. ILUMINAÇÃO
// ===============================================
// Luz hemisférica: tom de céu vindo de cima + tom de grama refletindo de baixo.
// Deixa a iluminação ambiente muito mais natural do que um branco liso.
const hemiLight = new THREE.HemisphereLight(0xbfe3ff, 0x6b8e4e, 0.55);
scene.add(hemiLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xfff4e0, 0.95);
dirLight.position.set(22, 34, 16);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -38;
dirLight.shadow.camera.right = 38;
dirLight.shadow.camera.top = 38;
dirLight.shadow.camera.bottom = -38;
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 90;
dirLight.shadow.bias = -0.0025;
scene.add(dirLight);
scene.add(dirLight.target);

// Luz de preenchimento fria vinda do lado oposto, bem sutil — suaviza sombras
// muito duras sem lavar o visual "voxel" original dos personagens/animais.
const fillLight = new THREE.DirectionalLight(0xbcd4ff, 0.18);
fillLight.position.set(-18, 14, -14);
scene.add(fillLight);

// ---------- CÉU EM GRADIENTE (cúpula) ----------
// Substitui o fundo de cor sólida por um degradê azul-claro -> horizonte
// esbranquiçado, gerado via canvas e projetado numa esfera gigante ao redor da cena.
function createSkyDomeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#4a90d9');
  grad.addColorStop(0.55, '#8ecae6');
  grad.addColorStop(1, '#dff3f9');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const skyDome = new THREE.Mesh(
  new THREE.SphereGeometry(300, 24, 16),
  new THREE.MeshBasicMaterial({ map: createSkyDomeTexture(), side: THREE.BackSide, fog: false })
);
scene.add(skyDome);

// ---------- NUVENS DECORATIVAS DE FUNDO ----------
const decorativeClouds = [];
function createDecorativeCloud(x, y, z, scale) {
  const cloudGroup = new THREE.Group();
  const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, fog: false });
  const puffPositions = [[0, 0, 0], [1.1, 0.15, 0.2], [-1.1, 0.1, -0.1], [0.5, 0.5, 0.1], [-0.5, 0.4, 0]];
  puffPositions.forEach(([px, py, pz]) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), cloudMat);
    puff.position.set(px, py, pz);
    cloudGroup.add(puff);
  });
  cloudGroup.position.set(x, y, z);
  cloudGroup.scale.set(scale, scale * 0.6, scale);
  scene.add(cloudGroup);
  decorativeClouds.push({ group: cloudGroup, baseX: x, speed: 0.15 + Math.random() * 0.1 });
}

createDecorativeCloud(-25, 22, -30, 3);
createDecorativeCloud(15, 26, -35, 4);
createDecorativeCloud(35, 20, -10, 2.5);
createDecorativeCloud(-35, 24, 5, 3.5);
createDecorativeCloud(0, 28, -40, 3);

function animateDecorativeClouds() {
  const t = Date.now() * 0.00002;
  decorativeClouds.forEach(c => {
    c.group.position.x = c.baseX + Math.sin(t * 10 * c.speed) * 4;
  });
}

// ===============================================
// 3. TERRENO PRINCIPAL & CENÁRIO
// ===============================================
// Gera uma textura de grama com variação de tom (ao invés de verde sólido chapado),
// repetida (tiled) várias vezes pelo terreno para dar mais riqueza visual sem
// pesar no desempenho.
function createGrassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#4caf50';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Manchas orgânicas de tons de verde mais claros/escuros
  const shades = ['#43a047', '#5cb860', '#3f9142', '#66bb6a'];
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = shades[i % shades.length];
    ctx.globalAlpha = 0.35;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = 3 + Math.random() * 9;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pequenos traços de "fio de grama"
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 1;
  for (let i = 0; i < 420; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 4, y - 4 - Math.random() * 3);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

const groundGeo = new THREE.PlaneGeometry(60, 60);
const groundMat = new THREE.MeshLambertMaterial({ map: createGrassTexture() });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

function createTree(x, z) {
  const treeGroup = new THREE.Group();
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1;
  trunk.castShadow = true;
  trunk.receiveShadow = true;

  // Copa em duas camadas (cone maior embaixo + cone menor em cima, tons
  // diferentes de verde) — dá mais volume e profundidade do que um cone só.
  const leavesMatBase = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
  const leavesMatTop = new THREE.MeshLambertMaterial({ color: 0x388e3c });

  const leavesBase = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.4, 8), leavesMatBase);
  leavesBase.position.y = 2.6;
  leavesBase.castShadow = true;
  leavesBase.receiveShadow = true;

  const leavesTop = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.0, 8), leavesMatTop);
  leavesTop.position.y = 3.9;
  leavesTop.castShadow = true;
  leavesTop.receiveShadow = true;

  treeGroup.add(trunk, leavesBase, leavesTop);
  treeGroup.position.set(x, 0, z);

  // Pequena variação orgânica de escala/rotação para cada árvore não parecer clonada
  const scaleVariation = 0.85 + Math.random() * 0.35;
  treeGroup.scale.set(scaleVariation, scaleVariation, scaleVariation);
  treeGroup.rotation.y = Math.random() * Math.PI * 2;

  scene.add(treeGroup);
}

createTree(-15, -10);
createTree(-18, -5);
createTree(18, -8);
createTree(20, 2);
createTree(-15, 15);
createTree(15, 15);
createTree(-20, 8);
createTree(22, -18);
createTree(-8, -22);
createTree(10, 20);

function createFenceRow(startX, startZ, length, isHorizontal = true, includeLastRail = false) {
  const fenceGroup = new THREE.Group();
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
  const postSpacing = 2;

  for (let i = 0; i <= length; i += postSpacing) {
    const postGeo = new THREE.BoxGeometry(0.2, 1.2, 0.2);
    const post = new THREE.Mesh(postGeo, woodMat);
    if (isHorizontal) post.position.set(i, 0.6, 0);
    else post.position.set(0, 0.6, i);
    fenceGroup.add(post);

    if (i < length || includeLastRail) {
      const railLength = (i === length) ? 1.0 : postSpacing;
      const railGeo = new THREE.BoxGeometry(isHorizontal ? railLength : 0.1, 0.15, isHorizontal ? 0.1 : railLength);
      const railUpper = new THREE.Mesh(railGeo, woodMat);
      const railLower = new THREE.Mesh(railGeo, woodMat);
      const offset = (i === length) ? railLength / 2 : postSpacing / 2;

      if (isHorizontal) {
        railUpper.position.set(i + offset, 0.9, 0);
        railLower.position.set(i + offset, 0.5, 0);
      } else {
        railUpper.position.set(0, 0.9, i + offset);
        railLower.position.set(0, 0.5, i + offset);
      }
      fenceGroup.add(railUpper, railLower);
    }
  }

  fenceGroup.position.set(startX, 0, startZ);
  fenceGroup.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(fenceGroup);

  const boxWidth = isHorizontal ? length + (includeLastRail ? 1 : 0.2) : 0.4;
  const boxDepth = isHorizontal ? 0.4 : length + (includeLastRail ? 1 : 0.2);
  const fenceBox = new THREE.Box3();
  fenceBox.setFromCenterAndSize(
    new THREE.Vector3(startX + (isHorizontal ? (length / 2) : 0), 0.6, startZ + (isHorizontal ? 0 : (length / 2))),
    new THREE.Vector3(boxWidth, 1.2, boxDepth)
  );
  colliders.push(fenceBox);
}

// Cerca da Horta
createFenceRow(-5, -8.0, 10, true, false);       
createFenceRow(-5, -8.0, 6.0, false, true);      
createFenceRow(5, -8.0, 6.0, false, true);       

// Gera uma textura de placa de madeira com texto (usada nas placas dos prédios).
// O tamanho da fonte diminui automaticamente até o texto caber na placa.
function createSignBoardTexture(text, options = {}) {
  const canvas = document.createElement('canvas');
  const width = options.width || 512;
  const height = options.height || 150;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = options.bg || '#6d4c41';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#3e2723';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, width - 10, height - 10);

  ctx.fillStyle = options.textColor || '#ffeb3b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let fontSize = options.fontSize || 66;
  const maxWidth = width - 40;
  ctx.font = `bold ${fontSize}px 'Fredoka One', Arial`;
  while (ctx.measureText(text).width > maxWidth && fontSize > 20) {
    fontSize -= 2;
    ctx.font = `bold ${fontSize}px 'Fredoka One', Arial`;
  }

  ctx.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createHouse(x, z) {
  const houseGroup = new THREE.Group();
  const walls = new THREE.Mesh(new THREE.BoxGeometry(5, 3.5, 4), new THREE.MeshLambertMaterial({ color: 0xd7ccc8 }));
  walls.position.y = 1.75;

  const roof = new THREE.Mesh(new THREE.ConeGeometry(4, 2, 4), new THREE.MeshLambertMaterial({ color: 0xb71c1c }));
  roof.position.y = 4.5;
  roof.rotation.y = Math.PI / 4;

  const door = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.1), new THREE.MeshLambertMaterial({ color: 0x4e342e }));
  door.position.set(0, 1, 2.01);

  houseGroup.add(walls, roof, door);
  houseGroup.position.set(x, 0, z);
  houseGroup.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(houseGroup);

  const houseBox = new THREE.Box3();
  houseBox.setFromCenterAndSize(new THREE.Vector3(x, 1.75, z), new THREE.Vector3(5.2, 3.5, 4.2));
  colliders.push(houseBox);
}

let shopInteractionPos = new THREE.Vector3(8, 0, -12);

function createShopBuilding(x, z) {
  const shopGroup = new THREE.Group();
  const walls = new THREE.Mesh(new THREE.BoxGeometry(6, 3.8, 5), new THREE.MeshLambertMaterial({ color: 0xffe082 }));
  walls.position.y = 1.9;

  const roof = new THREE.Mesh(new THREE.ConeGeometry(5, 2.2, 4), new THREE.MeshLambertMaterial({ color: 0x2e7d32 }));
  roof.position.y = 4.9;
  roof.rotation.y = Math.PI / 4;

  const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.1), new THREE.MeshLambertMaterial({ color: 0x3e2723 }));
  door.position.set(0, 1.1, 2.51);

  const sign = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.8, 0.2), new THREE.MeshLambertMaterial({ color: 0x8d6e63 }));
  sign.position.set(0, 2.8, 2.6);

  const signText = new THREE.Mesh(
    new THREE.PlaneGeometry(2.7, 0.7),
    new THREE.MeshBasicMaterial({ map: createSignBoardTexture('Loja'), transparent: true })
  );
  signText.position.set(0, 2.8, 2.71);

  shopGroup.add(walls, roof, door, sign, signText);
  shopGroup.position.set(x, 0, z);
  shopGroup.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(shopGroup);

  const shopBox = new THREE.Box3();
  shopBox.setFromCenterAndSize(new THREE.Vector3(x, 1.9, z), new THREE.Vector3(6.2, 3.8, 5.2));
  colliders.push(shopBox);
  shopInteractionPos.set(x, 0, z + 2.8);
}

createHouse(-5, -14);
createShopBuilding(8, -14);

let dairyFactoryMesh = null;
let dairyInteractionPos = new THREE.Vector3(-14, 0, -14 + 2.6);

function createDairyFactoryBuilding(x, z) {
  const factoryGroup = new THREE.Group();
  const walls = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.4, 4.5), new THREE.MeshLambertMaterial({ color: 0xeceff1 }));
  walls.position.y = 1.7;

  const roof = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.4, 4.8), new THREE.MeshLambertMaterial({ color: 0x546e7a }));
  roof.position.y = 3.6;

  const door = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.1, 0.1), new THREE.MeshLambertMaterial({ color: 0x37474f }));
  door.position.set(0, 1.05, 2.26);

  // Silo lateral (estilo tanque de leite)
  const silo = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.6, 16), new THREE.MeshLambertMaterial({ color: 0xb0bec5 }));
  silo.position.set(-3.2, 1.3, 0);
  const siloTop = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.6, 16), new THREE.MeshLambertMaterial({ color: 0x90a4ae }));
  siloTop.position.set(-3.2, 2.9, 0);

  const sign = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 0.2), new THREE.MeshLambertMaterial({ color: 0x8d6e63 }));
  sign.position.set(0, 2.6, 2.35);

  const signText = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 0.7),
    new THREE.MeshBasicMaterial({ map: createSignBoardTexture('Fábrica de Queijo', { width: 620, fontSize: 56 }), transparent: true })
  );
  signText.position.set(0, 2.6, 2.46);

  factoryGroup.add(walls, roof, door, silo, siloTop, sign, signText);
  factoryGroup.position.set(x, 0, z);
  factoryGroup.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(factoryGroup);

  const factoryBox = new THREE.Box3();
  factoryBox.setFromCenterAndSize(new THREE.Vector3(x, 1.7, z), new THREE.Vector3(7.2, 3.4, 4.7));
  colliders.push(factoryBox);
  dairyInteractionPos.set(x, 0, z + 2.6);

  return factoryGroup;
}

// ===============================================
// 4. SISTEMA DE CERCADOS E BALÕES FLUTUANTES (NUVEM)
// ===============================================
const animalTypes = {
  chicken: { 
    id: 'chicken', name: 'Galinha', price: 60, icon: '🐓', 
    penCenter: { x: -14, z: 2 }, penSize: 5,
    product: 'egg', productName: 'Ovo', productPlural: 'Ovos', productIcon: '🥚', productPrice: 6, produceTime: 20000,
    currentStored: 0
  },
  cow: { 
    id: 'cow', name: 'Vaca', price: 160, icon: '🐄', 
    penCenter: { x: 0, z: 10 }, penSize: 7,
    product: 'milk', productName: 'Leite', productPlural: 'Leites', productIcon: '🥛', productPrice: 10, produceTime: 28000,
    currentStored: 0
  },
  sheep: { 
    id: 'sheep', name: 'Ovelha', price: 130, icon: '🐑', 
    penCenter: { x: 14, z: 2 }, penSize: 6,
    product: 'wool', productName: 'Lã', productPlural: 'Lãs', productIcon: '🧶', productPrice: 22, produceTime: 30000,
    currentStored: 0
  }
};

const activeAnimals3D = [];
const floatingBalloons = [];

// Desenha o estilo de Balão/Nuvem com cantos arredondados e borda suave
function createCloudBalloonTexture(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Balão/Nuvem Branca com Borda Arredondada
  const x = 10, y = 10, w = 236, h = 108, r = 30;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();

  // Fundo do Balão
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Borda do Balão (Azul suave)
  ctx.strokeStyle = '#2196f3';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Texto
  ctx.fillStyle = '#1565c0';
  ctx.font = 'bold 38px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Atualiza a textura da nuvem flutuante
function updateSignTexture(type) {
  const config = animalTypes[type];
  if (!config.balloonMesh) return;

  const text = `${config.productIcon} x${config.currentStored}`;

  if (config.balloonMesh.material.map) {
    config.balloonMesh.material.map.dispose();
  }

  config.balloonMesh.material.map = createCloudBalloonTexture(text);
  config.balloonMesh.material.needsUpdate = true;
}

function createPen(center, size, type) {
  const half = size / 2;
  createFenceRow(center.x - half, center.z - half, size, true, true);
  createFenceRow(center.x - half, center.z + half, size, true, true);
  createFenceRow(center.x - half, center.z - half, size, false, true);
  createFenceRow(center.x + half, center.z - half, size, false, true);

  // Posição interativa na frente do cercado
  const collectPos = new THREE.Vector3(center.x, 0, center.z + half + 0.8);
  animalTypes[type].collectPos = collectPos;

  // Centro do cercado + raio de aproximação (usado para tocar o som ao se aproximar do animal)
  animalTypes[type].penCenterVec = new THREE.Vector3(center.x, 0, center.z);
  animalTypes[type].approachRadius = half + 3.5;

  // BALÃO FLUTUANTE 3D (Sem poste de madeira!)
  const initialText = `${animalTypes[type].productIcon} x0`;
  const balloonMat = new THREE.MeshBasicMaterial({
    map: createCloudBalloonTexture(initialText),
    transparent: true
  });

  // Placa fina flutuando como balão
  const balloonMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.9), balloonMat);
  balloonMesh.position.set(center.x, 2.2, center.z + half + 0.8); // Flutuando a 2.2m de altura

  scene.add(balloonMesh);

  animalTypes[type].balloonMesh = balloonMesh;
  
  // Guardado para a animação flutuante
  floatingBalloons.push({
    mesh: balloonMesh,
    baseY: 2.2,
    offset: Math.random() * Math.PI * 2
  });
}

createPen(animalTypes.chicken.penCenter, animalTypes.chicken.penSize, 'chicken');
createPen(animalTypes.cow.penCenter, animalTypes.cow.penSize, 'cow');
createPen(animalTypes.sheep.penCenter, animalTypes.sheep.penSize, 'sheep');

// ---------- Helper para criar partes dos animais (estilo blocky/voxel) ----------
function addPart(group, geometry, color, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color }));
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

// ---------- VACA: corpo branco com manchas pretas, chifres, focinho, orelhas, rabo ----------
function buildCowModel() {
  const group = new THREE.Group();
  const white = 0xffffff;
  const black = 0x2b2b2b;
  const pink = 0xf48fb1;
  const horn = 0xe0d6c3;

  // Corpo
  addPart(group, new THREE.BoxGeometry(1.1, 0.7, 1.5), white, 0, 0.75, 0);

  // Manchas pretas (estilo vaquinha) - pequenos blocos "colados" no corpo
  addPart(group, new THREE.BoxGeometry(0.4, 0.35, 0.42), black, -0.5, 0.95, 0.35, 0, 0, 0.1);
  addPart(group, new THREE.BoxGeometry(0.36, 0.3, 0.4), black, 0.48, 0.62, -0.35, 0, 0, -0.08);
  addPart(group, new THREE.BoxGeometry(0.5, 0.22, 0.6), black, -0.1, 1.11, -0.2);

  // Cabeça
  const head = addPart(group, new THREE.BoxGeometry(0.5, 0.48, 0.48), white, 0, 1.15, 0.85);

  // Focinho (nariz)
  addPart(group, new THREE.BoxGeometry(0.32, 0.22, 0.16), pink, 0, 1.02, 1.08);
  // Narinas
  addPart(group, new THREE.SphereGeometry(0.025, 6, 6), black, -0.08, 1.03, 1.16);
  addPart(group, new THREE.SphereGeometry(0.025, 6, 6), black, 0.08, 1.03, 1.16);
  // Boca
  addPart(group, new THREE.BoxGeometry(0.26, 0.03, 0.05), 0x5d4037, 0, 0.9, 1.1);

  // Olhos (branco + pupila)
  [-0.19, 0.19].forEach(sx => {
    addPart(group, new THREE.SphereGeometry(0.06, 8, 8), white, sx, 1.28, 1.05);
    addPart(group, new THREE.SphereGeometry(0.032, 8, 8), black, sx, 1.28, 1.1);
  });

  // Chifres
  addPart(group, new THREE.ConeGeometry(0.045, 0.2, 6), horn, -0.2, 1.46, 0.72, 0, 0, 0.35);
  addPart(group, new THREE.ConeGeometry(0.045, 0.2, 6), horn, 0.2, 1.46, 0.72, 0, 0, -0.35);

  // Orelhas
  const earL = addPart(group, new THREE.BoxGeometry(0.16, 0.16, 0.05), white, -0.32, 1.22, 0.78, 0, 0, 0.5);
  const earR = addPart(group, new THREE.BoxGeometry(0.16, 0.16, 0.05), white, 0.32, 1.22, 0.78, 0, 0, -0.5);

  // Úbere
  addPart(group, new THREE.SphereGeometry(0.16, 8, 8), pink, 0, 0.38, 0.35);

  // Rabo (cauda) com tufo preto
  const tail = new THREE.Group();
  addPart(tail, new THREE.CylinderGeometry(0.035, 0.03, 0.55, 6), white, 0, -0.27, 0);
  addPart(tail, new THREE.SphereGeometry(0.08, 8, 8), black, 0, -0.56, 0);
  tail.position.set(0, 0.78, -0.78);
  tail.rotation.x = 0.2;
  group.add(tail);

  // Pernas
  const legGeo = new THREE.BoxGeometry(0.18, 0.45, 0.18);
  const legPositions = {
    frontLeft:  [-0.38, 0.225,  0.52],
    frontRight: [ 0.38, 0.225,  0.52],
    backLeft:   [-0.38, 0.225, -0.52],
    backRight:  [ 0.38, 0.225, -0.52]
  };
  const legs = {};
  Object.entries(legPositions).forEach(([key, [x, y, z]]) => {
    const legGroup = new THREE.Group();
    addPart(legGroup, legGeo, white, 0, -0.225, 0);
    addPart(legGroup, new THREE.BoxGeometry(0.19, 0.08, 0.19), black, 0, -0.39, 0);
    legGroup.position.set(x, y + 0.225, z);
    group.add(legGroup);
    legs[key] = legGroup;
  });

  return { group, legs, head, tail, earL, earR };
}

// ---------- OVELHA: corpo lanudo (caroços de lã), cabeça e pernas pretas, rabinho ----------
function buildSheepModel() {
  const group = new THREE.Group();
  const wool = 0xfafafa;
  const woolShade = 0xf0ede6;
  const black = 0x2b2b2b;
  const pink = 0xf48fb1;

  // Corpo base (esconde atrás dos caroços de lã)
  addPart(group, new THREE.BoxGeometry(0.75, 0.5, 1.05), woolShade, 0, 0.5, 0);

  // "Caroços" de lã cobrindo o corpo (estilo fofinho/voxel)
  const woolBumps = [
    [-0.24, 0.72, 0.32], [0.24, 0.72, 0.32],
    [-0.24, 0.72, -0.02], [0.24, 0.72, -0.02],
    [-0.24, 0.72, -0.34], [0.24, 0.72, -0.34],
    [0, 0.8, 0.15], [0, 0.8, -0.18],
    [-0.3, 0.5, 0], [0.3, 0.5, 0],
    [0, 0.5, 0.42], [0, 0.5, -0.42]
  ];
  woolBumps.forEach(([x, y, z]) => {
    addPart(group, new THREE.SphereGeometry(0.19, 8, 8), wool, x, y, z);
  });

  // Cabeça (preta, sem lã)
  const head = addPart(group, new THREE.BoxGeometry(0.32, 0.3, 0.3), black, 0, 0.66, 0.62);

  // Focinho
  addPart(group, new THREE.BoxGeometry(0.18, 0.12, 0.1), 0x3d3d3d, 0, 0.58, 0.79);

  // Olhos
  [-0.1, 0.1].forEach(sx => {
    addPart(group, new THREE.SphereGeometry(0.035, 8, 8), 0x000000, sx, 0.72, 0.76);
  });

  // Orelhas (caídas para os lados)
  addPart(group, new THREE.BoxGeometry(0.2, 0.09, 0.14), black, -0.22, 0.68, 0.58, 0, 0, 0.4);
  addPart(group, new THREE.BoxGeometry(0.2, 0.09, 0.14), black, 0.22, 0.68, 0.58, 0, 0, -0.4);

  // Topete de lã na cabeça
  addPart(group, new THREE.SphereGeometry(0.13, 8, 8), wool, 0, 0.84, 0.58);

  // Rabinho fofo
  const tail = addPart(group, new THREE.SphereGeometry(0.09, 8, 8), wool, 0, 0.55, -0.55);

  // Pernas finas pretas
  const legGeo = new THREE.CylinderGeometry(0.055, 0.06, 0.42, 6);
  const legPositions = {
    frontLeft:  [-0.26, 0.21,  0.32],
    frontRight: [ 0.26, 0.21,  0.32],
    backLeft:   [-0.26, 0.21, -0.32],
    backRight:  [ 0.26, 0.21, -0.32]
  };
  const legs = {};
  Object.entries(legPositions).forEach(([key, [x, y, z]]) => {
    const legGroup = new THREE.Group();
    addPart(legGroup, legGeo, black, 0, -0.21, 0);
    legGroup.position.set(x, y + 0.21, z);
    group.add(legGroup);
    legs[key] = legGroup;
  });

  return { group, legs, tail, head };
}

// ---------- GALINHA: corpo, bico, crista, barbela, penas, pernas finas ----------
function buildChickenModel() {
  const group = new THREE.Group();
  const white = 0xfffaf0;
  const orange = 0xff9800;
  const red = 0xf44336;
  const black = 0x2b2b2b;

  // Corpo
  addPart(group, new THREE.BoxGeometry(0.34, 0.32, 0.44), white, 0, 0.33, 0);

  // Cabeça
  addPart(group, new THREE.BoxGeometry(0.2, 0.2, 0.2), white, 0, 0.58, 0.2);

  // Bico
  addPart(group, new THREE.ConeGeometry(0.06, 0.14, 4), orange, 0, 0.56, 0.34, Math.PI / 2, Math.PI / 4, 0);

  // Crista (vermelha, no topo)
  addPart(group, new THREE.BoxGeometry(0.05, 0.09, 0.06), red, -0.04, 0.71, 0.18);
  addPart(group, new THREE.BoxGeometry(0.05, 0.1, 0.06), red, 0.04, 0.72, 0.2);
  addPart(group, new THREE.BoxGeometry(0.05, 0.08, 0.06), red, 0, 0.7, 0.24);

  // Barbela (embaixo do bico)
  addPart(group, new THREE.BoxGeometry(0.06, 0.07, 0.04), red, 0, 0.47, 0.32);

  // Olhos
  [-0.09, 0.09].forEach(sx => {
    addPart(group, new THREE.SphereGeometry(0.03, 6, 6), black, sx, 0.62, 0.3);
  });

  // Asas
  const wingL = addPart(group, new THREE.BoxGeometry(0.06, 0.2, 0.26), 0xf5f5f5, -0.19, 0.35, -0.02, 0, 0, 0.1);
  const wingR = addPart(group, new THREE.BoxGeometry(0.06, 0.2, 0.26), 0xf5f5f5, 0.19, 0.35, -0.02, 0, 0, -0.1);

  // Cauda (penas)
  addPart(group, new THREE.BoxGeometry(0.05, 0.24, 0.05), white, -0.05, 0.5, -0.24, -0.5, 0, 0);
  addPart(group, new THREE.BoxGeometry(0.05, 0.26, 0.05), white, 0, 0.52, -0.25, -0.5, 0, 0);
  addPart(group, new THREE.BoxGeometry(0.05, 0.24, 0.05), white, 0.05, 0.5, -0.24, -0.5, 0, 0);

  // Pernas finas + pés
  const legPositions = { left: -0.08, right: 0.08 };
  const legs = {};
  Object.entries(legPositions).forEach(([key, x]) => {
    const legGroup = new THREE.Group();
    addPart(legGroup, new THREE.CylinderGeometry(0.022, 0.022, 0.26, 6), orange, 0, -0.13, 0);
    addPart(legGroup, new THREE.BoxGeometry(0.14, 0.02, 0.16), orange, 0, -0.26, 0.04);
    legGroup.position.set(x, 0.29, 0);
    group.add(legGroup);
    legs[key] = legGroup;
  });

  return { group, legs, wingL, wingR };
}

function spawnAnimal3D(type) {
  const animalConfig = animalTypes[type];
  let model;

  if (type === 'chicken') model = buildChickenModel();
  else if (type === 'cow') model = buildCowModel();
  else if (type === 'sheep') model = buildSheepModel();

  const group = model.group;

  const center = animalConfig.penCenter;
  const offset = (Math.random() - 0.5) * (animalConfig.penSize - 2);
  group.position.set(center.x + offset, 0, center.z + offset);
  scene.add(group);

  const animalObj = {
    mesh: group,
    model: model,
    type: type,
    center: center,
    bounds: animalConfig.penSize - 1.5,
    target: new THREE.Vector3(center.x + offset, 0, center.z + offset),
    speed: 0.02,
    walkPhase: Math.random() * Math.PI * 2,
    timer: setInterval(() => {
      produceItemForPen(type);
    }, animalConfig.produceTime)
  };

  activeAnimals3D.push(animalObj);
}

// Incrementa a produção no cercado e atualiza o Balão Flutuante (sem limite de armazenamento)
function produceItemForPen(type) {
  const config = animalTypes[type];
  config.currentStored += 1;
  updateSignTexture(type);
}

function updateAnimalsMovement() {
  activeAnimals3D.forEach(anim => {
    const distToTarget = anim.mesh.position.distanceTo(anim.target);
    const isPaused = distToTarget < 0.15;

    if (distToTarget < 0.3 || Math.random() < 0.005) {
      const offsetX = (Math.random() - 0.5) * anim.bounds;
      const offsetZ = (Math.random() - 0.5) * anim.bounds;
      anim.target.set(anim.center.x + offsetX, 0, anim.center.z + offsetZ);
    }

    const dir = new THREE.Vector3().subVectors(anim.target, anim.mesh.position).normalize();
    if (dir.length() > 0 && !isPaused) {
      anim.mesh.position.addScaledVector(dir, anim.speed);
      anim.mesh.rotation.y = Math.atan2(dir.x, dir.z);
      anim.walkPhase += 0.18;
    } else {
      anim.walkPhase += 0.03; // leve balanço parado (respirando)
    }

    animateWalkCycle(anim, isPaused);
  });
}

// Anima pernas, cabeça, rabo e asas dos animais de acordo com o ciclo de caminhada
function animateWalkCycle(anim, isPaused) {
  const legs = anim.model.legs;
  const swing = isPaused ? 0 : 0.5;

  if (anim.type === 'cow' || anim.type === 'sheep') {
    if (legs.frontLeft) legs.frontLeft.rotation.x = Math.sin(anim.walkPhase) * swing;
    if (legs.backRight) legs.backRight.rotation.x = Math.sin(anim.walkPhase) * swing;
    if (legs.frontRight) legs.frontRight.rotation.x = Math.sin(anim.walkPhase + Math.PI) * swing;
    if (legs.backLeft) legs.backLeft.rotation.x = Math.sin(anim.walkPhase + Math.PI) * swing;

    if (anim.type === 'cow' && anim.model.head) {
      anim.model.head.position.y = 1.15 + (isPaused ? Math.sin(anim.walkPhase) * 0.015 : Math.sin(anim.walkPhase * 2) * 0.03);
      if (anim.model.tail) anim.model.tail.rotation.z = Math.sin(anim.walkPhase * 0.8) * 0.25;
    }
    if (anim.type === 'sheep' && anim.model.head) {
      anim.model.head.position.y = 0.66 + (isPaused ? Math.sin(anim.walkPhase) * 0.012 : Math.sin(anim.walkPhase * 2) * 0.025);
    }
  } else if (anim.type === 'chicken') {
    if (legs.left) legs.left.rotation.x = Math.sin(anim.walkPhase) * swing;
    if (legs.right) legs.right.rotation.x = Math.sin(anim.walkPhase + Math.PI) * swing;

    const bob = isPaused ? Math.sin(anim.walkPhase) * 0.01 : Math.abs(Math.sin(anim.walkPhase * 2)) * 0.05;
    anim.mesh.position.y = bob;

    if (anim.model.wingL && anim.model.wingR) {
      const flap = isPaused ? 0 : Math.sin(anim.walkPhase * 2) * 0.15;
      anim.model.wingL.rotation.z = 0.1 + flap;
      anim.model.wingR.rotation.z = -0.1 - flap;
    }
  }
}

// Animação suave para os Balões Nuvem flutuarem subindo e descendo
function animateFloatingBalloons() {
  const time = Date.now() * 0.003;
  floatingBalloons.forEach(b => {
    b.mesh.position.y = b.baseY + Math.sin(time + b.offset) * 0.12;
  });
}

// ===============================================
// 5. CULTURAS E INVENTÁRIO
// ===============================================
const cropsData = {
  wheat_seed: { id: 'wheat_seed', cropId: 'wheat', name: 'Trigo', seedName: 'Semente de Trigo', buyPrice: 6, sellPrice: 9, seedIcon: '🌱', cropIcon: '🌾', color: 0xffeb3b, growTime: 3000 },
  carrot_seed: { id: 'carrot_seed', cropId: 'carrot', name: 'Cenoura', seedName: 'Semente de Cenoura', buyPrice: 10, sellPrice: 15, seedIcon: '🌱', cropIcon: '🥕', color: 0xff9800, growTime: 4000 },
  tomato_seed: { id: 'tomato_seed', cropId: 'tomato', name: 'Tomate', seedName: 'Semente de Tomate', buyPrice: 16, sellPrice: 24, seedIcon: '🌱', cropIcon: '🍅', color: 0xf44336, growTime: 5000 },
  corn_seed: { id: 'corn_seed', cropId: 'corn', name: 'Milho', seedName: 'Semente de Milho', buyPrice: 24, sellPrice: 34, seedIcon: '🌱', cropIcon: '🌽', color: 0xcddc39, growTime: 6000 },
  pumpkin_seed: { id: 'pumpkin_seed', cropId: 'pumpkin', name: 'Abóbora', seedName: 'Semente de Abóbora', buyPrice: 35, sellPrice: 52, seedIcon: '🌱', cropIcon: '🎃', color: 0xff5722, growTime: 8000 }
};

// ===============================================
// 5c. LATICÍNIOS (FÁBRICA)
// ===============================================
const dairyRecipes = {
  cheese:  { id: 'cheese',  name: 'Queijo',   icon: '🧀', milkCost: 3, sellPrice: 40, craftTime: 30000 },
  yogurt:  { id: 'yogurt',  name: 'Iogurte',  icon: '🥣', milkCost: 2, sellPrice: 24, craftTime: 30000 },
  cream:   { id: 'cream',   name: 'Creme',    icon: '🍶', milkCost: 1, sellPrice: 14, craftTime: 30000 },
  butter:  { id: 'butter',  name: 'Manteiga', icon: '🧈', milkCost: 4, sellPrice: 55, craftTime: 30000 }
};

const dairyFactoryPrice = 200;
const dairyFactoryPos = new THREE.Vector3(-14, 0, -14);
const dairyMaxSlots = 4;

const dairyState = {
  built: false,
  crafting: [] // até 4 itens simultâneos: { recipeId, startTime, endTime }
};

const playerData = {
  coins: 80,
  selectedSeed: 'wheat_seed',
  inventory: { 
    wheat_seed: 5, carrot_seed: 2, tomato_seed: 0, corn_seed: 0, pumpkin_seed: 0, 
    wheat: 0, carrot: 0, tomato: 0, corn: 0, pumpkin: 0,
    egg: 0, milk: 0, wool: 0,
    cheese: 0, yogurt: 0, cream: 0, butter: 0
  },
  animals: { chicken: 0, cow: 0, sheep: 0 }
};

window.changeSelectedSeed = function(seedId) { playerData.selectedSeed = seedId; };

function updateUIElements() {
  const coinsEl = document.getElementById('coins-count');
  const itemsList = document.getElementById('inventory-list-items');
  const animalsList = document.getElementById('inventory-list-animals');
  const seedsShopList = document.getElementById('shop-list-seeds');
  const animalsShopList = document.getElementById('shop-list-animals');
  const buildingsShopList = document.getElementById('shop-list-buildings');
  const selectEl = document.getElementById('seed-select');

  if (coinsEl) coinsEl.textContent = playerData.coins;
  if (selectEl) selectEl.value = playerData.selectedSeed;

  // Inventário de Itens
  if (itemsList) {
    itemsList.innerHTML = '';
    let empty = true;

    // Sementes
    Object.values(cropsData).forEach(crop => {
      const count = playerData.inventory[crop.id] || 0;
      if (count > 0) {
        empty = false;
        itemsList.innerHTML += `<div class="inventory-item"><span>${crop.seedIcon} ${crop.seedName}</span><span><b>x${count}</b></span></div>`;
      }
    });

    // Colheitas
    Object.values(cropsData).forEach(crop => {
      const count = playerData.inventory[crop.cropId] || 0;
      if (count > 0) {
        empty = false;
        itemsList.innerHTML += `<div class="inventory-item"><span>${crop.cropIcon} ${crop.name}</span><span><b>x${count}</b></span></div>`;
      }
    });

    // Produtos dos Animais
    Object.values(animalTypes).forEach(anim => {
      const count = playerData.inventory[anim.product] || 0;
      if (count > 0) {
        empty = false;
        itemsList.innerHTML += `<div class="inventory-item"><span>${anim.productIcon} ${anim.productName}</span><span><b>x${count}</b></span></div>`;
      }
    });

    // Laticínios
    Object.values(dairyRecipes).forEach(recipe => {
      const count = playerData.inventory[recipe.id] || 0;
      if (count > 0) {
        empty = false;
        itemsList.innerHTML += `<div class="inventory-item"><span>${recipe.icon} ${recipe.name}</span><span><b>x${count}</b></span></div>`;
      }
    });

    if (empty) itemsList.innerHTML = '<p style="color:#aaa; font-size:14px; text-align:center;">Nenhum item no inventário</p>';
  }

  // Inventário de Animais
  if (animalsList) {
    animalsList.innerHTML = '';
    let empty = true;

    Object.values(animalTypes).forEach(anim => {
      const count = playerData.animals[anim.id] || 0;
      if (count > 0) {
        empty = false;
        animalsList.innerHTML += `<div class="inventory-item"><span>${anim.icon} ${anim.name}s no Cercado</span><span><b>x${count}</b></span></div>`;
      }
    });

    if (empty) animalsList.innerHTML = '<p style="color:#aaa; font-size:14px; text-align:center;">Você ainda não possui animais</p>';
  }

  // Loja de Sementes e Produtos
  if (seedsShopList) {
    seedsShopList.innerHTML = '<h4 style="margin: 5px 0; color:#ffeb3b;">🌱 Sementes & Colheitas</h4>';
    
    Object.values(cropsData).forEach(crop => {
      const harvestedCount = playerData.inventory[crop.cropId] || 0;
      seedsShopList.innerHTML += `
        <div class="shop-item">
          <div>
            <div><b>${crop.cropIcon} ${crop.name}</b></div>
            <small style="color:#d7ccc8">Comprar Semente: 💰${crop.buyPrice} | Vender Fruto: 💰${crop.sellPrice}</small>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="buy-btn" onclick="buySeed('${crop.id}')">Comprar</button>
            <button class="sell-btn" onclick="sellItem('${crop.cropId}', ${crop.sellPrice})">Vender (${harvestedCount})</button>
          </div>
        </div>
      `;
    });

    seedsShopList.innerHTML += '<h4 style="margin: 15px 0 5px 0; color:#ffeb3b;">📦 Produtos dos Animais</h4>';
    Object.values(animalTypes).forEach(anim => {
      const prodCount = playerData.inventory[anim.product] || 0;
      seedsShopList.innerHTML += `
        <div class="shop-item">
          <div>
            <div><b>${anim.productIcon} ${anim.productName}</b></div>
            <small style="color:#d7ccc8">Preço de Venda: 💰${anim.productPrice}</small>
          </div>
          <button class="sell-btn" onclick="sellItem('${anim.product}', ${anim.productPrice})">Vender (${prodCount})</button>
        </div>
      `;
    });

    seedsShopList.innerHTML += '<h4 style="margin: 15px 0 5px 0; color:#ffeb3b;">🧀 Laticínios</h4>';
    Object.values(dairyRecipes).forEach(recipe => {
      const prodCount = playerData.inventory[recipe.id] || 0;
      seedsShopList.innerHTML += `
        <div class="shop-item">
          <div>
            <div><b>${recipe.icon} ${recipe.name}</b></div>
            <small style="color:#d7ccc8">Preço de Venda: 💰${recipe.sellPrice}</small>
          </div>
          <button class="sell-btn" onclick="sellItem('${recipe.id}', ${recipe.sellPrice})">Vender (${prodCount})</button>
        </div>
      `;
    });
  }

  // Loja de Animais
  if (animalsShopList) {
    animalsShopList.innerHTML = '';
    Object.values(animalTypes).forEach(anim => {
      animalsShopList.innerHTML += `
        <div class="shop-item">
          <div>
            <div><b>${anim.icon} ${anim.name}</b></div>
            <small style="color:#d7ccc8">Preço: 💰${anim.price} | Produz: ${anim.productIcon} ${anim.productName}</small>
          </div>
          <button class="buy-btn" onclick="buyAnimal('${anim.id}')">Comprar</button>
        </div>
      `;
    });
  }

  // Loja de Construções
  if (buildingsShopList) {
    buildingsShopList.innerHTML = '';
    if (dairyState.built) {
      buildingsShopList.innerHTML = `
        <div class="shop-item">
          <div>
            <div><b>🏭 Fábrica de Laticínios</b></div>
            <small style="color:#d7ccc8">Já construída na sua fazenda ✅</small>
          </div>
        </div>
      `;
    } else {
      buildingsShopList.innerHTML = `
        <div class="shop-item">
          <div>
            <div><b>🏭 Fábrica de Laticínios</b></div>
            <small style="color:#d7ccc8">Preço: 💰${dairyFactoryPrice} | Transforma 🥛 Leite em Queijo, Iogurte, Creme e Manteiga</small>
          </div>
          <button class="buy-btn" onclick="buyDairyFactory()">Comprar</button>
        </div>
      `;
    }
  }
}

window.buySeed = function(seedId) {
  const crop = cropsData[seedId];
  if (playerData.coins >= crop.buyPrice) {
    playerData.coins -= crop.buyPrice;
    playerData.inventory[seedId] = (playerData.inventory[seedId] || 0) + 1;
    playSound('buy');
    updateUIElements();
  }
};

window.sellItem = function(itemId, price) {
  if (playerData.inventory[itemId] && playerData.inventory[itemId] > 0) {
    playerData.inventory[itemId] -= 1;
    playerData.coins += price;
    playSound('buy');
    updateUIElements();
    registerQuestAction('sell');
  }
};

window.buyAnimal = function(type) {
  const anim = animalTypes[type];
  if (playerData.coins >= anim.price) {
    playerData.coins -= anim.price;
    playerData.animals[type] = (playerData.animals[type] || 0) + 1;
    spawnAnimal3D(type);
    playSound('buy');
    updateUIElements();
  }
};

window.buyDairyFactory = function() {
  if (dairyState.built || playerData.coins < dairyFactoryPrice) return;
  playerData.coins -= dairyFactoryPrice;
  dairyState.built = true;
  dairyFactoryMesh = createDairyFactoryBuilding(dairyFactoryPos.x, dairyFactoryPos.z);
  playSound('buy');
  updateUIElements();
};

window.startDairyCraft = function(recipeId) {
  if (dairyState.crafting.length >= dairyMaxSlots) return; // todos os 4 slots ocupados
  const recipe = dairyRecipes[recipeId];
  if (!recipe) return;
  if ((playerData.inventory.milk || 0) < recipe.milkCost) return;

  playerData.inventory.milk -= recipe.milkCost;
  const now = Date.now();
  dairyState.crafting.push({ recipeId, startTime: now, endTime: now + recipe.craftTime });
  playSound('buy');
  updateUIElements();
  renderDairyModal();
};

function finishDairyCraftIfDone() {
  if (dairyState.crafting.length === 0) return false;
  const now = Date.now();
  const stillCrafting = [];
  let anyFinished = false;

  dairyState.crafting.forEach(job => {
    if (now >= job.endTime) {
      const recipe = dairyRecipes[job.recipeId];
      playerData.inventory[recipe.id] = (playerData.inventory[recipe.id] || 0) + 1;
      anyFinished = true;
    } else {
      stillCrafting.push(job);
    }
  });

  dairyState.crafting = stillCrafting;
  if (anyFinished) updateUIElements();
  return anyFinished;
}

function renderDairyModal() {
  const milkCountEl = document.getElementById('dairy-milk-count');
  const progressBox = document.getElementById('dairy-progress-box');
  const recipesList = document.getElementById('dairy-recipes-list');
  if (!milkCountEl || !recipesList) return;

  milkCountEl.textContent = playerData.inventory.milk || 0;

  if (dairyState.crafting.length > 0) {
    progressBox.classList.remove('hidden');
    progressBox.innerHTML = dairyState.crafting.map(job => {
      const recipe = dairyRecipes[job.recipeId];
      const total = recipe.craftTime;
      const elapsed = Math.min(total, Date.now() - job.startTime);
      const pct = (elapsed / total) * 100;
      const remainingSec = Math.max(0, Math.ceil((total - elapsed) / 1000));
      return `
        <div class="quest-card" style="margin-bottom:10px;">
          <div class="quest-header">
            <span class="quest-badge">⚙️ PRODUZINDO</span>
            <span>${recipe.icon}</span>
          </div>
          <h3 style="margin:4px 0 2px 0;">${recipe.name}</h3>
          <div class="quest-progress-bar">
            <div style="width:${pct}%; height:100%; background:#4caf50; transition: width 0.3s ease;"></div>
          </div>
          <div class="quest-count-text">${remainingSec}s restantes</div>
        </div>
      `;
    }).join('');
  } else {
    progressBox.classList.add('hidden');
    progressBox.innerHTML = '';
  }

  const slotsUsed = dairyState.crafting.length;
  const slotsFull = slotsUsed >= dairyMaxSlots;

  recipesList.innerHTML = `<p style="text-align:center; color:#d7ccc8; font-size:13px; margin-bottom:10px;">Produzindo ${slotsUsed}/${dairyMaxSlots} de uma vez</p>`;
  Object.values(dairyRecipes).forEach(recipe => {
    const hasMilk = (playerData.inventory.milk || 0) >= recipe.milkCost;
    const disabled = slotsFull || !hasMilk;
    recipesList.innerHTML += `
      <div class="dairy-recipe-card">
        <div class="recipe-info">
          <div><b>${recipe.icon} ${recipe.name}</b></div>
          <small>Custa: 🥛${recipe.milkCost} Leite • ⏱ 30s • Venda: 💰${recipe.sellPrice}</small>
        </div>
        <button class="buy-btn" ${disabled ? 'disabled' : ''} onclick="startDairyCraft('${recipe.id}')">Produzir</button>
      </div>
    `;
  });
}

let dairyModalInterval = null;
function openDairyModal() {
  const modal = document.getElementById('dairy-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  renderDairyModal();
  if (dairyModalInterval) clearInterval(dairyModalInterval);
  dairyModalInterval = setInterval(() => {
    finishDairyCraftIfDone();
    renderDairyModal();
  }, 500);
}

function closeDairyModal() {
  const modal = document.getElementById('dairy-modal');
  if (modal) modal.classList.add('hidden');
  if (dairyModalInterval) {
    clearInterval(dairyModalInterval);
    dairyModalInterval = null;
  }
}

// Funções de Abas
window.switchShopTab = function(tab) {
  const seedsDiv = document.getElementById('shop-list-seeds');
  const animalsDiv = document.getElementById('shop-list-animals');
  const buildingsDiv = document.getElementById('shop-list-buildings');
  const btnSeeds = document.getElementById('tab-shop-seeds');
  const btnAnimals = document.getElementById('tab-shop-animals');
  const btnBuildings = document.getElementById('tab-shop-buildings');

  seedsDiv.classList.add('hidden');
  animalsDiv.classList.add('hidden');
  buildingsDiv.classList.add('hidden');
  btnSeeds.classList.remove('active');
  btnAnimals.classList.remove('active');
  btnBuildings.classList.remove('active');

  if (tab === 'seeds') {
    seedsDiv.classList.remove('hidden');
    btnSeeds.classList.add('active');
  } else if (tab === 'animals') {
    animalsDiv.classList.remove('hidden');
    btnAnimals.classList.add('active');
  } else {
    buildingsDiv.classList.remove('hidden');
    btnBuildings.classList.add('active');
  }
};

window.switchInvTab = function(tab) {
  const itemsDiv = document.getElementById('inventory-list-items');
  const animalsDiv = document.getElementById('inventory-list-animals');
  const btns = document.querySelectorAll('#inventory-modal .tab-btn');

  if (tab === 'items') {
    itemsDiv.classList.remove('hidden');
    animalsDiv.classList.add('hidden');
    btns[0].classList.add('active');
    btns[1].classList.remove('active');
  } else {
    itemsDiv.classList.add('hidden');
    animalsDiv.classList.remove('hidden');
    btns[0].classList.remove('active');
    btns[1].classList.add('active');
  }
};

// ===============================================
// 5b. MODELOS DE CRESCIMENTO DAS PLANTAÇÕES (por estágio)
// ===============================================
// Cada cultura tem 4 estágios visuais distintos:
// 0 = sementes plantadas | 1 = broto | 2 = crescendo | 3 = madura (pronta pra colher)

function disposeObject3D(obj) {
  obj.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
      else child.material.dispose();
    }
  });
}

function addCropPart(group, geometry, color, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color }));
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

const cropStageBuilders = {
  // ---------------- TRIGO: várias sementes amarelas -> grandes brotos dourados ----------------
  wheat: [
    // 0: sementes espalhadas na terra
    () => {
      const g = new THREE.Group();
      const positions = [[-0.1, -0.06], [0.08, 0.05], [-0.02, 0.1], [0.12, -0.08]];
      positions.forEach(([x, z]) => addCropPart(g, new THREE.SphereGeometry(0.045, 6, 6), 0xffeb3b, x, 0.05, z));
      return g;
    },
    // 1: pequenos brotos verdes
    () => {
      const g = new THREE.Group();
      const positions = [[-0.1, -0.06], [0.08, 0.05], [-0.02, 0.1], [0.12, -0.08]];
      positions.forEach(([x, z]) => addCropPart(g, new THREE.CylinderGeometry(0.02, 0.03, 0.22, 6), 0x8bc34a, x, 0.11, z));
      return g;
    },
    // 2: talos verdes mais altos, pontas amarelando
    () => {
      const g = new THREE.Group();
      const positions = [[-0.12, -0.08], [0.1, 0.06], [-0.02, 0.12], [0.13, -0.1], [0, -0.02]];
      positions.forEach(([x, z]) => {
        addCropPart(g, new THREE.CylinderGeometry(0.02, 0.03, 0.42, 6), 0x9ccc65, x, 0.21, z);
        addCropPart(g, new THREE.ConeGeometry(0.035, 0.1, 6), 0xdce775, x, 0.44, z);
      });
      return g;
    },
    // 3: trigo maduro dourado, pronto pra colher
    () => {
      const g = new THREE.Group();
      const positions = [[-0.13, -0.09], [0.11, 0.07], [-0.03, 0.13], [0.14, -0.11], [0, -0.02], [-0.06, 0.05]];
      positions.forEach(([x, z]) => {
        addCropPart(g, new THREE.CylinderGeometry(0.02, 0.03, 0.6, 6), 0xc0a955, x, 0.3, z);
        addCropPart(g, new THREE.ConeGeometry(0.05, 0.22, 6), 0xffeb3b, x, 0.68, z);
      });
      return g;
    }
  ],

  // ---------------- CENOURA: broto verde -> folhagem com topo laranja aparecendo ----------------
  carrot: [
    () => {
      const g = new THREE.Group();
      addCropPart(g, new THREE.SphereGeometry(0.05, 6, 6), 0xff9800, 0, 0.05, 0);
      return g;
    },
    () => {
      const g = new THREE.Group();
      [[-0.05, 0], [0.05, 0.02], [0, -0.05]].forEach(([x, z]) => addCropPart(g, new THREE.ConeGeometry(0.03, 0.16, 6), 0x66bb6a, x, 0.1, z));
      return g;
    },
    () => {
      const g = new THREE.Group();
      [[-0.07, 0], [0.07, 0.03], [0, -0.06], [0.02, 0.06]].forEach(([x, z]) => addCropPart(g, new THREE.ConeGeometry(0.035, 0.26, 6), 0x4caf50, x, 0.17, z));
      addCropPart(g, new THREE.ConeGeometry(0.08, 0.12, 8), 0xff9800, 0, 0.06, 0, Math.PI);
      return g;
    },
    () => {
      const g = new THREE.Group();
      [[-0.08, 0], [0.08, 0.03], [0, -0.07], [0.03, 0.07], [-0.04, -0.04]].forEach(([x, z]) => addCropPart(g, new THREE.ConeGeometry(0.04, 0.32, 6), 0x388e3c, x, 0.22, z));
      addCropPart(g, new THREE.ConeGeometry(0.12, 0.32, 8), 0xff9800, 0, 0.08, 0, Math.PI);
      return g;
    }
  ],

  // ---------------- TOMATE: mudinha -> arbusto com frutos vermelhos ----------------
  tomato: [
    () => {
      const g = new THREE.Group();
      addCropPart(g, new THREE.SphereGeometry(0.045, 6, 6), 0x8d3b2b, 0, 0.05, 0);
      return g;
    },
    () => {
      const g = new THREE.Group();
      addCropPart(g, new THREE.CylinderGeometry(0.02, 0.025, 0.24, 6), 0x4caf50, 0, 0.12, 0);
      addCropPart(g, new THREE.BoxGeometry(0.12, 0.02, 0.08), 0x66bb6a, 0.08, 0.2, 0, 0, 0, 0.3);
      return g;
    },
    () => {
      const g = new THREE.Group();
      addCropPart(g, new THREE.SphereGeometry(0.14, 8, 8), 0x4caf50, 0, 0.24, 0);
      [[0.1, 0.28, 0.08], [-0.09, 0.32, -0.05]].forEach(([x, y, z]) => addCropPart(g, new THREE.SphereGeometry(0.045, 8, 8), 0x8bc34a, x, y, z));
      return g;
    },
    () => {
      const g = new THREE.Group();
      addCropPart(g, new THREE.SphereGeometry(0.17, 8, 8), 0x388e3c, 0, 0.28, 0);
      const fruitSpots = [[0.13, 0.3, 0.08], [-0.12, 0.35, -0.06], [0.02, 0.42, 0.1], [-0.05, 0.2, 0.13]];
      fruitSpots.forEach(([x, y, z]) => {
        addCropPart(g, new THREE.SphereGeometry(0.075, 8, 8), 0xe53935, x, y, z);
        addCropPart(g, new THREE.ConeGeometry(0.02, 0.04, 5), 0x388e3c, x, y + 0.07, z);
      });
      return g;
    }
  ],

  // ---------------- MILHO: broto -> talo alto com espigas amarelas ----------------
  corn: [
    () => {
      const g = new THREE.Group();
      addCropPart(g, new THREE.SphereGeometry(0.045, 6, 6), 0xcddc39, 0, 0.05, 0);
      return g;
    },
    () => {
      const g = new THREE.Group();
      addCropPart(g, new THREE.CylinderGeometry(0.03, 0.04, 0.3, 6), 0x66bb6a, 0, 0.15, 0);
      return g;
    },
    () => {
      const g = new THREE.Group();
      addCropPart(g, new THREE.CylinderGeometry(0.035, 0.05, 0.6, 6), 0x4caf50, 0, 0.3, 0);
      addCropPart(g, new THREE.BoxGeometry(0.28, 0.03, 0.1), 0x66bb6a, 0.16, 0.4, 0, 0, 0, 0.4);
      addCropPart(g, new THREE.BoxGeometry(0.28, 0.03, 0.1), 0x66bb6a, -0.16, 0.5, 0, 0, 0, -0.4);
      return g;
    },
    () => {
      const g = new THREE.Group();
      addCropPart(g, new THREE.CylinderGeometry(0.04, 0.06, 1.0, 6), 0x388e3c, 0, 0.5, 0);
      addCropPart(g, new THREE.BoxGeometry(0.34, 0.04, 0.12), 0x4caf50, 0.2, 0.65, 0, 0, 0, 0.4);
      addCropPart(g, new THREE.BoxGeometry(0.34, 0.04, 0.12), 0x4caf50, -0.2, 0.8, 0, 0, 0, -0.4);
      addCropPart(g, new THREE.CylinderGeometry(0.06, 0.07, 0.32, 8), 0xffc107, 0.12, 0.55, 0.08, 0, 0, 0.25);
      addCropPart(g, new THREE.CylinderGeometry(0.06, 0.07, 0.3, 8), 0xffc107, -0.1, 0.42, -0.06, 0, 0, -0.2);
      return g;
    }
  ],

  // ---------------- ABÓBORA: vinha rasteira -> grande abóbora laranja ----------------
  pumpkin: [
    () => {
      const g = new THREE.Group();
      addCropPart(g, new THREE.SphereGeometry(0.05, 6, 6), 0x6d4c41, 0, 0.05, 0);
      return g;
    },
    () => {
      const g = new THREE.Group();
      const flat = new THREE.SphereGeometry(0.08, 8, 8);
      addCropPart(g, flat, 0x66bb6a, 0, 0.06, 0, 0, 0, 0).scale.set(1, 0.4, 1);
      return g;
    },
    () => {
      const g = new THREE.Group();
      [[-0.1, 0.05, 0], [0.1, 0.05, 0.05], [0, 0.05, -0.1]].forEach(([x, y, z]) => {
        const leaf = addCropPart(g, new THREE.SphereGeometry(0.11, 8, 8), 0x4caf50, x, y, z);
        leaf.scale.set(1, 0.35, 1);
      });
      addCropPart(g, new THREE.SphereGeometry(0.09, 8, 8), 0xff9800, 0, 0.09, 0.02).scale.set(1, 0.85, 1);
      return g;
    },
    () => {
      const g = new THREE.Group();
      [[-0.22, 0.04, 0.15], [0.2, 0.04, -0.12], [-0.05, 0.04, -0.22]].forEach(([x, y, z]) => {
        const leaf = addCropPart(g, new THREE.SphereGeometry(0.12, 8, 8), 0x388e3c, x, y, z);
        leaf.scale.set(1, 0.3, 1);
      });
      const pumpkinMesh = addCropPart(g, new THREE.SphereGeometry(0.26, 10, 10), 0xff6f00, 0, 0.22, 0);
      pumpkinMesh.scale.set(1, 0.82, 1);
      addCropPart(g, new THREE.BoxGeometry(0.06, 0.12, 0.06), 0x5d4037, 0, 0.42, 0);
      return g;
    }
  ]
};

function buildCropStageModel(cropId, stage) {
  const builders = cropStageBuilders[cropId];
  const clampedStage = Math.max(0, Math.min(stage, builders.length - 1));
  const group = builders[clampedStage]();
  group.userData.spawnTime = Date.now();
  group.userData.sway = (cropId === 'wheat' || cropId === 'corn') && clampedStage === builders.length - 1;
  group.userData.swayOffset = Math.random() * Math.PI * 2;
  group.scale.set(0.5, 0.5, 0.5); // começa pequeno e "nasce" com efeito de pop
  return group;
}

function setCropStage(plot, stage) {
  const crop = plot.userData.plantedCrop;
  if (!crop) return;

  if (plot.userData.cropMesh) {
    scene.remove(plot.userData.cropMesh);
    disposeObject3D(plot.userData.cropMesh);
  }

  const group = buildCropStageModel(crop.cropId, stage);
  group.position.set(plot.position.x, 0.1, plot.position.z);
  scene.add(group);

  plot.userData.cropMesh = group;
  plot.userData.cropStage = stage;
}

// Anima o "nascimento" (pop-in) e o balanço com o vento das plantações maduras
function updateCropAnimations() {
  const now = Date.now();
  plots.forEach(plot => {
    const mesh = plot.userData.cropMesh;
    if (!mesh) return;

    const elapsed = now - mesh.userData.spawnTime;
    if (elapsed < 250) {
      const t = elapsed / 250;
      const s = 0.5 + 0.5 * t;
      mesh.scale.set(s, s, s);
    } else if (mesh.scale.x !== 1) {
      mesh.scale.set(1, 1, 1);
    }

    if (mesh.userData.sway) {
      mesh.rotation.z = Math.sin(now * 0.0018 + mesh.userData.swayOffset) * 0.06;
    }
  });
}

// ===============================================
// 6. CANTEIROS & CRESCIMENTO DAS PLANTAS
// ===============================================
const plotSize = 2.5;
const plots = [];

const plotMaterials = {
  grass: new THREE.MeshLambertMaterial({ color: 0x66bb6a }),
  tilled: new THREE.MeshLambertMaterial({ color: 0x5d4037 }),
  watered: new THREE.MeshLambertMaterial({ color: 0x3e2723 })
};

const gridRows = 3;
const gridCols = 3;

for (let r = 0; r < gridRows; r++) {
  for (let c = 0; c < gridCols; c++) {
    const geo = new THREE.BoxGeometry(plotSize - 0.3, 0.1, plotSize - 0.3);
    const plot = new THREE.Mesh(geo, plotMaterials.grass.clone());

    plot.position.x = (c - (gridCols - 1) / 2) * plotSize;
    plot.position.z = (r - (gridRows - 1) / 2) * plotSize - 5;
    plot.position.y = 0.05;
    plot.castShadow = true;
    plot.receiveShadow = true;

    plot.userData = { state: 0, cropMesh: null, plantedCrop: null, timer: null };
    scene.add(plot);
    plots.push(plot);
  }
}

function triggerCropGrowth(plot) {
  const crop = plot.userData.plantedCrop;
  if (!crop) return;

  // Agenda as transições visuais de crescimento: broto -> crescendo -> madura
  const timers = [];

  timers.push(setTimeout(() => {
    if (plot.userData.state === 3) setCropStage(plot, 1);
  }, crop.growTime * 0.35));

  timers.push(setTimeout(() => {
    if (plot.userData.state === 3) setCropStage(plot, 2);
  }, crop.growTime * 0.7));

  timers.push(setTimeout(() => {
    if (plot.userData.state === 3) {
      setCropStage(plot, 3);
      plot.userData.state = 4;
    }
  }, crop.growTime));

  plot.userData.timer = timers;
}

// ===============================================
// 7. PERSONAGEM E COLISÃO
// ===============================================
const playerGroup = new THREE.Group();

// --- Materiais do fazendeiro ---
const skinMat  = new THREE.MeshLambertMaterial({ color: 0x5c3a21 }); // pele
const shirtMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f0 }); // camisa branca
const pantsMat = new THREE.MeshLambertMaterial({ color: 0x1e4d8b }); // calça azul
const bootMat  = new THREE.MeshLambertMaterial({ color: 0x1a1a1a }); // botas pretas
const hatMat   = new THREE.MeshLambertMaterial({ color: 0xdab35c }); // chapéu de palha
const eyeMat   = new THREE.MeshBasicMaterial({ color: 0x1a1108 });   // olhos
const mouthMat = new THREE.MeshBasicMaterial({ color: 0x3e2313 });   // boca

// --- Pernas (grupo com pivô no quadril, usado na animação de andar) ---
function createLeg(xOffset) {
  const legGroup = new THREE.Group();

  const pantsGeo = new THREE.BoxGeometry(0.22, 0.55, 0.24);
  const pantsMesh = new THREE.Mesh(pantsGeo, pantsMat);
  pantsMesh.position.y = -0.275;
  legGroup.add(pantsMesh);

  const bootGeo = new THREE.BoxGeometry(0.24, 0.18, 0.28);
  const bootMesh = new THREE.Mesh(bootGeo, bootMat);
  bootMesh.position.y = -0.55 - 0.09;
  legGroup.add(bootMesh);

  legGroup.position.set(xOffset, 0.8, 0);
  return legGroup;
}

const legL = createLeg(-0.13);
const legR = createLeg(0.13);
playerGroup.add(legL, legR);

// --- Tronco (camisa branca) ---
const torsoGeo = new THREE.BoxGeometry(0.55, 0.7, 0.32);
const torso = new THREE.Mesh(torsoGeo, shirtMat);
torso.position.y = 0.8 + 0.35;
playerGroup.add(torso);

// --- Braços (grupo com pivô no ombro, usado na animação de andar) ---
function createArm(xOffset) {
  const armGroup = new THREE.Group();

  const sleeveGeo = new THREE.BoxGeometry(0.18, 0.42, 0.2);
  const sleeveMesh = new THREE.Mesh(sleeveGeo, shirtMat);
  sleeveMesh.position.y = -0.21;
  armGroup.add(sleeveMesh);

  const handGeo = new THREE.BoxGeometry(0.16, 0.16, 0.18);
  const handMesh = new THREE.Mesh(handGeo, skinMat);
  handMesh.position.y = -0.42 - 0.08;
  armGroup.add(handMesh);

  armGroup.position.set(xOffset, 1.5, 0);
  return armGroup;
}

const armL = createArm(-0.365);
const armR = createArm(0.365);
playerGroup.add(armL, armR);

// --- Cabeça (rosto + chapéu de palha) ---
const headGroup = new THREE.Group();

const headGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
const head = new THREE.Mesh(headGeo, skinMat);
headGroup.add(head);

const eyeGeo = new THREE.BoxGeometry(0.06, 0.06, 0.03);
const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
eyeL.position.set(-0.1, 0.04, 0.215);
const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
eyeR.position.set(0.1, 0.04, 0.215);
headGroup.add(eyeL, eyeR);

const mouthGeo = new THREE.BoxGeometry(0.16, 0.04, 0.03);
const mouth = new THREE.Mesh(mouthGeo, mouthMat);
mouth.position.set(0, -0.1, 0.215);
headGroup.add(mouth);

const hatBrimGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.05, 16);
const hatBrim = new THREE.Mesh(hatBrimGeo, hatMat);
hatBrim.position.y = 0.235;
headGroup.add(hatBrim);

const hatTopGeo = new THREE.CylinderGeometry(0.16, 0.28, 0.22, 16);
const hatTop = new THREE.Mesh(hatTopGeo, hatMat);
hatTop.position.y = 0.235 + 0.11;
headGroup.add(hatTop);

headGroup.position.y = 1.5 + 0.23;
playerGroup.add(headGroup);

playerGroup.position.set(0, 0, 3);
playerGroup.traverse((child) => {
  if (child.isMesh) {
    child.castShadow = true;
    child.receiveShadow = true;
  }
});
scene.add(playerGroup);

let walkCycle = 0;

const playerBox = new THREE.Box3();
const playerRadius = 0.5;

// ===============================================
// 8. CONTROLES E INTERAÇÕES
// ===============================================
const keys = { w: false, a: false, s: false, d: false };
const actionPrompt = document.getElementById('action-prompt');
const promptText = document.getElementById('prompt-text');

function cycleSelectedSeed() {
  const seedKeys = Object.keys(cropsData);
  const currentIndex = seedKeys.indexOf(playerData.selectedSeed);
  const nextIndex = (currentIndex + 1) % seedKeys.length;
  changeSelectedSeed(seedKeys[nextIndex]);
}

window.addEventListener('keydown', (e) => {
  if (!isGameStarted) return;
  const key = e.key.toLowerCase();
  if (keys.hasOwnProperty(key)) keys[key] = true;
  if (key === 'e') handleGlobalInteraction();
  if (key === 'q') cycleSelectedSeed();
  if (key === 'escape') {
    if (!pauseModal.classList.contains('hidden')) {
      closePauseMenu();
    } else if (!isAnyOtherModalOpen()) {
      openPauseMenu();
    }
  }
});

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  if (keys.hasOwnProperty(key)) keys[key] = false;
});

// Corrige o bug de "movimento travado": se a janela/aba perde o foco
// (troca de aba, abre um modal, minimiza, etc.), o navegador pode não
// disparar o evento 'keyup', deixando o personagem andando sozinho.
// Resetamos todas as teclas sempre que o foco é perdido.
function resetAllKeys() {
  keys.w = false;
  keys.a = false;
  keys.s = false;
  keys.d = false;
  resetJoystick();
  stopAllAnimalSounds();
}
window.addEventListener('blur', resetAllKeys);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) resetAllKeys();
});

// ---------------- JOYSTICK VIRTUAL (MOBILE) ----------------
const joystickZone = document.getElementById('joystick-zone');
const joystickBase = document.getElementById('joystick-base');
const joystickKnob = document.getElementById('joystick-knob');
const joystickVector = { x: 0, z: 0 };
let joystickTouchId = null;
let joystickCenter = { x: 0, y: 0 };
const joystickMaxDist = 45;

function resetJoystick() {
  joystickVector.x = 0;
  joystickVector.z = 0;
  joystickTouchId = null;
  if (joystickKnob) joystickKnob.style.transform = 'translate(0px, 0px)';
}

function updateJoystickFromPoint(clientX, clientY) {
  let dx = clientX - joystickCenter.x;
  let dy = clientY - joystickCenter.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > joystickMaxDist) {
    dx = (dx / dist) * joystickMaxDist;
    dy = (dy / dist) * joystickMaxDist;
  }
  if (joystickKnob) joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;

  let nx = dx / joystickMaxDist;
  let nz = dy / joystickMaxDist;
  // Zona morta pequena para evitar drift/tremulação perto do centro
  if (Math.abs(nx) < 0.15) nx = 0;
  if (Math.abs(nz) < 0.15) nz = 0;
  joystickVector.x = nx;
  joystickVector.z = nz;
}

if (joystickZone) {
  joystickZone.addEventListener('touchstart', (e) => {
    const touch = e.changedTouches[0];
    joystickTouchId = touch.identifier;
    const rect = joystickBase.getBoundingClientRect();
    joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    updateJoystickFromPoint(touch.clientX, touch.clientY);
    e.preventDefault();
  }, { passive: false });

  joystickZone.addEventListener('touchmove', (e) => {
    for (const touch of e.changedTouches) {
      if (touch.identifier === joystickTouchId) {
        updateJoystickFromPoint(touch.clientX, touch.clientY);
      }
    }
    e.preventDefault();
  }, { passive: false });

  const endJoystickTouch = (e) => {
    for (const touch of e.changedTouches) {
      if (touch.identifier === joystickTouchId) resetJoystick();
    }
  };
  joystickZone.addEventListener('touchend', endJoystickTouch);
  joystickZone.addEventListener('touchcancel', endJoystickTouch);
}

// ---------------- BOTÕES DE AÇÃO MOBILE (INTERAGIR / TROCAR SEMENTE) ----------------
const btnMobileInteract = document.getElementById('btn-mobile-interact');
const btnMobileSeed = document.getElementById('btn-mobile-seed');

if (btnMobileInteract) {
  btnMobileInteract.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (isGameStarted) handleGlobalInteraction();
  }, { passive: false });
}
if (btnMobileSeed) {
  btnMobileSeed.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (isGameStarted) cycleSelectedSeed();
  }, { passive: false });
}

// Detecta dispositivo touch para exibir os controles mobile
function isTouchDevice() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

const moveSpeed = 0.15;
const cameraOffset = new THREE.Vector3(0, 8, 12);
const interactionDistance = 2.5;

// ===============================================
// SISTEMA DE PARTÍCULAS (efeitos visuais leves)
// ===============================================
// Pequenas esferas que nascem num ponto, voam/flutuam e desaparecem com fade.
// Usado para dar "vida" às ações de arar, plantar, regar e colher.
const activeParticles = [];

function spawnParticleBurst(position, options = {}) {
  const count = options.count || 8;
  const color = options.color || 0xffffff;
  const size = options.size || 0.07;
  const spread = options.spread !== undefined ? options.spread : 1;
  const gravity = options.gravity || 0; // negativo = puxa pra baixo (efeito de gota d'água)
  const life = options.life || 550;

  for (let i = 0; i < count; i++) {
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1, fog: false });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 6, 6), mat);
    mesh.position.set(
      position.x + (Math.random() - 0.5) * 0.35,
      position.y + 0.15 + Math.random() * 0.2,
      position.z + (Math.random() - 0.5) * 0.35
    );
    scene.add(mesh);

    const angle = Math.random() * Math.PI * 2;
    const speed = (0.015 + Math.random() * 0.02) * spread;
    activeParticles.push({
      mesh,
      vx: Math.cos(angle) * speed,
      vy: options.upward !== undefined ? options.upward : (0.025 + Math.random() * 0.02),
      vz: Math.sin(angle) * speed,
      gravity,
      startTime: Date.now(),
      life
    });
  }
}

function updateParticles() {
  if (activeParticles.length === 0) return;
  const now = Date.now();
  for (let i = activeParticles.length - 1; i >= 0; i--) {
    const p = activeParticles[i];
    const elapsed = now - p.startTime;
    if (elapsed >= p.life) {
      scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
      activeParticles.splice(i, 1);
      continue;
    }
    const t = elapsed / p.life;
    p.vy += p.gravity;
    p.mesh.position.x += p.vx;
    p.mesh.position.y += p.vy * (1 - t * 0.4);
    p.mesh.position.z += p.vz;
    p.mesh.material.opacity = 1 - t;
    const s = 1 - t * 0.4;
    p.mesh.scale.set(s, s, s);
  }
}

function handleGlobalInteraction() {
  // 1. Interagir com a Loja
  const distToShop = playerGroup.position.distanceTo(shopInteractionPos);
  if (distToShop <= 3.0) {
    shopModal.classList.remove('hidden');
    return;
  }

  // 1b. Interagir com a Fábrica de Laticínios
  if (dairyState.built) {
    const distToDairy = playerGroup.position.distanceTo(dairyInteractionPos);
    if (distToDairy <= 3.0) {
      openDairyModal();
      return;
    }
  }

  // 2. Coletar do Balão Flutuante dos Animais
  for (let key in animalTypes) {
    const animConfig = animalTypes[key];
    if (playerGroup.position.distanceTo(animConfig.collectPos) <= 2.2) {
      if (animConfig.currentStored > 0) {
        playerData.inventory[animConfig.product] = (playerData.inventory[animConfig.product] || 0) + animConfig.currentStored;
        animConfig.currentStored = 0;
        updateSignTexture(key); // Reseta o texto no balão
        playSound('drop');
        spawnParticleBurst(animConfig.collectPos, { count: 10, color: 0xffd54f, size: 0.08, spread: 1.2, upward: 0.045, life: 600 });
        updateUIElements();
      }
      return;
    }
  }

  // 3. Interagir com Horta
  interactWithNearestPlot();
}

function interactWithNearestPlot() {
  let nearestPlot = null;
  let minDistance = Infinity;

  plots.forEach((plot) => {
    const dist = playerGroup.position.distanceTo(plot.position);
    if (dist < minDistance) {
      minDistance = dist;
      nearestPlot = plot;
    }
  });

  if (nearestPlot && minDistance <= interactionDistance) {
    const state = nearestPlot.userData.state;

    if (state === 0) {
      nearestPlot.material = plotMaterials.tilled;
      nearestPlot.userData.state = 1;
      playSound('till');
      spawnParticleBurst(nearestPlot.position, { count: 9, color: 0x6d4c41, size: 0.06, spread: 1.3, upward: 0.02, life: 480 });
      registerQuestAction('till');
    } 
    else if (state === 1) {
      const activeSeedId = playerData.selectedSeed;
      const crop = cropsData[activeSeedId];
      if (playerData.inventory[activeSeedId] <= 0) return;

      playerData.inventory[activeSeedId] -= 1;
      updateUIElements();

      nearestPlot.userData.plantedCrop = crop;
      nearestPlot.userData.state = 2;
      setCropStage(nearestPlot, 0); // sementes plantadas na terra
      playSound('plant');
      spawnParticleBurst(nearestPlot.position, { count: 7, color: 0x8bc34a, size: 0.055, spread: 0.8, upward: 0.03, life: 500 });
      registerQuestAction('plant');
    } 
    else if (state === 2) {
      nearestPlot.material = plotMaterials.watered;
      nearestPlot.userData.state = 3;
      playSound('water');
      spawnParticleBurst(
        new THREE.Vector3(nearestPlot.position.x, nearestPlot.position.y + 0.6, nearestPlot.position.z),
        { count: 10, color: 0x4fc3f7, size: 0.05, spread: 0.5, upward: -0.01, gravity: -0.0035, life: 520 }
      );
      registerQuestAction('water');
      triggerCropGrowth(nearestPlot);
    }
    else if (state === 4) {
      const crop = nearestPlot.userData.plantedCrop;
      if (nearestPlot.userData.cropMesh) {
        scene.remove(nearestPlot.userData.cropMesh);
        disposeObject3D(nearestPlot.userData.cropMesh);
        nearestPlot.userData.cropMesh = null;
      }

      playerData.inventory[crop.cropId] = (playerData.inventory[crop.cropId] || 0) + 1;
      playSound('drop');
      spawnParticleBurst(nearestPlot.position, { count: 11, color: 0xffd54f, size: 0.07, spread: 1.1, upward: 0.045, life: 600 });
      updateUIElements();

      nearestPlot.material = plotMaterials.grass;
      nearestPlot.userData.state = 0;
      nearestPlot.userData.plantedCrop = null;
      if (nearestPlot.userData.timer) {
        nearestPlot.userData.timer.forEach(t => clearTimeout(t));
        nearestPlot.userData.timer = null;
      }
      registerQuestAction('harvest');
    }
  }
}

// Toca o som do animal (mugido, cacarejo, balido) em loop enquanto o jogador
// estiver perto do cercado, e para assim que ele se afasta. Só toca se o
// jogador já tiver comprado ao menos 1 daquele animal.
function checkAnimalApproachSounds() {
  for (let key in animalTypes) {
    const config = animalTypes[key];
    if (!config.penCenterVec) continue;

    const owned = (playerData.animals[key] || 0) > 0;
    const dist = playerGroup.position.distanceTo(config.penCenterVec);
    const isNear = owned && dist <= config.approachRadius;

    if (isNear) {
      startAnimalSound(key);
    } else {
      stopAnimalSound(key);
    }
  }
}

function checkProximityPrompts() {
  if (!isGameStarted) return;
  checkAnimalApproachSounds();
  const distToShop = playerGroup.position.distanceTo(shopInteractionPos);
  
  if (distToShop <= 3.0) {
    promptText.innerHTML = "Aperte <b>E</b> para entrar na Loja 🛒";
    actionPrompt.classList.remove('hidden');
    return;
  }

  if (dairyState.built) {
    const distToDairy = playerGroup.position.distanceTo(dairyInteractionPos);
    if (distToDairy <= 3.0) {
      promptText.innerHTML = "Aperte <b>E</b> para usar a Fábrica de Laticínios 🏭";
      actionPrompt.classList.remove('hidden');
      return;
    }
  }

  // Verifica se está perto de algum cercado
  let nearPenConfig = null;
  for (let key in animalTypes) {
    const config = animalTypes[key];
    if (playerGroup.position.distanceTo(config.collectPos) <= 2.2) {
      nearPenConfig = config;
      break;
    }
  }

  if (nearPenConfig) {
    if (nearPenConfig.currentStored > 0) {
      promptText.innerHTML = `Aperte <b>E</b> para coletar <b>${nearPenConfig.currentStored} ${nearPenConfig.productPlural} ${nearPenConfig.productIcon}</b>`;
    } else {
      promptText.innerHTML = `Balão: <b>0 ${nearPenConfig.productPlural} ${nearPenConfig.productIcon}</b> (Aguardando produção...)`;
    }
    actionPrompt.classList.remove('hidden');
    return;
  }

  let nearPlot = false;
  plots.forEach(plot => {
    if (playerGroup.position.distanceTo(plot.position) <= interactionDistance) {
      nearPlot = true;
      const state = plot.userData.state;
      if (state === 0) promptText.innerHTML = "Aperte <b>E</b> para Arar o solo 🚜";
      else if (state === 1) promptText.innerHTML = "Aperte <b>E</b> para Plantar 🌱";
      else if (state === 2) promptText.innerHTML = "Aperte <b>E</b> para Regar 💧";
      else if (state === 3) promptText.innerHTML = "A planta está crescendo... ⏳";
      else if (state === 4) promptText.innerHTML = "Aperte <b>E</b> para Colher ✨";
    }
  });

  if (nearPlot) actionPrompt.classList.remove('hidden');
  else actionPrompt.classList.add('hidden');
}

// ===============================================
// 9. EVENTOS DE MENUS E LOOP DE ANIMAÇÃO
// ===============================================
document.getElementById('btn-play').onclick = () => {
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  document.getElementById('quest-hud').classList.remove('hidden');
  isGameStarted = true;
  updateQuestHUD();
  unlockAudio();
  startBackgroundMusic();
  if (isTouchDevice()) {
    document.getElementById('mobile-controls').classList.remove('hidden');
  }
};

// ---------------- TELA CHEIA E MUDO ----------------
const btnFullscreen = document.getElementById('btn-fullscreen');
if (btnFullscreen) {
  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });
  document.addEventListener('fullscreenchange', () => {
    btnFullscreen.textContent = document.fullscreenElement ? '🗗' : '⛶';
  });
}

const btnMute = document.getElementById('btn-mute');
if (btnMute) {
  btnMute.addEventListener('click', () => toggleMute());
}

const inventoryModal = document.getElementById('inventory-modal');
const shopModal = document.getElementById('shop-modal');
const missionsModal = document.getElementById('missions-modal');
const achievementsModal = document.getElementById('achievements-modal');

// Verifica se algum modal/menu está aberto — usado para travar o movimento
// do personagem e evitar que ele ande sozinho ao reabrir a janela do jogo.
const allModalIds = ['inventory-modal', 'shop-modal', 'missions-modal', 'achievements-modal', 'dairy-modal', 'pause-modal'];
function isAnyModalOpen() {
  return allModalIds.some(id => {
    const el = document.getElementById(id);
    return el && !el.classList.contains('hidden');
  });
}

// Usado pela tecla ESC: só abre o menu de pausa se nenhum outro modal já estiver aberto
function isAnyOtherModalOpen() {
  return allModalIds.filter(id => id !== 'pause-modal').some(id => {
    const el = document.getElementById(id);
    return el && !el.classList.contains('hidden');
  });
}

document.getElementById('btn-achievements-menu').onclick = () => { resetAllKeys(); achievementsModal.classList.remove('hidden'); };
document.getElementById('close-achievements-btn').onclick = () => achievementsModal.classList.add('hidden');
document.getElementById('btn-open-missions-hud').onclick = () => { resetAllKeys(); renderMissionsModal(); missionsModal.classList.remove('hidden'); };
document.getElementById('close-missions-btn').onclick = () => missionsModal.classList.add('hidden');
document.getElementById('open-inventory-btn').onclick = () => { resetAllKeys(); inventoryModal.classList.remove('hidden'); };
document.getElementById('close-inventory-btn').onclick = () => inventoryModal.classList.add('hidden');
document.getElementById('close-shop-btn').onclick = () => shopModal.classList.add('hidden');

document.getElementById('close-dairy-btn').onclick = () => closeDairyModal();

// ---------------- MENU DE PAUSA ----------------
const pauseModal = document.getElementById('pause-modal');

function showPauseView(view) {
  document.getElementById('pause-main-view').classList.toggle('hidden', view !== 'main');
  document.getElementById('pause-confirm-restart').classList.toggle('hidden', view !== 'confirm-restart');
  document.getElementById('pause-controls-view').classList.toggle('hidden', view !== 'controls');
}

function updateSoundToggleButtonText() {
  const btn = document.getElementById('btn-sound-toggle');
  if (btn) btn.textContent = isMuted ? '🔇 Som: Desativado' : '🔊 Som: Ativado';
}

function openPauseMenu() {
  if (!isGameStarted) return;
  resetAllKeys();
  showPauseView('main');
  updateSoundToggleButtonText();
  pauseModal.classList.remove('hidden');
}

function closePauseMenu() {
  pauseModal.classList.add('hidden');
}

function togglePauseMenu() {
  if (pauseModal.classList.contains('hidden')) {
    openPauseMenu();
  } else {
    closePauseMenu();
  }
}

// Recarrega a página inteira: forma mais simples e segura de resetar 100%
// do estado do jogo (moedas, animais, plantações, missões, fábrica, etc.)
function restartGame() {
  location.reload();
}

// Volta para a tela de título SEM apagar o progresso (diferente de "Reiniciar")
function goToMainMenuFromPause() {
  closePauseMenu();
  isGameStarted = false;
  resetAllKeys();
  stopWalkSound();
  stopAllAnimalSounds();
  document.getElementById('main-menu').classList.remove('hidden');
  document.getElementById('hud').classList.add('hidden');
  document.getElementById('quest-hud').classList.add('hidden');
  document.getElementById('mobile-controls').classList.add('hidden');
}

document.getElementById('btn-pause-menu').addEventListener('click', () => togglePauseMenu());
document.getElementById('close-pause-btn').onclick = () => closePauseMenu();
document.getElementById('btn-resume').onclick = () => closePauseMenu();
document.getElementById('btn-sound-toggle').onclick = () => { toggleMute(); updateSoundToggleButtonText(); };
document.getElementById('btn-show-controls').onclick = () => showPauseView('controls');
document.getElementById('btn-back-from-controls').onclick = () => showPauseView('main');
document.getElementById('btn-restart').onclick = () => showPauseView('confirm-restart');
document.getElementById('btn-cancel-restart').onclick = () => showPauseView('main');
document.getElementById('btn-confirm-restart').onclick = () => restartGame();
document.getElementById('btn-main-menu').onclick = () => goToMainMenuFromPause();

function checkCollision(targetPosition) {
  playerBox.setFromCenterAndSize(
    new THREE.Vector3(targetPosition.x, 0.9, targetPosition.z),
    new THREE.Vector3(playerRadius * 2, 1.8, playerRadius * 2)
  );

  for (let collider of colliders) {
    if (playerBox.intersectsBox(collider)) return true;
  }
  return false;
}

function animate() {
  requestAnimationFrame(animate);

  animateDecorativeClouds();
  updateParticles();

  if (!isGameStarted) {
    const time = Date.now() * 0.0005;
    camera.position.x = Math.sin(time) * 15;
    camera.position.z = Math.cos(time) * 15;
    camera.position.y = 10;
    camera.lookAt(0, 0, -2);
  } else {
    const moveVector = new THREE.Vector3(0, 0, 0);
    if (!isAnyModalOpen()) {
      if (keys.w) moveVector.z -= 1;
      if (keys.s) moveVector.z += 1;
      if (keys.a) moveVector.x -= 1;
      if (keys.d) moveVector.x += 1;

      // Joystick mobile: se estiver sendo usado, ele define a direção do movimento
      if (joystickVector.x !== 0 || joystickVector.z !== 0) {
        moveVector.x = joystickVector.x;
        moveVector.z = joystickVector.z;
      }
    }

    if (moveVector.length() > 0) {
      moveVector.normalize();
      const targetX = playerGroup.position.x + moveVector.x * moveSpeed;
      if (!checkCollision(new THREE.Vector3(targetX, 0, playerGroup.position.z))) playerGroup.position.x = targetX;

      const targetZ = playerGroup.position.z + moveVector.z * moveSpeed;
      if (!checkCollision(new THREE.Vector3(playerGroup.position.x, 0, targetZ))) playerGroup.position.z = targetZ;

      playerGroup.rotation.y = Math.atan2(moveVector.x, moveVector.z);

      // Animação de andar: braços e pernas balançam em oposição
      walkCycle += 0.18;
      const swing = Math.sin(walkCycle) * 0.6;
      legL.rotation.x = swing;
      legR.rotation.x = -swing;
      armL.rotation.x = -swing;
      armR.rotation.x = swing;

      startWalkSound();
    } else {
      // Parado: pernas e braços voltam suavemente ao repouso
      walkCycle = 0;
      legL.rotation.x *= 0.7;
      legR.rotation.x *= 0.7;
      armL.rotation.x *= 0.7;
      armR.rotation.x *= 0.7;

      stopWalkSound();
    }

    camera.position.x = playerGroup.position.x + cameraOffset.x;
    camera.position.y = playerGroup.position.y + cameraOffset.y;
    camera.position.z = playerGroup.position.z + cameraOffset.z;

    camera.lookAt(playerGroup.position.x, playerGroup.position.y + 0.9, playerGroup.position.z);
    checkProximityPrompts();
    updateAnimalsMovement();
    animateFloatingBalloons(); // Faz os balões/nuvens flutuarem suavemente!
    updateCropAnimations(); // Anima nascimento e balanço das plantações
    if (dairyState.built && !dairyModalInterval) finishDairyCraftIfDone(); // finaliza craft mesmo com modal fechado
  }

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

updateUIElements();
animate();