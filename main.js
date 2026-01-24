import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- SCENE SETUP ---
const scene = new THREE.Scene();
const skyColor = 0x87CEEB;
scene.background = new THREE.Color(skyColor);
// FIX: Fog now matches sky exactly and starts further away
scene.fog = new THREE.Fog(skyColor, 50, 150); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- LIGHTING ---
const ambient = new THREE.AmbientLight(0xffffff, 1.2); // Brightened
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(5, 20, 10);
scene.add(sun);

// --- LOADING MANAGER ---
const manager = new THREE.LoadingManager();
manager.onProgress = (u, l, t) => document.getElementById('progress').style.width = (l/t*100) + '%';
manager.onLoad = () => setTimeout(() => document.getElementById('loading-screen').classList.add('hidden'), 500);

const loader = new GLTFLoader(manager);

// Ground
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color: 0x444444 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Models Loader
function addModel(path, x, z, s = 1) {
    loader.load(path, (gltf) => {
        gltf.scene.position.set(x, 0, z);
        gltf.scene.scale.set(s, s, s);
        scene.add(gltf.scene);
    });
}

addModel('models/building.glb', -15, -20);
addModel('models/building2.glb', 15, -25);
addModel('models/tree1.glb', 5, -10);

// --- PLAYER ---
const player = new THREE.Group();
const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 1, 4, 8), new THREE.MeshStandardMaterial({color: 0xff0000}));
body.position.y = 1;
player.add(body);
scene.add(player);

// --- CONTROLS LOGIC ---
const input = { forward: 0, side: 0 };
const keys = {};

// Keyboard
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

// Mobile Joystick Logic
const knob = document.getElementById('joystick-knob');
const wrapper = document.getElementById('joystick-wrapper');
let drag = false;

window.addEventListener('touchstart', (e) => { if(e.target === knob || e.target === wrapper) drag = true; });
window.addEventListener('touchend', () => {
    drag = false;
    knob.style.transform = `translate(0px, 0px)`;
    input.forward = 0; input.side = 0;
});
window.addEventListener('touchmove', (e) => {
    if (!drag) return;
    const touch = e.touches[0];
    const rect = wrapper.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const dist = Math.min(Math.sqrt(dx*dx + dy*dy), 50);
    const angle = Math.atan2(dy, dx);
    
    const moveX = Math.cos(angle) * dist;
    const moveY = Math.sin(angle) * dist;
    
    knob.style.transform = `translate(${moveX}px, ${moveY}px)`;
    
    // Normalize input to -1 to 1
    input.side = moveX / 50;
    input.forward = -moveY / 50; 
});

// --- GAME LOOP ---
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const speed = 10 * dt;

    // Merge Keyboard + Joystick
    let moveZ = input.forward * -1;
    let moveX = input.side;

    if (keys['KeyW']) moveZ = -1;
    if (keys['KeyS']) moveZ = 1;
    if (keys['KeyA']) moveX = -1;
    if (keys['KeyD']) moveX = 1;

    player.position.z += moveZ * speed;
    player.position.x += moveX * speed;

    // Smooth Camera
    const camTarget = new THREE.Vector3(player.position.x, player.position.y + 6, player.position.z + 12);
    camera.position.lerp(camTarget, 0.1);
    camera.lookAt(player.position);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
                            
