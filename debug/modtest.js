import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.module.js";

console.log("THREE object:", THREE);
console.log("Revision:", THREE.REVISION || "(no revision property)");

if (THREE && typeof THREE === "object") {
  document.body.innerHTML += "<p>Three.js loaded!</p>";
}
