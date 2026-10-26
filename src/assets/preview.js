import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
export class AssetPreview {
  constructor(el) {
    this.el = el;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#0b1018");
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.000001, 1000);
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      el.querySelector("#preview-placeholder")?.setAttribute("hidden", "");
      const note = document.createElement("p");
      note.className = "preview-placeholder";
      note.textContent =
        "3D preview unavailable. Geometry and dimensions can still be processed. Enable WebGL to inspect the mesh.";
      el.append(note);
      return;
    }
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    el.append(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.scene.add(new THREE.HemisphereLight(0xe2efff, 0x344259, 2.5));
    const l = new THREE.DirectionalLight(0xffffff, 3);
    l.position.set(2, 4, 3);
    this.scene.add(l);
    const rim = new THREE.DirectionalLight(0x75bde7, 1.5);
    rim.position.set(-3, 2, -2);
    this.scene.add(rim);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(el);
    this.renderer.setAnimationLoop(() => {
      if (this.object && el.getBoundingClientRect().width) {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
      }
    });
  }
  resize() {
    const width = this.el.clientWidth,
      height = this.el.clientHeight;
    if (!this.renderer || !width || !height) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
  show(object) {
    if (this.object) this.scene.remove(this.object);
    this.object = object;
    if (!this.renderer) return;
    this.scene.add(object);
    const b = new THREE.Box3().setFromObject(object),
      size = b.getSize(new THREE.Vector3()),
      center = b.getCenter(new THREE.Vector3()),
      d = Math.max(size.x, size.y, size.z) * 2.4;
    this.controls.target.copy(center);
    this.camera.position.copy(center).add(new THREE.Vector3(d, d * 0.7, d));
    this.camera.near = d / 1000;
    this.camera.far = d * 1000;
    this.camera.updateProjectionMatrix();
    this.controls.update();
    this.resize();
  }
  clear() {
    if (this.object) this.scene.remove(this.object);
    this.object = null;
  }
  dispose() {
    this.clear();
    this.renderer?.setAnimationLoop(null);
    this.observer?.disconnect();
    this.controls?.dispose();
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
  }
}
