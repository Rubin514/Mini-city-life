// --- UPDATED LOADING MANAGER ---
const progressBar = document.getElementById('progress');
const loadingScreen = document.getElementById('loading-screen');

const manager = new THREE.LoadingManager();

manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = (itemsLoaded / itemsTotal) * 100;
    progressBar.style.width = progress + '%';
    console.log(`Loading: ${url} (${itemsLoaded}/${itemsTotal})`);
};

manager.onLoad = () => {
    console.log("All assets loaded!");
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 500);
};

// This is the most important part for debugging!
manager.onError = (url) => {
    console.error('There was an error loading ' + url);
    alert("Failed to load: " + url + "\nCheck if the file name matches exactly (Case Sensitive!)");
};

const loader = new GLTFLoader(manager);

                            
