import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function PendulumScene({ qpos = [1, 0], qvel = [0] }) {
  const mountRef = useRef(null);
  const pendulumPivotRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // --- Scene ---
    const scene = new THREE.Scene();
    // Dark background so you never see white flashes
    scene.background = new THREE.Color(0x202533);

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 3);

    // --- OrbitControls (click, drag, zoom) ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // smooth damping

    // --- Lighting ---
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemi.position.set(0, 2, 0);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(-3, 5, -3);
    scene.add(dir);

    // --- Ground Plane ---
    const groundGeo = new THREE.PlaneGeometry(10, 10);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0x40444f, depthWrite: false });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    // --- Pendulum Pivot + Rod + Bob ---
    const pivot = new THREE.Object3D();
    pivot.position.set(0, 0, 0);
    scene.add(pivot);
    pendulumPivotRef.current = pivot;

    // Rod (cylinder)
    const rodGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.0, 16);
    const rodMat = new THREE.MeshPhongMaterial({ color: 0xffa500 });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.position.y = -0.5; // top of rod at pivot
    pivot.add(rod);

    // Bob (sphere)
    const bobGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const bobMat = new THREE.MeshPhongMaterial({ color: 0xff4500 });
    const bob = new THREE.Mesh(bobGeo, bobMat);
    bob.position.y = -1.0; // bottom of rod
    pivot.add(bob);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- Handle Resize ---
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // --- Cleanup on Unmount ---
    return () => {
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Whenever qpos changes, rotate the pivot so the rod + bob match θ.
  useEffect(() => {
    if (!pendulumPivotRef.current) return;
    const [cosTheta, sinTheta] = qpos;
    const theta = Math.atan2(sinTheta, cosTheta);
    // MuJoCo’s "θ=0" is straight down → we want pivot.rotation.z = π/2 − θ
    pendulumPivotRef.current.rotation.z = -theta + Math.PI / 2;
  }, [qpos]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}
