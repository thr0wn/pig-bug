import "./styles.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Shader from "./shader";

export class Scene {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas });

    this.renderer.setClearColor("#000", 1);

    this.scene = new THREE.Scene();

    this.setupCamera();
    this.setupControls();

    this._onResize();
    window.addEventListener("resize", () => this._onResize());

    this.shader = new Shader();
    this.scene.add(this.shader.mesh);

    this._update();
  }

  setupCamera() {
    this.camera = new THREE.OrthographicCamera(
      50 / -2,
      50 / 2,
      50 / 2,
      50 / -2,
      0,
      50
    );
    this.camera.position.set(0, 0, 50);
    this.camera.lookAt(new THREE.Vector3());
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enabled = false;
  }

  _update() {
    window.requestAnimationFrame(() => {
      const now = Date.now();
      const delta = now - (this.lastTime || Date.now());
      this.lastTime = now;
      this.update(delta);
      window.setTimeout(() => this._update(), 1000 / 60);
    });
  }

  update(time) {
    this.controls.update();
    this.shader.update(time);
    this.renderer.render(this.scene, this.camera);
  }

  _onResize() {
    const dpr = window.devicePixelRatio;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      this.canvas.clientWidth / dpr,
      this.canvas.clientHeight / dpr,
      false
    );
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.renderer.dispose();
  }
}

new Scene(document.getElementById("app"));
