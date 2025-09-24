// Import modern ES modules
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.149.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls, sphere, textureLoader;

function init() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 0.1);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("viewer").appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;

  // Texture loader
  textureLoader = new THREE.TextureLoader();

  // Sphere geometry
  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);
  const material = new THREE.MeshBasicMaterial();
  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // Dropdown options
  const images = [
    { file: "images/Frame_2830.jpg", name: "Panorama 1" },
    { file: "images/Frame_2858.jpg", name: "Panorama 2" }
  ];
  const selector = document.getElementById("imageSelector");

  images.forEach((img, idx) => {
    const opt = document.createElement("option");
    opt.value = img.file;
    opt.textContent = img.name;
    if (idx === 0) opt.selected = true;
    selector.appendChild(opt);
  });

  // Load first
  loadPanorama(images[0].file);

  selector.addEventListener("change", (e) => {
    loadPanorama(e.target.value);
  });

  window.addEventListener("resize", onWindowResize);

  animate();
}

function loadPanorama(path) {
  console.log("Loading panorama:", path);
  textureLoader.load(
    path,
    (texture) => {
      console.log("Loaded successfully:", path);
      sphere.material.map = texture;
      sphere.material.needsUpdate = true;
    },
    undefined,
    (err) => {
      console.error("Error loading", path, err);
    }
  );
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
