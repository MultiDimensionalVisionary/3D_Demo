let scene, camera, renderer, controls, sphere, textureLoader, currentModel;

async function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 2, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("viewer").appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  textureLoader = new THREE.TextureLoader();

  // Lights for models
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);

  // Geometry for panoramas (inverted sphere)
  const panoGeometry = new THREE.SphereGeometry(500, 60, 40);
  panoGeometry.scale(-1, 1, 1);
  sphere = new THREE.Mesh(panoGeometry, new THREE.MeshBasicMaterial({ color: 0x000000 }));
  scene.add(sphere);

  // Load curated assets
  const response = await fetch("assets.json");
  const assets = await response.json();

  const selector = document.getElementById("assetSelector");

  assets.panoramas.forEach(pano => {
    const opt = document.createElement("option");
    opt.value = JSON.stringify({ type: "pano", file: pano.file });
    opt.textContent = "🌅 " + pano.name;
    selector.appendChild(opt);
  });

  assets.models.forEach(model => {
    const opt = document.createElement("option");
    opt.value = JSON.stringify({ type: "model", obj: model.obj, mtl: model.mtl });
    opt.textContent = "📦 " + model.name;
    selector.appendChild(opt);
  });

  // Load first
  loadAsset(JSON.parse(selector.options[0].value));

  selector.addEventListener("change", (e) => {
    loadAsset(JSON.parse(e.target.value));
  });

  setupDragDrop();

  window.addEventListener("resize", onWindowResize);
  animate();
}

function loadAsset(asset) {
  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
  }

  if (asset.type === "pano") {
    sphere.visible = true;
    loadPanorama(asset.file);
  } else if (asset.type === "model") {
    sphere.visible = false;
    loadModel(asset.obj, asset.mtl);
  }
}

function loadPanorama(path) {
  textureLoader.load(path, (texture) => {
    sphere.material.map = texture;
    sphere.material.needsUpdate = true;
  });
}

function loadModel(objPath, mtlPath) {
  const mtlLoader = new THREE.MTLLoader();
  mtlLoader.load(mtlPath, (materials) => {
    materials.preload();
    const objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load(objPath, (object) => {
      if (currentModel) scene.remove(currentModel);
      object.position.set(0, 0, 0);
      scene.add(object);
      currentModel = object;

      controls.reset();
      camera.position.set(0, 2, 5);
    });
  });
}

function setupDragDrop() {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");

  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
  });
}

function handleFiles(files) {
  const arr = Array.from(files);

  // Panorama (JPG/PNG)
  const imageFile = arr.find(f => f.name.match(/\.(jpg|jpeg|png)$/i));
  if (imageFile) {
    const url = URL.createObjectURL(imageFile);
    loadAsset({ type: "pano", file: url });
    return;
  }

  // Model (OBJ + optional MTL)
  const objFile = arr.find(f => f.name.match(/\.obj$/i));
  if (objFile) {
    const mtlFile = arr.find(f => f.name.match(/\.mtl$/i));
    const objUrl = URL.createObjectURL(objFile);
    const mtlUrl = mtlFile ? URL.createObjectURL(mtlFile) : null;

    if (mtlUrl) {
      loadAsset({ type: "model", obj: objUrl, mtl: mtlUrl });
    } else {
      const objLoader = new THREE.OBJLoader();
      objLoader.load(objUrl, (object) => {
        if (currentModel) scene.remove(currentModel);
        object.position.set(0, 0, 0);
        scene.add(object);
        currentModel = object;
      });
    }
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
