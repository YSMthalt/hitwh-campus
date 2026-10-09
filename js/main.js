/* ============================================================
 * 页面交互：导航 / 图库 / 弹窗 / 视频降级
 * ============================================================ */
(function () {
  "use strict";

  // ---------- 导航 ----------
  const menu = document.getElementById("menu");
  document.getElementById("menuToggle").addEventListener("click", () => menu.classList.toggle("open"));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.classList.remove("open")));

  const links = [...menu.querySelectorAll("a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
  window.addEventListener("scroll", () => {
    const y = window.scrollY + 140;
    let idx = 0;
    sections.forEach((s, i) => { if (s && s.offsetTop <= y) idx = i; });
    links.forEach((a, i) => a.classList.toggle("active", i === idx));
  }, { passive: true });

  // ---------- 校园风光图库 ----------
  const PHOTOS = [
    { src: "assets/img/banner2.jpg", cap: "海上生明月 · 天涯共此时" },
    { src: "assets/img/banner4.jpg", cap: "校门 · 欢迎 2026 级新同学" },
    { src: "assets/img/banner3.jpg", cap: "大力弘扬教育家精神" },
    { src: "assets/img/banner1.jpg", cap: "热烈庆祝新中国成立 77 周年" },
    { src: "assets/img/poster1.jpg", cap: "嘿！这里是哈工大（威海）" },
    { src: "assets/img/g1.jpg",      cap: "你好，新同学" },
    { src: "assets/img/g2.jpg",      cap: "机甲大师 · 全国八强" },
    { src: "assets/img/g3.jpg",      cap: "海滨 · 工大学子" },
    { src: "assets/img/poster2.jpg", cap: "飞驰吧，少年！HIT 车队" },
    { src: "assets/img/campus_map.jpg", cap: "校园平面示意图（点击放大）" },
  ];
  const gallery = document.getElementById("gallery");
  PHOTOS.forEach((p) => {
    const d = document.createElement("div");
    d.className = "ph";
    d.innerHTML = `<img src="${p.src}" alt="${p.cap}" loading="lazy"><span>${p.cap}</span>`;
    d.addEventListener("click", () => {
      document.getElementById("imgModalSrc").src = p.src;
      document.getElementById("imgModal").classList.remove("hidden");
    });
    gallery.appendChild(d);
  });

  // ---------- 图片放大弹窗 ----------
  const imgModal = document.getElementById("imgModal");
  document.getElementById("imgClose").addEventListener("click", () => imgModal.classList.add("hidden"));
  imgModal.addEventListener("click", (e) => { if (e.target === imgModal) imgModal.classList.add("hidden"); });

  // ---------- 键盘：Esc 关闭弹层 ----------
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      imgModal.classList.add("hidden");
      if (window.closeVR) window.closeVR();
      if (window.MapApp) window.MapApp.closeCard();
    }
  });

  // ---------- Hero 视频降级（文件缺失时仅用封面图） ----------
  const hero = document.getElementById("heroVideo");
  hero.addEventListener("error", () => hero.style.display = "none");
})();
