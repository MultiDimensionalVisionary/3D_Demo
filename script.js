import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.module.js";
import { OrbitControls } from "./lib/OrbitControls.js";
import { OBJLoader } from "./lib/OBJLoader.js";
import { MTLLoader } from "./lib/MTLLoader.js";

let scene, camera, renderer, controls, currentAsset, textureLoader;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 2);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("viewer").appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  textureLoader = new THREE.TextureLoader();

  // Assets
  const assets = [
    { type: "panorama", file: "images/Frame_2830.png", name: "Panorama 1" },
    { type: "panorama", file: "images/Frame_2858.jpg", name: "Panorama 2" },
    { type: "model", obj: "models/Door.obj", mtl: "models/Door.mtl", name: "Door Scan" }
  ];

  const selector = document.getElementById("assetSelector");
  assets.forEach((a, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = a.name;
    selector.appendChild(opt);
  });

  selector.addEventListener("change", e => {
    const asset = assets[e.target.value];
    loadAsset(asset);
  });

  // Load first by default
  loadAsset(assets[0]);

  window.addEventListener("resize", onWindowResize);
  animate();
}

function clearScene() {
  if (currentAsset) {
    scene.remove(currentAsset);
    currentAsset.traverse?.(c => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) {
        if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
        else c.material.dispose();
      }
    });
  }
  currentAsset = null;
}

function loadAsset(asset) {
  clearScene();
  if (asset.type === "panorama") {
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial();
    textureLoader.load(asset.file, tex => {
      material.map = tex;
      material.needsUpdate = true;
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    currentAsset = sphere;
    camera.position.set(0, 0, 0.1);
  } else if (asset.type === "model") {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(asset.mtl, materials => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(asset.obj, obj => {
        obj.scale.set(0.01, 0.01, 0.01); // adjust size
        scene.add(obj);
        currentAsset = obj;
        camera.position.set(0, 0, 2);
      });
    });
  }
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
