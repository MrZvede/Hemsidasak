const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 1, 5000);

// --- Game state (same logic as the 2D version, plus a z axis) ---
const sam = {
  pos: { x: Math.random() * 150 + 50, y: Math.random() * 350 + 50, z: Math.random() * 150 + 50 },
  size: { w: 50, h: 50, d: 50 }
};
const border = { x: 400, y: 600, z: 400 };
let speed = 1;
const dir = { x: 1, y: 1, z: 1 };

function move(pos, dir) {
  pos.x += dir.x * speed;
  pos.y += dir.y * speed;
  pos.z += dir.z * speed;
}

function check(pos, border, dir, size) {
  if (pos.x > border.x - size.w || pos.x < 0) { dir.x *= -1; speed += 0.1; }
  if (pos.y > border.y - size.h || pos.y < 0) { dir.y *= -1; speed += 0.1; }
  if (pos.z > border.z - size.d || pos.z < 0) { dir.z *= -1; speed += 0.1; }
}

function update() {
  move(sam.pos, dir);
  check(sam.pos, border, dir, sam.size);
}

// --- 3D scene ---
const world = new THREE.Group();
scene.add(world);

// Arena wireframe
const arena = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(border.x, border.y, border.z)),
  new THREE.LineBasicMaterial({ color: 0x8890a0 })
);
world.add(arena);

// The cube
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(sam.size.w, sam.size.h, sam.size.d),
  new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4, metalness: 0.2 })
);
world.add(cube);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 0.9);
sun.position.set(300, 600, 500);
scene.add(sun);

// Map game coords (y down, origin at corner) to centered 3D coords (y up)
function draw() {
  cube.position.set(
    sam.pos.x + sam.size.w / 2 - border.x / 2,
    -(sam.pos.y + sam.size.h / 2 - border.y / 2),
    sam.pos.z + sam.size.d / 2 - border.z / 2
  );
  cube.rotation.x += 0.01 * Math.min(speed, 10);
  cube.rotation.y += 0.01 * Math.min(speed, 10);
  renderer.render(scene, camera);
}

// --- Drag to orbit ---
let rotX = -0.3, rotY = 0.5, dragging = false, lx = 0, ly = 0;
canvas.addEventListener('pointerdown', e => {
  dragging = true; lx = e.clientX; ly = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointerup', () => dragging = false);
canvas.addEventListener('pointermove', e => {
  if (!dragging) return;
  rotY += (e.clientX - lx) * 0.01;
  rotX = Math.max(-1.4, Math.min(1.4, rotX + (e.clientY - ly) * 0.01));
  lx = e.clientX; ly = e.clientY;
});

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.position.set(0, 0, Math.max(1100, 1100 / Math.min(1, camera.aspect)));
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

function loop() {
  update();
  world.rotation.set(rotX, rotY, 0);
  draw();
  requestAnimationFrame(loop);
}
loop();