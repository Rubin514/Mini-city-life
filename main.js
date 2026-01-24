import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- CONFIGURATION ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky Blue
scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// --- LOADING MANAGER ---
const progressBar = document.getElementById('progress-bar');
const percentText = document.getElementById('percent-text');
const loadingScreen = document.getElementById('loading-screen');

const manager = new THREE.LoadingManager();

manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = (itemsLoaded / itemsTotal) * 100;
    progressBar.style.width = progress + '%';
    percentText.innerText = `Loading: ${Math.round(progress)}%`;
};

manager.onLoad = () => {
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
    }, 500);
};

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(10, 20, 10);
sunLight.castShadow = true;
scene.add(sunLight);

// --- WORLD ASSETS ---
const loader = new GLTFLoader(manager);

// Ground
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0x444444 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Load your specific files
function placeModel(path, x, z, scale = 1) {
    loader.load(path, (gltf) => {
        const model = gltf.scene;
        model.position.set(x, 0, z);
        model.scale.set(scale, scale, scale);
        model.traverse(n => { if (n.isMesh) n.castShadow = true; n.receiveShadow = true; });
        scene.add(model);
    });
}

// Positioning your models
placeModel('models/building.glb', -15, -20, 1);
placeModel('models/building2.glb', 15, -25, 1);
placeModel('models/tree1.glb', 5, -10, 0.8);
placeModel('models/tree1.glb', -5, -8, 1);

// --- PLAYER ---
const player = new THREE.Group();
const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.5, 1, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0xff3333 })
);
body.position.y = 1;
player.add(body);
scene.add(player);

// --- CONTROLS ---
const keys = {};
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

// --- GAME LOOP ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const moveSpeed = 10 * delta;

    if (keys['KeyW']) player.position.z -= moveSpeed;
    if (keys['KeyS']) player.position.z += moveSpeed;
    if (keys['KeyA']) player.position.x -= moveSpeed;
    if (keys['KeyD']) player.position.x += moveSpeed;

    // Smooth Camera Follow
    const idealOffset = new THREE.Vector3(0, 5, 10);
    const cameraPos = player.position.clone().add(idealOffset);
    camera.position.lerp(cameraPos, 0.1);
    camera.lookAt(player.position);

    renderer.render(scene, camera);
}

animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
      
