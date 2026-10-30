(function () {
  "use strict";

  const AGENTS = window.AGENTS || [];
  const LINEUPS = window.LINEUPS || [];
  const MAPS = window.MAPS || [];
  const MAP_CN = window.MAP_CN || {};
  const PHOTO_SOURCES = window.PHOTO_SOURCES || [];
  const agentById = Object.fromEntries(AGENTS.map((a) => [a.id, a]));

  // ---------- i18n ----------
  const I18N = {
    zh: {
      searchPlaceholder: "搜索英雄、地图、技能、点位…",
      heroTitle: "英雄点位",
      heroSub: "选择英雄，查看视频教程和图文教程",
      all: "全部",
      allMaps: "全地图",
      duelist: "决斗者",
      initiator: "先锋",
      controller: "控场者",
      sentinel: "哨卫",
      lineups: "个点位",
      noLineups: "暂无点位",
      home: "首页",
      map: "地图",
      side: "攻防",
      attack: "进攻",
      defense: "防守",
      both: "双方",
      ability: "技能",
      language: "语言",
      site: "包点",
      guide: "合集",
      emptyFilter: "没有符合筛选条件的点位。",
      emptyAgent: "这个英雄还没有视频点位。可以先看下方的图文点位库，或在 data/lineups.js 里添加！",
      video: "视频教程",
      photos: "图文教程",
      noVideo: "这个点位暂无视频。",
      openVideo: "打开视频 ↗",
      openOriginal: "在原网站观看 / 给作者点赞 ↗",
      photoLibrary: "图文点位库",
      photoLibrarySub: "每个点位都有站位、瞄准、落点截图，按地图选择：",
      photoExternal: "这个视频合集没有自带截图。下面是同英雄同地图的图文点位（站位 → 瞄准 → 落点）：",
      hasVideo: "视频",
      difficulty: "难度",
      notFound: "找不到这个页面。",
      back: "返回首页",
      searchResults: "搜索结果",
      searchEmpty: "没有找到相关点位。",
      footer: "Valo Lineup · 非官方粉丝站，与 Riot Games 无关 · 视频版权归原作者所有",
    },
    en: {
      searchPlaceholder: "Search agents, maps, abilities, lineups…",
      heroTitle: "Agent Lineups",
      heroSub: "Pick an agent to see video and photo tutorials",
      all: "All",
      allMaps: "All maps",
      duelist: "Duelist",
      initiator: "Initiator",
      controller: "Controller",
      sentinel: "Sentinel",
      lineups: "lineups",
      noLineups: "No lineups yet",
      home: "Home",
      map: "Map",
      side: "Side",
      attack: "Attack",
      defense: "Defense",
      both: "Both sides",
      ability: "Ability",
      language: "Language",
      site: "Site",
      guide: "Full guide",
      emptyFilter: "No lineups match these filters.",
      emptyAgent: "No video lineups for this agent yet. Try the photo library below, or add some in data/lineups.js!",
      video: "Video",
      photos: "Photo Guide",
      noVideo: "No video for this lineup yet.",
      openVideo: "Open video ↗",
      openOriginal: "Watch on the original site / support the creator ↗",
      photoLibrary: "Photo lineup library",
      photoLibrarySub: "Stand, aim and result screenshots for every lineup — pick a map:",
      photoExternal: "This video guide has no screenshots of its own. Photo lineups (stand → aim → result) for the same agent and map:",
      hasVideo: "Video",
      difficulty: "Difficulty",
      notFound: "Page not found.",
      back: "Back to home",
      searchResults: "Search results",
      searchEmpty: "No lineups found.",
      footer: "Valo Lineup · Unofficial fan site, not affiliated with Riot Games · Videos belong to their creators",
    },
  };

  const LANG_LABEL = { zh: "中文", en: "EN", es: "ES", pt: "PT", ja: "日本語", ko: "한국어" };

  let lang = readPref("lang", "zh");
  const t = (key) => I18N[lang][key] ?? key;

  function readPref(key, fallback) {
    try { return localStorage.getItem("valo-" + key) || fallback; } catch (e) { return fallback; }
  }
  function writePref(key, value) {
    try { localStorage.setItem("valo-" + key, value); } catch (e) { /* ignore */ }
  }

  // ---------- helpers ----------
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const agentName = (a) => (lang === "zh" && a.cn ? a.cn : a.name);
  const agentSubName = (a) => (lang === "zh" && a.cn ? a.name : a.cn || "");
  const mapName = (m) => (m === "All" ? t("allMaps") : lang === "zh" && MAP_CN[m] ? MAP_CN[m] : m);
  const agentsOf = (l) => (Array.isArray(l.agent) ? l.agent : [l.agent]);
  const lineupsFor = (agentId) => LINEUPS.filter((l) => agentsOf(l).includes(agentId));

  function photoLinks(agentId, maps) {
    return PHOTO_SOURCES.flatMap((src) =>
      maps.map((m) => ({
        source: src.name,
        map: m,
        url: src.url.replace("{agent}", encodeURIComponent(agentId)).replace("{map}", encodeURIComponent(m.toLowerCase())),
      }))
    );
  }

  function videoSourceUrl(v) {
    if (!v) return "";
    if (v.type === "youtube") return `https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}${v.start ? `&t=${parseInt(v.start, 10)}s` : ""}`;
    if (v.type === "bilibili") return `https://www.bilibili.com/video/${encodeURIComponent(v.bvid)}/${v.page > 1 ? `?p=${parseInt(v.page, 10)}` : ""}`;
    if (v.type === "link") return v.url;
    return "";
  }

  function thumbnailOf(l) {
    if (l.thumbnail) return l.thumbnail;
    if (l.steps && l.steps.length) return l.steps[l.steps.length - 1].img;
    if (l.video && l.video.type === "youtube") return `https://i.ytimg.com/vi/${encodeURIComponent(l.video.id)}/hqdefault.jpg`;
    return "";
  }

  function avatar(a, cls = "") {
    const inner = a.avatar
      ? `<img src="${esc(a.avatar)}" alt="" loading="lazy">`
      : esc(a.name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase());
    return `<div class="avatar role-${esc(a.role)} ${cls}">${inner}</div>`;
  }

  function stars(n) {
    if (!n) return "";
    const v = Math.max(1, Math.min(3, n));
    return `<span class="stars" title="${t("difficulty")}">${"★".repeat(v)}<span class="off">${"★".repeat(3 - v)}</span></span>`;
  }

  function sideBadge(side) {
    return side ? `<span class="badge ${esc(side)}">${esc(t(side))}</span>` : "";
  }

  function langBadge(code) {
    return code ? `<span class="badge lang">${esc(LANG_LABEL[code] || code.toUpperCase())}</span>` : "";
  }

  function chip(label, active, attrs) {
    return `<button type="button" class="chip${active ? " active" : ""}" ${attrs}>${label}</button>`;
  }

  // ---------- views ----------
  const state = { role: "all", filters: {} };
  const app = document.getElementById("app");

  function viewHome() {
    const roles = ["all", "duelist", "initiator", "controller", "sentinel"];
    const list = AGENTS.filter((a) => state.role === "all" || a.role === state.role);

    app.innerHTML = `
      <h1>${t("heroTitle")}</h1>
      <p class="sub">${t("heroSub")}</p>
      <div class="chips">
        ${roles.map((r) => chip(t(r), state.role === r, `data-role="${r}"`)).join("")}
      </div>
      <div class="agent-grid">
        ${list.map((a) => {
          const n = lineupsFor(a.id).length;
          return `
            <a class="agent-card role-${esc(a.role)}${n ? "" : " no-lineups"}" href="#/agent/${esc(a.id)}">
              ${avatar(a)}
              <div class="name">${esc(agentName(a))}</div>
              ${agentSubName(a) ? `<div class="cn">${esc(agentSubName(a))}</div>` : ""}
              <div class="count">${n ? `<b>${n}</b> ${t("lineups")}` : t("noLineups")}</div>
            </a>`;
        }).join("")}
      </div>`;

    app.querySelectorAll("[data-role]").forEach((b) =>
      b.addEventListener("click", () => { state.role = b.dataset.role; viewHome(); })
    );
  }

  function viewAgent(id) {
    const a = agentById[id];
    if (!a) return viewNotFound();

    const all = lineupsFor(id);
    const f = (state.filters[id] ||= { map: "all", side: "all", ability: "all", lang: "all" });

    const mapsUsed = MAPS.filter((m) => all.some((l) => l.map === m))
      .concat([...new Set(all.map((l) => l.map))].filter((m) => !MAPS.includes(m) && m !== "All"))
      .concat(all.some((l) => l.map === "All") ? ["All"] : []);
    const abilities = [...new Set(all.map((l) => l.ability).filter(Boolean))];
    const langs = [...new Set(all.map((l) => l.lang).filter(Boolean))];
    const sides = ["attack", "defense", "both"].filter((s) => all.some((l) => l.side === s));

    const shown = all.filter((l) =>
      (f.map === "all" || l.map === f.map) &&
      (f.side === "all" || l.side === f.side) &&
      (f.ability === "all" || l.ability === f.ability) &&
      (f.lang === "all" || l.lang === f.lang)
    );

    const countBy = (key, val) => all.filter((l) => l[key] === val).length;
    const filterRow = (label, key, values, render = esc) => `
      <div class="filter-row">
        <span class="filter-label">${label}</span>
        <div class="chips">
          ${chip(t("all"), f[key] === "all", `data-k="${key}" data-v="all"`)}
          ${values.map((v) => chip(`${render(v)}<span class="count">${countBy(key, v)}</span>`, f[key] === v, `data-k="${key}" data-v="${esc(v)}"`)).join("")}
        </div>
      </div>`;

    const photo = photoLinks(id, MAPS);

    app.innerHTML = `
      <div class="crumbs"><a href="#/">${t("home")}</a> / ${esc(agentName(a))}</div>
      <div class="agent-head role-${esc(a.role)}">
        ${avatar(a, "lg")}
        <div>
          <h1>${esc(agentName(a))}${agentSubName(a) ? ` <span class="sub">${esc(agentSubName(a))}</span>` : ""}</h1>
          <div class="role">${t(a.role)} · ${all.length} ${t("lineups")}</div>
        </div>
      </div>
      ${all.length ? `
        ${filterRow(t("map"), "map", mapsUsed, mapName)}
        ${sides.length > 1 ? filterRow(t("side"), "side", sides, (s) => t(s)) : ""}
        ${langs.length > 1 ? filterRow(t("language"), "lang", langs, (c) => esc(LANG_LABEL[c] || c)) : ""}
        ${shown.length ? `<div class="lineup-grid">${shown.map((l) => lineupCard(l, false)).join("")}</div>`
                       : `<div class="empty">${t("emptyFilter")}</div>`}
      ` : `<div class="empty">${t("emptyAgent")}</div>`}
      ${photo.length ? `
        <h2>🖼 ${t("photoLibrary")}</h2>
        <p class="sub">${t("photoLibrarySub")}</p>
        <div class="chips">
          ${photo.map((p) => `<a class="chip" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(mapName(p.map))} ↗</a>`).join("")}
        </div>
        <p class="source-note">${[...new Set(photo.map((p) => p.source))].map(esc).join(" · ")}</p>` : ""}`;

    app.querySelectorAll("[data-k]").forEach((b) =>
      b.addEventListener("click", () => { f[b.dataset.k] = b.dataset.v; viewAgent(id); })
    );
  }

  function lineupCard(l, showAgent) {
    const agents = agentsOf(l).map((x) => agentById[x]).filter(Boolean);
    const thumb = thumbnailOf(l);
    return `
      <a class="lineup-card" href="#/lineup/${encodeURIComponent(l.id)}">
        <div class="thumb">
          <div class="thumb-text">${esc(mapName(l.map))}</div>
          ${thumb ? `<img src="${esc(thumb)}" alt="" loading="lazy" onerror="this.remove()">` : ""}
          <div class="badges">
            ${l.video ? `<span class="badge has-video">▶ ${t("hasVideo")}</span>` : ""}
            ${l.kind === "guide" ? `<span class="badge guide">${t("guide")}</span>` : ""}
            ${l.example ? `<span class="badge example">Example</span>` : ""}
          </div>
        </div>
        <div class="body">
          ${showAgent && agents.length ? `<div class="agent-line">${agents.map((a) => avatar(a)).join("")} ${agents.map((a) => esc(agentName(a))).join(" · ")}</div>` : ""}
          <div class="title">${esc(l.title)}</div>
          <div class="meta">
            <span class="badge">${esc(mapName(l.map))}</span>
            ${l.site ? `<span class="badge">${esc(l.site)}</span>` : ""}
            ${sideBadge(l.side)}
            ${langBadge(l.lang)}
            ${stars(l.difficulty)}
          </div>
        </div>
      </a>`;
  }

  function videoEmbed(v) {
    if (!v) return `<div class="empty">${t("noVideo")}</div>`;
    let player = "";
    switch (v.type) {
      case "youtube": {
        const start = v.start ? `?start=${parseInt(v.start, 10)}` : "";
        player = `<div class="video-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}${start}"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>`;
        break;
      }
      case "bilibili": {
        const page = parseInt(v.page || 1, 10);
        player = `<div class="video-wrap"><iframe src="https://player.bilibili.com/player.html?bvid=${encodeURIComponent(v.bvid)}&page=${page}&autoplay=0&high_quality=1"
          allow="fullscreen" allowfullscreen loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"></iframe></div>`;
        break;
      }
      case "file":
        return `<div class="video-wrap"><video src="${esc(v.src)}" controls playsinline preload="metadata"${v.poster ? ` poster="${esc(v.poster)}"` : ""}></video></div>`;
      case "link":
        return `<a class="video-link" href="${esc(v.url)}" target="_blank" rel="noopener">${t("openVideo")}</a>`;
      default:
        return `<div class="empty">${t("noVideo")}</div>`;
    }
    const src = videoSourceUrl(v);
    return player + (src ? `<p class="source-note"><a href="${esc(src)}" target="_blank" rel="noopener">${t("openOriginal")}</a></p>` : "");
  }

  function photoPanel(l) {
    const steps = l.steps || [];
    if (steps.length) {
      return `
        <div class="steps">
          ${steps.map((s, i) => `
            <div class="step">
              <img src="${esc(s.img)}" alt="${esc(s.caption || "")}" data-step="${i}" loading="lazy">
              <div class="text"><div class="num">${i + 1}</div><div class="caption">${esc(s.caption || "")}</div></div>
            </div>`).join("")}
        </div>`;
    }
    const maps = l.map === "All" || !MAPS.includes(l.map) ? MAPS : [l.map];
    const groups = agentsOf(l).filter((x) => agentById[x]).map((x) => ({ agent: agentById[x], links: photoLinks(x, maps) }));
    return `
      <p>${t("photoExternal")}</p>
      ${groups.map((g) => `
        <div class="photo-group">
          <div class="agent-line">${avatar(g.agent)} <b>${esc(agentName(g.agent))}</b></div>
          <div class="chips">
            ${g.links.map((p) => `<a class="chip" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(mapName(p.map))} · ${esc(p.source)} ↗</a>`).join("")}
          </div>
        </div>`).join("")}`;
  }

  function viewLineup(id, tab) {
    const l = LINEUPS.find((x) => x.id === id);
    if (!l) return viewNotFound();
    const agents = agentsOf(l).map((x) => agentById[x] || { id: x, name: x, role: "" });
    const steps = l.steps || [];
    const active = tab === "photos" || tab === "video" ? tab : (l.video ? "video" : "photos");

    app.innerHTML = `
      <div class="crumbs">
        <a href="#/">${t("home")}</a> /
        ${agents.map((a) => `<a href="#/agent/${esc(a.id)}">${esc(agentName(a))}</a>`).join(", ")} /
        ${esc(l.title)}
      </div>
      <div class="detail-head">
        <h1>${esc(l.title)}</h1>
        <div class="meta">
          ${l.kind === "guide" ? `<span class="badge guide">${t("guide")}</span>` : ""}
          <span class="badge">${esc(mapName(l.map))}</span>
          ${l.site ? `<span class="badge">${t("site")} ${esc(l.site)}</span>` : ""}
          ${sideBadge(l.side)}
          ${l.ability ? `<span class="badge">${esc(l.ability)}</span>` : ""}
          ${langBadge(l.lang)}
          ${stars(l.difficulty)}
          ${(l.tags || []).map((g) => `<span class="badge">#${esc(g)}</span>`).join("")}
        </div>
      </div>
      ${l.notes ? `<div class="notes">${esc(l.notes)}</div>` : ""}
      <div class="tabs" role="tablist">
        <button type="button" class="tab${active === "video" ? " active" : ""}" data-tab="video">▶ ${t("video")}</button>
        <button type="button" class="tab${active === "photos" ? " active" : ""}" data-tab="photos">🖼 ${t("photos")}${steps.length ? ` (${steps.length})` : " ↗"}</button>
      </div>
      <div class="panel">${active === "video" ? videoEmbed(l.video) : photoPanel(l)}</div>`;

    app.querySelectorAll("[data-tab]").forEach((b) =>
      b.addEventListener("click", () => {
        history.replaceState(null, "", `#/lineup/${encodeURIComponent(id)}/${b.dataset.tab}`);
        viewLineup(id, b.dataset.tab);
      })
    );
    app.querySelectorAll("[data-step]").forEach((img) =>
      img.addEventListener("click", () => openLightbox(steps, +img.dataset.step))
    );
  }

  function viewSearch(q) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = LINEUPS.filter((l) => {
      const agents = agentsOf(l).map((x) => agentById[x] || {});
      const hay = [l.title, l.map, MAP_CN[l.map], l.site, l.ability, l.side, t(l.side), l.notes, LANG_LABEL[l.lang],
        ...agents.flatMap((a) => [a.name, a.cn]), ...(l.tags || [])]
        .join(" ").toLowerCase();
      return words.every((w) => hay.includes(w));
    });
    app.innerHTML = `
      <div class="crumbs"><a href="#/">${t("home")}</a> / ${t("searchResults")}</div>
      <h1>${t("searchResults")}: “${esc(q)}”</h1>
      ${hits.length ? `<div class="lineup-grid">${hits.map((l) => lineupCard(l, true)).join("")}</div>`
                    : `<div class="empty">${t("searchEmpty")}</div>`}`;
  }

  function viewNotFound() {
    app.innerHTML = `<div class="empty">${t("notFound")}<br><br><a class="chip" href="#/">${t("back")}</a></div>`;
  }

  // ---------- lightbox ----------
  const lb = document.getElementById("lightbox");
  const lbImg = lb.querySelector("img");
  const lbCap = lb.querySelector("figcaption");
  let lbSteps = [];
  let lbIndex = 0;

  function openLightbox(steps, i) {
    lbSteps = steps;
    showLightbox(i);
    lb.hidden = false;
  }
  function showLightbox(i) {
    lbIndex = (i + lbSteps.length) % lbSteps.length;
    const s = lbSteps[lbIndex];
    lbImg.src = s.img;
    lbCap.textContent = `${lbIndex + 1} / ${lbSteps.length} · ${s.caption || ""}`;
  }
  const closeLightbox = () => { lb.hidden = true; lbImg.removeAttribute("src"); };

  lb.querySelector(".lb-close").addEventListener("click", closeLightbox);
  lb.querySelector(".lb-prev").addEventListener("click", () => showLightbox(lbIndex - 1));
  lb.querySelector(".lb-next").addEventListener("click", () => showLightbox(lbIndex + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showLightbox(lbIndex - 1);
    else if (e.key === "ArrowRight") showLightbox(lbIndex + 1);
  });

  // ---------- search box ----------
  const search = document.getElementById("global-search");
  search.addEventListener("input", () => {
    const q = search.value.trim();
    const target = q ? `#/search/${encodeURIComponent(q)}` : "#/";
    if (location.hash.startsWith("#/search/")) history.replaceState(null, "", target);
    else history.pushState(null, "", target);
    route();
  });

  // ---------- language ----------
  const langBtn = document.getElementById("lang-toggle");
  function applyLang() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    langBtn.textContent = lang === "zh" ? "EN" : "中文";
    search.placeholder = t("searchPlaceholder");
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  }
  langBtn.addEventListener("click", () => {
    lang = lang === "zh" ? "en" : "zh";
    writePref("lang", lang);
    applyLang();
    route();
  });

  // ---------- router ----------
  function route() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
    const [page, arg, sub] = parts;
    if (page !== "search" && search.value) search.value = "";
    if (!page) viewHome();
    else if (page === "agent") viewAgent(arg);
    else if (page === "lineup") viewLineup(arg, sub);
    else if (page === "search") { if (search.value !== arg) search.value = arg || ""; viewSearch(arg || ""); }
    else viewNotFound();
    if (page !== "search") window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", route);
  applyLang();
  route();
})();
