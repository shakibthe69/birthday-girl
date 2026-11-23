import * as THREE from "three";
import { FontLoader } from "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/geometries/TextGeometry.js";

const canvas = document.querySelector("#dream-canvas");
const loading = document.querySelector("#loading");
const audio = document.querySelector("#birthday-audio");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const smallScreen = window.matchMedia("(max-width: 700px)").matches;
const sceneNames = ["A little surprise", "Birthday wishes", "Favorite memories", "Love notes", "A special gift", "One last wish"];
const colors = [0xff91bd, 0xc3a3ff, 0xf3cb82, 0xff627f, 0xffe6e9];
const loveNotes = [
  "Rifa, you are one of the most beautiful chapters of my life.",
  "Your smile has a way of making even ordinary days feel magical.",
  "I may not have the perfect words, but I hope you always know how special you are to me.",
  "May your life always be filled with happiness, peace, success, and endless reasons to smile.",
  "You deserve all the beautiful things this world has to offer.",
  "No matter how many birthdays pass, I hope life keeps giving you new reasons to be happy."
];

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: !smallScreen,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, smallScreen ? 1.25 : 1.65));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const world = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 15);
world.add(new THREE.AmbientLight(0x9b85c5, 1.8));
const keyLight = new THREE.PointLight(0xffc7a2, 45, 28);
keyLight.position.set(-5, 6, 8);
world.add(keyLight);
const roseLight = new THREE.PointLight(0xe46eac, 38, 24);
roseLight.position.set(6, -2, 7);
world.add(roseLight);
const goldLight = new THREE.PointLight(0xffdc9d, 25, 22);
goldLight.position.set(0, 3, 5);
world.add(goldLight);

const entranceGroup = new THREE.Group();
const celebrationGroup = new THREE.Group();
const memoryGroup = new THREE.Group();
const messageGroup = new THREE.Group();
const giftGroup = new THREE.Group();
const finalGroup = new THREE.Group();
world.add(entranceGroup, celebrationGroup, memoryGroup, messageGroup, giftGroup, finalGroup);
celebrationGroup.visible = false;
memoryGroup.visible = false;
messageGroup.visible = false;
giftGroup.visible = false;
finalGroup.visible = false;

const movingObjects = [];
const particleSystems = [];
let currentScene = 0;
let currentNote = 0;
let doorOpen = false;
let giftOpen = false;
let doorProgress = 0;
let cameraPush = 0;
let fireworkTimer = 1;
let audioStarted = false;

function makeStars() {
  const count = smallScreen ? 550 : 1100;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 34;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 21;
    positions[i * 3 + 2] = -4 - Math.random() * 15;
    sizes[i] = Math.random() * 1.4 + 0.4;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  const material = new THREE.PointsMaterial({
    color: 0xffe7d0,
    size: smallScreen ? 0.035 : 0.045,
    transparent: true,
    opacity: 0.84,
    sizeAttenuation: true
  });
  const stars = new THREE.Points(geometry, material);
  world.add(stars);
  return stars;
}
const stars = makeStars();

function addBalloon(group, index, total) {
  const material = new THREE.MeshStandardMaterial({
    color: colors[index % colors.length],
    roughness: 0.31,
    metalness: 0.08,
    emissive: colors[index % colors.length],
    emissiveIntensity: 0.1
  });
  const balloon = new THREE.Group();
  const scale = 0.43 + Math.random() * 0.48;
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.52, 18, 14), material);
  body.scale.set(0.88, 1.17, 0.82);
  balloon.add(body);
  const knot = new THREE.Mesh(
    new THREE.ConeGeometry(0.075, 0.16, 5),
    new THREE.MeshStandardMaterial({ color: colors[index % colors.length], roughness: 0.6 })
  );
  knot.position.y = -0.62;
  knot.rotation.x = Math.PI;
  balloon.add(knot);
  const stringPoints = [new THREE.Vector3(0, -0.68, 0), new THREE.Vector3(0.06, -1.02, 0), new THREE.Vector3(-0.02, -1.34, 0)];
  const string = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(stringPoints),
    new THREE.LineBasicMaterial({ color: 0xffe6dc, transparent: true, opacity: 0.46 })
  );
  balloon.add(string);
  balloon.scale.setScalar(scale);
  balloon.position.set((Math.random() - 0.5) * 20, -8 - Math.random() * 21, -1 - Math.random() * 12);
  balloon.userData = { speed: 0.55 + Math.random() * 1.05, sway: Math.random() * Math.PI * 2, baseX: balloon.position.x };
  group.add(balloon);
  movingObjects.push(balloon);
}

const balloonCount = smallScreen ? 72 : 145;
for (let i = 0; i < balloonCount; i += 1) {
  addBalloon(celebrationGroup, i, balloonCount);
  if (i % 3 === 0) addBalloon(finalGroup, i, balloonCount);
}

function makeDoor() {
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xe9bd7a, metalness: 0.72, roughness: 0.26, emissive: 0x7d4b28, emissiveIntensity: 0.28 });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 5.55, 0.22), frameMaterial);
  frame.position.set(0, 0.4, -2);
  entranceGroup.add(frame);
  const inner = new THREE.Mesh(
    new THREE.BoxGeometry(2.94, 5.3, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x21182e, roughness: 0.55, metalness: 0.15, emissive: 0x321d42, emissiveIntensity: 0.6 })
  );
  inner.position.set(0, 0.4, -1.84);
  entranceGroup.add(inner);
  const pivot = new THREE.Group();
  pivot.position.set(-1.43, 0.4, -1.63);
  entranceGroup.add(pivot);
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(2.84, 5.18, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x301e3b, roughness: 0.42, metalness: 0.32, emissive: 0x2a163a, emissiveIntensity: 0.32 })
  );
  slab.position.x = 1.42;
  pivot.add(slab);
  const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x4b2b4d, metalness: 0.33, roughness: 0.36, emissive: 0x5c2c50, emissiveIntensity: 0.26 });
  for (const [y, height] of [[1.14, 1.6], [-0.95, 1.48]]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.86, height, 0.045), panelMaterial);
    panel.position.set(1.42, y, 0.12);
    pivot.add(panel);
  }
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), new THREE.MeshStandardMaterial({ color: 0xffdb9b, metalness: 0.76, roughness: 0.18, emissive: 0xb6823d, emissiveIntensity: 0.25 }));
  knob.position.set(2.48, 0, 0.16);
  pivot.add(knob);
  entranceGroup.userData.pivot = pivot;
  const arch = new THREE.Mesh(new THREE.TorusGeometry(1.53, 0.055, 9, 60, Math.PI), frameMaterial);
  arch.position.set(0, 3.17, -1.9);
  arch.rotation.z = Math.PI;
  entranceGroup.add(arch);
  return pivot;
}
const doorPivot = makeDoor();

function makeCake() {
  const cake = new THREE.Group();
  const icing = new THREE.MeshStandardMaterial({ color: 0xffc3d7, roughness: 0.34, emissive: 0x6a2846, emissiveIntensity: 0.16 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.62, 0.76, 48), new THREE.MeshStandardMaterial({ color: 0xf4d4c3, roughness: 0.43 }));
  base.position.y = -3.2;
  cake.add(base);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.15, 0.68, 42), icing);
  top.position.y = -2.48;
  cake.add(top);
  const topIcing = new THREE.Mesh(new THREE.CylinderGeometry(1.09, 1.09, 0.12, 42), new THREE.MeshStandardMaterial({ color: 0xffe7dc, roughness: 0.3 }));
  topIcing.position.y = -2.1;
  cake.add(topIcing);
  const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xffd987 });
  for (let i = -1; i <= 1; i += 1) {
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.48, 8), new THREE.MeshStandardMaterial({ color: 0xffe9cf, roughness: 0.4 }));
    candle.position.set(i * 0.46, -1.78, 0);
    cake.add(candle);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), flameMaterial);
    flame.scale.set(0.75, 1.4, 0.75);
    flame.position.set(i * 0.46, -1.48, 0);
    cake.add(flame);
    movingObjects.push({ userData: { flame: true, phase: Math.random() * Math.PI * 2 }, flame });
  }
  cake.position.set(0, -0.2, -4.4);
  celebrationGroup.add(cake);
}
makeCake();

function makeHeart() {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.35);
  shape.bezierCurveTo(-0.15, -0.08, -0.72, 0.25, -0.72, 0.7);
  shape.bezierCurveTo(-0.72, 1.2, -0.08, 1.23, 0, 0.78);
  shape.bezierCurveTo(0.08, 1.23, 0.72, 1.2, 0.72, 0.7);
  shape.bezierCurveTo(0.72, 0.25, 0.15, -0.08, 0, -0.35);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.28, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.06, bevelThickness: 0.06 });
  const material = new THREE.MeshStandardMaterial({ color: 0xf78eaf, emissive: 0xb8396e, emissiveIntensity: 0.6, metalness: 0.22, roughness: 0.24 });
  const heart = new THREE.Mesh(geometry, material);
  heart.scale.setScalar(1.45);
  heart.position.set(-0.9, -0.75, 1);
  heart.rotation.y = -0.18;
  messageGroup.add(heart);
  messageGroup.userData.heart = heart;
  const light = new THREE.PointLight(0xff77ae, 23, 8);
  light.position.set(0, 0, 2.5);
  messageGroup.add(light);
  return heart;
}
const centralHeart = makeHeart();

function addPhotoFrame(group, path, x, y, z, angle) {
  const frame = new THREE.Group();
  const width = 2.05;
  const height = 3.35;
  const borderMaterial = new THREE.MeshStandardMaterial({ color: 0xe9c389, metalness: 0.68, roughness: 0.26, emissive: 0x6c452e, emissiveIntensity: 0.26 });
  const back = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.14), borderMaterial);
  frame.add(back);
  const pictureMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const picture = new THREE.Mesh(new THREE.PlaneGeometry(width - 0.2, height - 0.2), pictureMaterial);
  picture.position.z = 0.083;
  frame.add(picture);
  const loader = new THREE.TextureLoader();
  loader.load(path, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    pictureMaterial.map = texture;
    pictureMaterial.needsUpdate = true;
  });
  frame.position.set(x, y, z);
  frame.rotation.y = angle;
  group.add(frame);
  return frame;
}
const memoryPhotoOne = addPhotoFrame(memoryGroup, "assets/images/background.jpg", -5.8, -0.95, -4, -0.12);
const memoryPhotoTwo = addPhotoFrame(memoryGroup, "assets/images/rifa-portrait.jpg", 5.8, -0.95, -4, 0.14);
memoryPhotoOne.scale.setScalar(0.7);
memoryPhotoTwo.scale.setScalar(0.7);
addPhotoFrame(finalGroup, "assets/images/background.jpg", -4.1, -0.5, -2, 0.14).scale.setScalar(0.66);
addPhotoFrame(finalGroup, "assets/images/rifa-portrait.jpg", 4.1, -0.4, -2, -0.16).scale.setScalar(0.66);

function makeGift() {
  const gift = new THREE.Group();
  const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xc18a4d, metalness: 0.43, roughness: 0.3, emissive: 0x542a22, emissiveIntensity: 0.24 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(2.25, 1.85, 1.65), boxMaterial);
  box.position.y = -1.15;
  gift.add(box);
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, -0.18, 0);
  gift.add(lidPivot);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(2.48, 0.38, 1.84), new THREE.MeshStandardMaterial({ color: 0xe6b76b, metalness: 0.54, roughness: 0.27 }));
  lid.position.y = 0.04;
  lidPivot.add(lid);
  const ribbonMaterial = new THREE.MeshStandardMaterial({ color: 0xf28cad, metalness: 0.16, roughness: 0.32, emissive: 0x742a4d, emissiveIntensity: 0.25 });
  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.1, 1.7), ribbonMaterial);
  ribbon.position.y = -1.12;
  gift.add(ribbon);
  const topRibbon = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.13, 0.22), ribbonMaterial);
  topRibbon.position.y = 0.1;
  lidPivot.add(topRibbon);
  const bowOne = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.08, 9, 18, Math.PI * 1.65), ribbonMaterial);
  bowOne.position.set(-0.2, 0.36, 0);
  bowOne.rotation.z = 0.45;
  lidPivot.add(bowOne);
  const bowTwo = bowOne.clone();
  bowTwo.position.x = 0.2;
  bowTwo.rotation.z = Math.PI + 0.45;
  lidPivot.add(bowTwo);
  gift.position.set(0, -0.15, -2.5);
  giftGroup.add(gift);
  giftGroup.userData.lid = lidPivot;
}
makeGift();

function addBirthdayText() {
  const loader = new FontLoader();
  loader.load(
    "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/helvetiker_bold.typeface.json",
    (font) => {
      const geometry = new TextGeometry("HAPPY BIRTHDAY", {
        font,
        size: 0.48,
        depth: 0.12,
        curveSegments: 6,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.018,
        bevelSegments: 3
      });
      geometry.computeBoundingBox();
      const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
      geometry.translate(-width / 2, 0, 0);
      const text = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
        color: 0xffd9a1,
        emissive: 0xe581a8,
        emissiveIntensity: 0.72,
        metalness: 0.42,
        roughness: 0.23
      }));
      text.position.set(0, 2.8, -1.2);
      celebrationGroup.add(text);
    },
    undefined,
    () => {
      const status = document.querySelector("#music-label");
      status.textContent = audioStarted ? "Music is playing" : "A song for you";
    }
  );
}
addBirthdayText();

function burst(x, y, z, count, palette = colors) {
  const positions = new Float32Array(count * 3);
  const velocities = [];
  const particleColors = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.2 + Math.random() * 3.4;
    velocities.push(new THREE.Vector3(Math.cos(angle) * speed, Math.sin(angle) * speed, (Math.random() - 0.5) * 2));
    const color = new THREE.Color(palette[i % palette.length]);
    particleColors[i * 3] = color.r;
    particleColors[i * 3 + 1] = color.g;
    particleColors[i * 3 + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({
    size: 0.095,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  world.add(points);
  particleSystems.push({ points, velocities, age: 0, lifetime: 2.1 });
}

function changeScene(index, withBurst = true) {
  const next = Math.max(0, Math.min(5, index));
  if (next === currentScene && document.querySelector(`#scene-${next}`).classList.contains("active")) return;
  currentScene = next;
  document.querySelectorAll(".scene").forEach((panel, i) => {
    const active = i === next;
    panel.classList.toggle("active", active);
    panel.setAttribute("aria-hidden", String(!active));
  });
  document.querySelectorAll(".scene-dot").forEach((dot, i) => {
    const active = i === next;
    dot.classList.toggle("active", active);
    if (active) dot.setAttribute("aria-current", "step");
    else dot.removeAttribute("aria-current");
  });
  document.querySelector("#chapter-number").textContent = String(next + 1).padStart(2, "0");
  document.querySelector("#chapter-name").textContent = sceneNames[next];
  document.querySelector("#progress-bar").style.width = `${((next + 1) / 6) * 100}%`;
  entranceGroup.visible = next === 0;
  celebrationGroup.visible = next === 1;
  memoryGroup.visible = next === 2;
  messageGroup.visible = next === 3;
  giftGroup.visible = next === 4;
  finalGroup.visible = next === 5;
  document.body.dataset.scene = String(next);
  if (withBurst && next > 0) {
    const count = smallScreen ? 60 : 110;
    burst((Math.random() - 0.5) * 3, 0.2, 2, count, next === 5 ? [0xff8eb8, 0xf5d58d, 0xffffff] : colors);
  }
  if (next === 1 || next === 5) fireworkTimer = 0.2;
}

function updateMessage() {
  const message = document.querySelector("#love-message");
  const counter = document.querySelector("#message-count");
  message.animate([{ opacity: 0, transform: "translateY(7px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 540, easing: "ease-out" });
  message.textContent = loveNotes[currentNote];
  counter.innerHTML = `${String(currentNote + 1).padStart(2, "0")} <i>/ 06</i>`;
}

const audioPlayButton = document.querySelector("#music-toggle");
const audioMuteButton = document.querySelector("#mute-toggle");
const musicLabel = document.querySelector("#music-label");

async function playMusic() {
  try {
    await audio.play();
    audioStarted = true;
    audioPlayButton.textContent = "Ⅱ";
    audioPlayButton.setAttribute("aria-label", "Pause birthday music");
    audioPlayButton.title = "Pause music";
    musicLabel.textContent = audio.muted ? "Music is muted" : "Music is playing";
  } catch (error) {
    audioStarted = false;
    audioPlayButton.textContent = "▶";
    audioPlayButton.setAttribute("aria-label", "Play birthday music");
    audioPlayButton.title = "Play music";
    musicLabel.textContent = "Tap ♫ to play music";
  }
}

document.querySelector("#enter-button").addEventListener("click", async () => {
  if (currentScene !== 0 || doorOpen) return;
  doorOpen = true;
  await playMusic();
  burst(0, 0, 1, smallScreen ? 95 : 170, [0xffd98c, 0xffa4c6, 0xffffff]);
  changeScene(1, false);
  window.setTimeout(() => { cameraPush = 1; }, 40);
  window.setTimeout(() => { doorOpen = false; }, 1450);
});

audioPlayButton.addEventListener("click", () => {
  if (audio.paused) playMusic();
  else {
    audio.pause();
    audioPlayButton.textContent = "▶";
    audioPlayButton.setAttribute("aria-label", "Play birthday music");
    audioPlayButton.title = "Play music";
    musicLabel.textContent = "Music paused";
  }
});

audioMuteButton.addEventListener("click", () => {
  audio.muted = !audio.muted;
  audioMuteButton.textContent = audio.muted ? "×" : "♪";
  audioMuteButton.setAttribute("aria-label", audio.muted ? "Unmute music" : "Mute music");
  audioMuteButton.title = audio.muted ? "Unmute music" : "Mute music";
  if (audioStarted) musicLabel.textContent = audio.muted ? "Music is muted" : (audio.paused ? "Music paused" : "Music is playing");
});

document.querySelectorAll(".next-button").forEach((button) => {
  button.addEventListener("click", () => changeScene(Number(button.dataset.next)));
});
document.querySelectorAll(".scene-dot").forEach((dot) => {
  dot.addEventListener("click", () => changeScene(Number(dot.dataset.scene)));
});

document.querySelector("#heart-button").addEventListener("click", () => {
  currentNote = (currentNote + 1) % loveNotes.length;
  updateMessage();
  burst((Math.random() - 0.5) * 1.4, -0.25, 1.4, smallScreen ? 22 : 34, [0xff9dbc, 0xf5d58d]);
});

document.querySelector("#gift-button").addEventListener("click", () => {
  if (giftOpen) return;
  giftOpen = true;
  document.querySelector(".gift-content").classList.add("opened");
  document.querySelector("#gift-message").hidden = false;
  burst(0, -0.2, 1.2, smallScreen ? 100 : 170, [0xffd98c, 0xff91bd, 0xffffff]);
  document.querySelector("#gift-button").setAttribute("aria-label", "Birthday gift opened");
});

document.querySelector("#replay-button").addEventListener("click", () => {
  currentNote = 0;
  updateMessage();
  giftOpen = false;
  doorOpen = false;
  doorProgress = 0;
  cameraPush = 0;
  doorPivot.rotation.y = 0;
  document.querySelector(".gift-content").classList.remove("opened");
  document.querySelector("#gift-message").hidden = true;
  document.querySelector("#gift-button").setAttribute("aria-label", "Open your birthday gift");
  changeScene(0);
});

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.fov = width < 600 ? 48 : 42;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 700 ? 1.25 : 1.65));
}
window.addEventListener("resize", resize);

const clock = new THREE.Clock();
let elapsed = 0;

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.04);
  elapsed += delta;
  stars.rotation.y = Math.sin(elapsed * 0.05) * 0.035;
  keyLight.intensity = 39 + Math.sin(elapsed * 1.4) * 4;

  if (doorOpen && doorProgress < 1) doorProgress = Math.min(1, doorProgress + delta / 1.35);
  if (doorProgress > 0) {
    const eased = 1 - Math.pow(1 - doorProgress, 3);
    doorPivot.rotation.y = -eased * 1.65;
    cameraPush = Math.min(1, cameraPush + delta / 1.5);
  } else if (currentScene === 0) {
    doorPivot.rotation.y = Math.sin(elapsed * 0.7) * 0.025;
  }
  camera.position.z = 15 - cameraPush * 3.3;
  camera.position.y = Math.sin(elapsed * 0.22) * 0.12;

  for (const object of movingObjects) {
    if (object.userData.flame) {
      const scale = 0.91 + Math.sin(elapsed * 7 + object.userData.phase) * 0.15;
      object.flame.scale.y = scale;
      continue;
    }
    if (object.visible === false || !object.parent.visible) continue;
    object.position.y += object.userData.speed * delta;
    object.position.x = object.userData.baseX + Math.sin(elapsed * 0.55 + object.userData.sway) * 0.35;
    object.rotation.z = Math.sin(elapsed * 0.6 + object.userData.sway) * 0.08;
    if (object.position.y > 11) {
      object.position.y = -10 - Math.random() * 11;
      object.position.x = (Math.random() - 0.5) * 20;
      object.userData.baseX = object.position.x;
    }
  }
  centralHeart.rotation.y = Math.sin(elapsed * 0.78) * 0.22;
  centralHeart.rotation.z = Math.sin(elapsed * 0.65) * 0.045;
  centralHeart.position.y = -0.75 + Math.sin(elapsed * 1.05) * 0.1;
  memoryPhotoOne.rotation.y = -0.12 + Math.sin(elapsed * 0.5) * 0.08;
  memoryPhotoTwo.rotation.y = 0.14 + Math.sin(elapsed * 0.5 + 1) * 0.08;

  if (currentScene === 1 || currentScene === 5) {
    fireworkTimer -= delta;
    if (fireworkTimer <= 0) {
      const x = (Math.random() - 0.5) * 14;
      const y = 1 + Math.random() * 5;
      burst(x, y, -2, smallScreen ? 27 : 42, [0xff8eb8, 0xf5d58d, 0xd5b4ff, 0xffffff]);
      fireworkTimer = 1.1 + Math.random() * 1.9;
    }
  }

  for (let i = particleSystems.length - 1; i >= 0; i -= 1) {
    const system = particleSystems[i];
    system.age += delta;
    const positions = system.points.geometry.attributes.position.array;
    for (let j = 0; j < system.velocities.length; j += 1) {
      const velocity = system.velocities[j];
      positions[j * 3] += velocity.x * delta;
      positions[j * 3 + 1] += velocity.y * delta;
      positions[j * 3 + 2] += velocity.z * delta;
      velocity.y -= delta * 1.35;
    }
    system.points.geometry.attributes.position.needsUpdate = true;
    system.points.material.opacity = Math.max(0, 1 - system.age / system.lifetime);
    if (system.age >= system.lifetime) {
      world.remove(system.points);
      system.points.geometry.dispose();
      system.points.material.dispose();
      particleSystems.splice(i, 1);
    }
  }

  renderer.render(world, camera);
}

window.setTimeout(() => loading.classList.add("done"), 550);
animate();
