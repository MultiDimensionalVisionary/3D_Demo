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

  // ✅ Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

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

// Fake zoom for panoramas by changing camera FOV
window.addEventListener("wheel", e => {
  if (currentAsset && currentAsset.geometry && currentAsset.geometry.type === "SphereGeometry") {
    camera.fov += e.deltaY * 0.05; // scroll changes FOV
    camera.fov = THREE.MathUtils.clamp(camera.fov, 30, 100); // limits
    camera.updateProjectionMatrix();
  }
});


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
      console.log("Loaded panorama:", asset.file, tex.image.width + "x" + tex.image.height);
      material.map = tex;
      material.needsUpdate = true;
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    currentAsset = sphere;
    camera.position.set(0, 0, 0.1);
	controls.enableZoom = true;   // allow zoom
    controls.minDistance = 0.1;   // prevent infinite zoom in
    controls.maxDistance = 10;    // stop zooming out of sphere
  } else if (asset.type === "model") {
    if (asset.mtl) {
      const mtlLoader = new MTLLoader();
      mtlLoader.load(
        asset.mtl,
        materials => {
          materials.preload();
          const objLoader = new OBJLoader();
          objLoader.setMaterials(materials);
          objLoader.load(asset.obj, obj => {
            fitModelToView(obj, asset.obj);
          });
        },
        undefined,
        error => {
          console.warn("Failed to load MTL, fallback to OBJ only:", error);
          loadObjWithoutMtl(asset.obj);
        }
      );
    } else {
      loadObjWithoutMtl(asset.obj);
    }
  }
}

function loadObjWithoutMtl(objPath) {
  const objLoader = new OBJLoader();
  objLoader.load(objPath, obj => {
    obj.traverse(child => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
      }
    });
    fitModelToView(obj, objPath);
  });
}

function fitModelToView(obj, label = "") {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  console.log("Model loaded:", label, "size:", size, "center:", center);

  obj.position.sub(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const scaleFactor = 2 / maxDim;
  obj.scale.multiplyScalar(scaleFactor);

  obj.traverse(child => {
    if (child.isMesh) {
      child.material.side = THREE.DoubleSide;
    }
  });

  camera.position.set(0, 0, maxDim * 1.5);
  controls.update();

  scene.add(obj);
  currentAsset = obj;
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
