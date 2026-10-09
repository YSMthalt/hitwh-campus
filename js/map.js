/* ============================================================
 * 校园地图漫游 — 地图热点 / 介绍卡 / 航拍视频
 * 热点坐标：left/top 百分比（相对地图图片），可按需调整
 * 视频：video 字段为站点相对路径；pending=true 表示视频尚未下载好
 * VR：assets/vr/<id>.jpg 放好后自动加载；否则显示占位（可转动视角）
 * ============================================================ */
(function () {
  "use strict";

  // ---------------- 地点数据 ----------------
  const SPOTS = [
    { id: "zhulou",   name: "主楼", x: 41, y: 68,
      desc: "校区标志性建筑，巍峨挺拔，钟楼远眺山海，是行政办公与教学科研的核心。",
      video: null },
    { id: "tushuguan", name: "图书馆", x: 33, y: 26,
      desc: "馆藏丰富、书声琅琅，是莘莘学子自习与阅读的知识殿堂。",
      video: null },
    { id: "tiyuguan", name: "体育馆", x: 33, y: 81,
      desc: "室内运动与大型活动场地，配套标准田径场，青春活力在此迸发。",
      video: null },
    { id: "nanmen",   name: "南门", x: 41, y: 92,
      desc: "校园正门，校训石庄重矗立，是无数 HITers 梦开始的地方。",
      video: null, pending: true },
    { id: "ximen",    name: "西南门", x: 19, y: 79,
      desc: "西南侧出入口，毗邻金海湾与国际海水浴场。",
      video: null },
    { id: "riyuehu",  name: "日月湖", x: 41, y: 76,
      desc: "波光潋滟的校园湖畔，柳岸书声、白鹭低飞，是师生休闲漫步的好去处。",
      video: "assets/video/riyuehu.mp4" },
    { id: "dingxiangyuan", name: "丁香园", x: 38, y: 41,
      desc: "春夏之交丁香盛放，香气氤氲，是校园里的一抹浪漫。",
      video: null, pending: true },
    { id: "dahuo",    name: "综合球类馆", x: 41, y: 35,
      desc: "羽毛球、乒乓球等综合运动场地，师生日常锻炼健身的好去处。",
      video: null, pending: true },
    { id: "yanjiuyuan", name: "研究院", x: 47.5, y: 87,
      desc: "科研创新与成果转化的重要基地，汇聚多学科协同攻关力量。",
      video: null, pending: true },
  ];

  // ---------------- 渲染热点 ----------------
  const pinsLayer = document.getElementById("map-pins");
  SPOTS.forEach((s) => {
    const pin = document.createElement("button");
    pin.className = "pin";
    pin.style.left = s.x + "%";
    pin.style.top = s.y + "%";
    pin.setAttribute("aria-label", s.name);
    pin.innerHTML = `<span class="pin-dot"></span><span class="pin-label">${s.name}</span>`;
    pin.addEventListener("click", () => openCard(s));
    pinsLayer.appendChild(pin);
  });

  // ---------------- 介绍卡 ----------------
  const card = document.getElementById("spot-card");
  const spotName = document.getElementById("spotName");
  const spotDesc = document.getElementById("spotDesc");
  const spotMedia = document.getElementById("spotMedia");
  const spotVR = document.getElementById("spotVR");
  let currentSpot = null;

  function openCard(s) {
    currentSpot = s;
    spotName.textContent = s.name;
    spotDesc.textContent = s.desc;

    // 视频区
    if (s.video) {
      spotMedia.innerHTML =
        `<video controls muted loop preload="metadata" src="${s.video}" class="spot-video"></video>` +
        `<p class="media-note">航拍 · ${s.name}</p>`;
    } else if (s.pending) {
      spotMedia.innerHTML =
        `<div class="media-pending">🎬 航拍视频整理中，敬请期待</div>`;
    } else {
      spotMedia.innerHTML =
        `<div class="media-pending">🎬 航拍视频整理中，敬请期待</div>`;
    }

    spotVR.onclick = () => openVR(s);
    card.classList.remove("hidden");
    document.body.classList.add("card-open");
  }

  function closeCard() {
    card.classList.add("hidden");
    document.body.classList.remove("card-open");
    // 停止卡片内视频
    const v = spotMedia.querySelector("video");
    if (v) v.pause();
  }

  document.getElementById("spotClose").addEventListener("click", closeCard);

  // 暴露给 vr.js / main.js
  window.MapApp = { SPOTS, openCard, closeCard };
})();
