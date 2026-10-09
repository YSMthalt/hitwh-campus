/* ============================================================
 * VR 全景查看器 — 360° 可转动视角
 * 全景图约定：assets/vr/<地点id>.jpg（equirectangular 等距柱状投影）
 * 图片尚未拍好时，用程序生成的占位全景（天空/地面/方位参考线），
 * 转动视角功能立即可用；图片放好后自动加载真实全景。
 * ============================================================ */
(function () {
  "use strict";

  const overlay = document.getElementById("vr-overlay");
  const canvas = document.getElementById("vr-canvas");
  const vrTitle = document.getElementById("vrTitle");
  const placeholder = document.getElementById("vr-placeholder");

  let renderer = null, scene = null, camera = null, mesh = null;
  let rafId = null, active = false;
  let yaw = 0, pitch = 0, fov = 75;

  // ---------------- 占位全景（canvas 生成） ----------------
  function placeholderTexture() {
    const W = 2048, H = 1024;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");

    // 天空渐变
    const sky = g.createLinearGradient(0, 0, 0, H * 0.5);
    sky.addColorStop(0, "#4a90c9");
    sky.addColorStop(1, "#cfe8f7");
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H * 0.5);

    // 地面渐变
    const grd = g.createLinearGradient(0, H * 0.5, 0, H);
    grd.addColorStop(0, "#a8c09a");
    grd.addColorStop(1, "#6f9a63");
    g.fillStyle = grd;
    g.fillRect(0, H * 0.5, W, H * 0.5);

    // 地平线
    g.fillStyle = "#e8eef2";
    g.fillRect(0, H * 0.5 - 2, W, 4);

    // 方位参考线（每 45° 一条，转动时可见视角变化）
    g.strokeStyle = "rgba(255,255,255,.35)";
    g.lineWidth = 3;
    for (let deg = 0; deg < 360; deg += 45) {
      const x = (deg / 360) * W;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
    }
    // 地面上方位标记点
    for (let deg = 0; deg < 360; deg += 90) {
      const x = (deg / 360) * W;
      g.fillStyle = "rgba(255,255,255,.5)";
      g.beginPath(); g.arc(x, H * 0.62, 26, 0, Math.PI * 2); g.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }

  // ---------------- 打开 VR ----------------
  function openVR(spot) {
    active = true;
    vrTitle.textContent = spot.name + " · VR 全景";
    overlay.classList.remove("hidden");
    document.body.classList.add("vr-open");

    if (!renderer) initRenderer();
    loadPanorama(spot.id);

    yaw = 0; pitch = 0; fov = 75;
    camera.fov = fov; camera.updateProjectionMatrix();
    applyRotation();
  }

  function initRenderer() {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 1, 1, 2000);
    scene.add(camera);
    mesh = new THREE.Mesh(
      new THREE.SphereGeometry(500, 64, 48),
      new THREE.MeshBasicMaterial({ side: THREE.BackSide })
    );
    mesh.rotation.y = Math.PI; // 让纹理经度起点对齐前方
    scene.add(mesh);
    resize();
    window.addEventListener("resize", resize);
  }

  function loadPanorama(id) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    let loaded = false;
    img.onload = () => {
      loaded = true;
      placeholder.style.display = "none";
      const tex = new THREE.Texture(img);
      tex.minFilter = THREE.LinearFilter;
      mesh.material.map = tex;
      mesh.material.needsUpdate = true;
      mesh.material.color.setHex(0xffffff);
    };
    img.onerror = () => {
      // 图片未就绪 → 占位全景 + 提示
      placeholder.style.display = "flex";
      mesh.material.map = placeholderTexture();
      mesh.material.needsUpdate = true;
    };
    img.src = "assets/vr/" + id + ".jpg";
  }

  function applyRotation() {
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
  }

  // ---------------- 交互：拖动旋转 / 滚轮缩放 ----------------
  let dragging = false, lastX = 0, lastY = 0;
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    yaw -= dx * 0.005;
    pitch = Math.max(-1.4, Math.min(1.4, pitch - dy * 0.005));
    lastX = e.clientX; lastY = e.clientY;
    applyRotation();
  });
  canvas.addEventListener("pointerup", () => { dragging = false; });
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    fov = Math.max(30, Math.min(100, fov + e.deltaY * 0.05));
    camera.fov = fov; camera.updateProjectionMatrix();
  }, { passive: false });

  function closeVR() {
    active = false;
    overlay.classList.add("hidden");
    document.body.classList.remove("vr-open");
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }
  document.getElementById("vrBack").addEventListener("click", closeVR);

  function resize() {
    const w = overlay.clientWidth || window.innerWidth;
    const h = overlay.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  // ---------------- 渲染循环 ----------------
  function loop() {
    if (!active) return;
    rafId = requestAnimationFrame(loop);
    renderer.render(scene, camera);
  }
  function startLoop() { if (!rafId) { rafId = requestAnimationFrame(loop); } }

  // 打开时启动渲染循环
  const origOpen = openVR;
  window.openVR = function (spot) { origOpen(spot); startLoop(); };
  window.closeVR = closeVR;
})();
