let scene, camera, renderer, controls, sphere, textureLoader;

function init() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 0.1); // slightly offset so not at exact center

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("viewer").appendChild(renderer.domElement);

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;

  // Texture loader
  textureLoader = new THREE.TextureLoader();

  // Sphere geometry (inverted so we are inside it)
  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);
  const material = new THREE.MeshBasicMaterial();
  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // Populate dropdown manually
  const images = [
    { file: "images/pano1.jpg", name: "Panorama 1" },
    { file: "images/pano2.jpg", name: "Panorama 2" }
  ];
  const selector = document.getElementById("imageSelector");

  images.forEach((img, idx) => {
    const opt = document.createElement("option");
    opt.value = img.file;
    opt.textContent = img.name;
    if (idx === 0) opt.selected = true;
    selector.appendChild(opt);
  });

  // Load first panorama
  loadPanorama(images[0].file);

  // Dropdown change
  selector.addEventListener("change", (e) => {
    loadPanorama(e.target.value);
  });

  // Handle resize
  window.addEventListener("resize", onWindowResize);

  animate();
}

function loadPanorama(path) {
  textureLoader.load(path, (texture) => {
    sphere.material.map = texture;
    sphere.material.needsUpdate = true;
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

init();
