(function () {
  "use strict";

  const AGENTS = window.AGENTS || [];
  const LINEUPS = window.LINEUPS || [];
  const MAPS = window.MAPS || [];
  const MAP_CN = window.MAP_CN || {};
  const PHOTO_SOURCES = window.PHOTO_SOURCES || [];
  const agentById = Object.fromEntries(AGENTS.map((a) => [a.id, a]));
  // Set window.VALO_LINK_ONLY_VIDEO = true where iframes are blocked: videos then open on their own site.
  const LINK_ONLY_VIDEO = window.VALO_LINK_ONLY_VIDEO === true;

  // ---------- i18n ----------
  const I18N = {
    zh: {
      searchPlaceholder: "搜索英雄、地图、技能、点位…",
      heroTitle: "英雄点位",
      heroSub: "每个点位都有视频教程和图文教程（站位 → 瞄准 → 落点）",
      all: "全部",
      allMaps: "全地图",
      duelist: "决斗者",
      initiator: "先锋",
      controller: "控场者",
      sentinel: "哨卫",
      lineups: "个点位",
      guides: "个合集",
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
      lineupsSection: "点位教程",
      lineupsSectionSub: "单个点位：视频 + 图文步骤",
      guidesSection: "视频合集",
      guidesSectionSub: "一个视频讲解整张地图的多个点位",
      noSingleLineups: "这个英雄还没有单个点位教程。",
      addFirst: "＋ 用点位制作工具添加",
      addLineup: "＋ 添加点位",
      emptyFilter: "没有符合筛选条件的内容。",
      video: "视频教程",
      photos: "图文教程",
      noVideo: "这个点位暂无视频。",
      openVideo: "打开视频 ↗",
      watchOn: "在 {site} 观看 ↗",
      openOriginal: "在原网站观看 / 给作者点赞 ↗",
      photoLibrary: "图文点位库",
      photoLibrarySub: "每个点位都有站位、瞄准、落点截图，按地图选择：",
      photoExternal: "这是一个多点位的视频合集，没有自带截图。同英雄同地图的图文点位（站位 → 瞄准 → 落点）：",
      missingPhotos: "这个点位还没有图文步骤。",
      hasVideo: "视频",
      hasPhotos: "图文",
      difficulty: "难度",
      notFound: "找不到这个页面。",
      back: "返回首页",
      searchResults: "搜索结果",
      searchEmpty: "没有找到相关点位。",
      previewBanner: "预览 — 这个点位还没有保存到网站。",
      backToMaker: "← 返回制作工具",
      fromGuide: "出自视频合集：",
      inThisGuide: "这个合集里的点位",
      footer: "Valo Lineup · 非官方粉丝站，与 Riot Games 无关 · 视频版权归原作者所有",
    },
    en: {
      searchPlaceholder: "Search agents, maps, abilities, lineups…",
      heroTitle: "Agent Lineups",
      heroSub: "Every lineup has a video and a photo guide (stand → aim → result)",
      all: "All",
      allMaps: "All maps",
      duelist: "Duelist",
      initiator: "Initiator",
      controller: "Controller",
      sentinel: "Sentinel",
      lineups: "lineups",
      guides: "guides",
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
      lineupsSection: "Lineups",
      lineupsSectionSub: "One lineup each: video + photo steps",
      guidesSection: "Video guides",
      guidesSectionSub: "One video covering many lineups on a map",
      noSingleLineups: "No single lineups for this agent yet.",
      addFirst: "＋ Add one with the lineup maker",
      addLineup: "＋ Add lineup",
      emptyFilter: "Nothing matches these filters.",
      video: "Video",
      photos: "Photo Guide",
      noVideo: "No video for this lineup yet.",
      openVideo: "Open video ↗",
      watchOn: "Watch on {site} ↗",
      openOriginal: "Watch on the original site / support the creator ↗",
      photoLibrary: "Photo lineup library",
      photoLibrarySub: "Stand, aim and result screenshots for every lineup — pick a map:",
      photoExternal: "This is a multi-lineup video guide without screenshots of its own. Photo lineups (stand → aim → result) for the same agent and map:",
      missingPhotos: "This lineup has no photo steps yet.",
      hasVideo: "Video",
      hasPhotos: "Photos",
      difficulty: "Difficulty",
      notFound: "Page not found.",
      back: "Back to home",
      searchResults: "Search results",
      searchEmpty: "No lineups found.",
      previewBanner: "Preview — this lineup is not saved to the site yet.",
      backToMaker: "← Back to the lineup maker",
      fromGuide: "From the video guide:",
      inThisGuide: "Lineups in this guide",
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
  const isGuide = (l) => l.kind === "guide";
  const lineupsFor = (agentId) => LINEUPS.filter((l) => agentsOf(l).includes(agentId));

  function setHash(hash, replace) {
    try {
      if (replace) history.replaceState(null, "", hash);
      else history.pushState(null, "", hash);
      return true;
    } catch (e) {
      return false; // history may be locked down in sandboxed frames
    }
  }

  function photoLinks(agentId, maps) {
    return PHOTO_SOURCES.flatMap((src) =>
      maps.map((m) => ({
        source: src.name,
        map: m,
        url: src.url.replace("{agent}", encodeURIComponent(agentId)).replace("{map}", encodeURIComponent(m.toLowerCase())),
      }))
    );
  }

  const secs = (v) => Math.max(0, parseInt(v, 10) || 0);

  function videoSourceUrl(v) {
    if (!v) return "";
    if (v.type === "youtube") return `https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}${v.start ? `&t=${secs(v.start)}s` : ""}`;
    if (v.type === "bilibili") {
      const q = [v.page > 1 ? `p=${secs(v.page)}` : "", v.start ? `t=${secs(v.start)}` : ""].filter(Boolean).join("&");
      return `https://www.bilibili.com/video/${encodeURIComponent(v.bvid)}/${q ? "?" + q : ""}`;
    }
    if (v.type === "link") return v.url;
    return "";
  }

  function thumbnailOf(l) {
    if (l.thumbnail) return l.thumbnail;
    const withImg = (l.steps || []).filter((s) => s.img);
    if (withImg.length) return withImg[withImg.length - 1].img;
    if (l.video && l.video.type === "youtube") return `https://i.ytimg.com/vi/${encodeURIComponent(l.video.id)}/hqdefault.jpg`;
    return "";
  }

  function fmtTime(sec) {
    const s = Math.floor(sec);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  // ---------- frame steps ----------
  // A step with `at` (seconds) instead of `img` shows the lineup's own embedded video
  // paused on that moment, so photo steps can come from a video without copying its frames.
  let ytApi = null;
  function loadYouTubeApi() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (ytApi) return ytApi;
    ytApi = new Promise((resolve, reject) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(window.YT); };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.onerror = () => { ytApi = null; reject(new Error("YouTube API unavailable")); };
      document.head.appendChild(s);
    });
    return ytApi;
  }

  function frameFallback(el, v, at) {
    const url = videoSourceUrl({ ...v, start: at });
    el.innerHTML = `<a class="frame-link" href="${esc(url)}" target="_blank" rel="noopener">▶ ${fmtTime(at)} ↗</a>`;
  }

  function mountFrame(el, v) {
    const at = parseFloat(el.dataset.at) || 0;
    if (LINK_ONLY_VIDEO) return frameFallback(el, v, at);
    if (v.type === "bilibili") {
      el.innerHTML = `<iframe src="https://player.bilibili.com/player.html?bvid=${encodeURIComponent(v.bvid)}&page=${secs(v.page || 1) || 1}&t=${Math.floor(at)}&autoplay=0"
        allow="fullscreen" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"></iframe>`;
      return;
    }
    loadYouTubeApi().then((YT) => {
      const holder = document.createElement("div");
      el.appendChild(holder);
      let frozen = false;
      new YT.Player(holder, {
        videoId: v.id,
        host: "https://www.youtube-nocookie.com",
        playerVars: { start: Math.floor(at), autoplay: 1, mute: 1, rel: 0, playsinline: 1, controls: 0, disablekb: 1 },
        events: {
          onStateChange: (e) => {
            if (frozen || e.data !== YT.PlayerState.PLAYING) return;
            frozen = true;
            e.target.seekTo(at, true);
            e.target.pauseVideo();
          },
        },
      });
    }).catch(() => frameFallback(el, v, at));
  }

  function setupFrames(container, v) {
    const frames = container.querySelectorAll("[data-at]");
    if (!frames.length || !v) return;
    if (!("IntersectionObserver" in window)) return frames.forEach((el) => mountFrame(el, v));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        mountFrame(en.target, v);
      });
    }, { rootMargin: "200px" });
    frames.forEach((el) => io.observe(el));
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
          const all = lineupsFor(a.id);
          const single = all.filter((l) => !isGuide(l)).length;
          const guides = all.length - single;
          const parts = [single ? `<b>${single}</b> ${t("lineups")}` : "", guides ? `<b>${guides}</b> ${t("guides")}` : ""].filter(Boolean);
          return `
            <a class="agent-card role-${esc(a.role)}${all.length ? "" : " no-lineups"}" href="#/agent/${esc(a.id)}">
              ${avatar(a)}
              <div class="name">${esc(agentName(a))}</div>
              ${agentSubName(a) ? `<div class="cn">${esc(agentSubName(a))}</div>` : ""}
              <div class="count">${parts.length ? parts.join(" · ") : t("noLineups")}</div>
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
    const f = (state.filters[id] ||= { map: "all", side: "all", lang: "all" });

    const mapsUsed = MAPS.filter((m) => all.some((l) => l.map === m))
      .concat([...new Set(all.map((l) => l.map))].filter((m) => !MAPS.includes(m) && m !== "All"))
      .concat(all.some((l) => l.map === "All") ? ["All"] : []);
    const langs = [...new Set(all.map((l) => l.lang).filter(Boolean))];
    const sides = ["attack", "defense", "both"].filter((s) => all.some((l) => l.side === s));

    const shown = all.filter((l) =>
      (f.map === "all" || l.map === f.map) &&
      (f.side === "all" || l.side === f.side) &&
      (f.lang === "all" || l.lang === f.lang)
    );
    const singles = shown.filter((l) => !isGuide(l));
    const guides = shown.filter(isGuide);

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
    const grid = (items, showAgent) => `<div class="lineup-grid">${items.map((l) => lineupCard(l, showAgent)).join("")}</div>`;

    app.innerHTML = `
      <div class="crumbs"><a href="#/">${t("home")}</a> / ${esc(agentName(a))}</div>
      <div class="agent-head role-${esc(a.role)}">
        ${avatar(a, "lg")}
        <div>
          <h1>${esc(agentName(a))}${agentSubName(a) ? ` <span class="sub">${esc(agentSubName(a))}</span>` : ""}</h1>
          <div class="role">${t(a.role)}</div>
        </div>
      </div>
      ${all.length ? `
        ${filterRow(t("map"), "map", mapsUsed, mapName)}
        ${sides.length > 1 ? filterRow(t("side"), "side", sides, (s) => t(s)) : ""}
        ${langs.length > 1 ? filterRow(t("language"), "lang", langs, (c) => esc(LANG_LABEL[c] || c)) : ""}` : ""}

      <section class="section">
        <h2>${t("lineupsSection")} <span class="count-pill">${singles.length}</span></h2>
        <p class="sub">${t("lineupsSectionSub")}</p>
        ${singles.length ? grid(singles, false) : `
          <div class="empty">${all.some((l) => !isGuide(l)) ? t("emptyFilter") : t("noSingleLineups")}
            <br><br><a class="chip active" href="#/maker/${esc(id)}">${t("addFirst")}</a></div>`}
      </section>

      ${guides.length || all.some(isGuide) ? `
        <section class="section">
          <h2>${t("guidesSection")} <span class="count-pill">${guides.length}</span></h2>
          <p class="sub">${t("guidesSectionSub")}</p>
          ${guides.length ? grid(guides, false) : `<div class="empty">${t("emptyFilter")}</div>`}
        </section>` : ""}

      ${photo.length ? `
        <section class="section">
          <h2>${t("photoLibrary")}</h2>
          <p class="sub">${t("photoLibrarySub")}</p>
          <div class="chips">
            ${photo.map((p) => `<a class="chip" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(mapName(p.map))} ↗</a>`).join("")}
          </div>
          <p class="source-note">${[...new Set(photo.map((p) => p.source))].map(esc).join(" · ")}</p>
        </section>` : ""}`;

    app.querySelectorAll("[data-k]").forEach((b) =>
      b.addEventListener("click", () => { f[b.dataset.k] = b.dataset.v; viewAgent(id); })
    );
  }

  function lineupCard(l, showAgent) {
    const agents = agentsOf(l).map((x) => agentById[x]).filter(Boolean);
    const thumb = thumbnailOf(l);
    const hasPhotos = l.steps && l.steps.length;
    return `
      <a class="lineup-card" href="#/lineup/${encodeURIComponent(l.id)}">
        <div class="thumb">
          <div class="thumb-text">${esc(mapName(l.map))}</div>
          ${thumb ? `<img src="${esc(thumb)}" alt="" loading="lazy" onerror="this.remove()">` : ""}
          <div class="badges">
            ${l.video ? `<span class="badge has-video">▶ ${t("hasVideo")}</span>` : ""}
            ${hasPhotos ? `<span class="badge has-photos">🖼 ${t("hasPhotos")} ${l.steps.length}</span>` : ""}
            ${isGuide(l) ? `<span class="badge guide">${t("guide")}</span>` : ""}
          </div>
        </div>
        <div class="body">
          ${showAgent && agents.length ? `<div class="agent-line">${agents.map((a) => avatar(a)).join("")} ${agents.map((a) => esc(agentName(a))).join(" · ")}</div>` : ""}
          <div class="title">${esc(l.title)}</div>
          <div class="meta">
            <span class="badge">${esc(mapName(l.map))}</span>
            ${l.site ? `<span class="badge">${esc(l.site)}</span>` : ""}
            ${sideBadge(l.side)}
            ${!isGuide(l) && l.ability ? `<span class="badge">${esc(l.ability)}</span>` : ""}
            ${langBadge(l.lang)}
            ${stars(l.difficulty)}
          </div>
        </div>
      </a>`;
  }

  function videoEmbed(v) {
    if (!v) return `<div class="empty">${t("noVideo")}</div>`;
    if (LINK_ONLY_VIDEO && (v.type === "youtube" || v.type === "bilibili")) {
      const site = v.type === "youtube" ? "YouTube" : "Bilibili";
      return `<a class="video-link" href="${esc(videoSourceUrl(v))}" target="_blank" rel="noopener">▶ ${t("watchOn").replace("{site}", site)}</a>`;
    }
    let player = "";
    switch (v.type) {
      case "youtube": {
        const q = [v.start ? `start=${secs(v.start)}` : "", v.end ? `end=${secs(v.end)}` : "", "rel=0"].filter(Boolean).join("&");
        player = `<div class="video-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?${q}"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>`;
        break;
      }
      case "bilibili": {
        const q = `bvid=${encodeURIComponent(v.bvid)}&page=${secs(v.page || 1) || 1}${v.start ? `&t=${secs(v.start)}` : ""}&autoplay=0&high_quality=1`;
        player = `<div class="video-wrap"><iframe src="https://player.bilibili.com/player.html?${q}"
          allow="fullscreen" allowfullscreen loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"></iframe></div>`;
        break;
      }
      case "file": {
        // A media fragment (#t=start,end) plays just the lineup's part of a longer recording.
        const frag = v.start || v.end ? `#t=${secs(v.start)}${v.end ? "," + secs(v.end) : ""}` : "";
        return `<div class="video-wrap"><video src="${esc(v.src + frag)}" controls playsinline preload="metadata"${v.poster ? ` poster="${esc(v.poster)}"` : ""}></video></div>`;
      }
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
      let imgIndex = 0;
      return `
        <div class="steps">
          ${steps.map((s, i) => `
            <div class="step">
              ${s.img
                ? `<img src="${esc(s.img)}" alt="${esc(s.caption || "")}" data-step="${imgIndex++}" loading="lazy">`
                : `<div class="frame${s.zoom ? " zoomed" : ""}" data-at="${esc(s.at)}"${s.zoom ? ` style="--zoom:${Number(s.zoom)}"` : ""}><span class="frame-time">${fmtTime(s.at || 0)}</span></div>`}
              <div class="text"><div class="num">${i + 1}</div><div class="caption">${esc(s.caption || "")}</div></div>
            </div>`).join("")}
        </div>`;
    }
    const maps = l.map === "All" || !MAPS.includes(l.map) ? MAPS : [l.map];
    const groups = agentsOf(l).filter((x) => agentById[x]).map((x) => ({ agent: agentById[x], links: photoLinks(x, maps) }));
    return `
      <p>${isGuide(l) ? t("photoExternal") : t("missingPhotos")}</p>
      ${groups.map((g) => `
        <div class="photo-group">
          <div class="agent-line">${avatar(g.agent)} <b>${esc(agentName(g.agent))}</b></div>
          <div class="chips">
            ${g.links.map((p) => `<a class="chip" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(mapName(p.map))} · ${esc(p.source)} ↗</a>`).join("")}
          </div>
        </div>`).join("")}`;
  }

  // Renders one lineup. `preview` is an unsaved lineup object from the maker.
  function viewLineup(id, preview) {
    const l = preview || LINEUPS.find((x) => x.id === id);
    if (!l) return viewNotFound();
    const agents = agentsOf(l).map((x) => agentById[x] || { id: x, name: x, role: "" });
    const steps = l.steps || [];
    const imgSteps = steps.filter((s) => s.img);
    const parent = l.from && LINEUPS.find((x) => x.id === l.from);
    const children = LINEUPS.filter((x) => x.from === l.id);

    app.innerHTML = `
      ${preview ? `<div class="notes preview-banner">${t("previewBanner")} <a href="#/maker">${t("backToMaker")}</a></div>` : ""}
      <div class="crumbs">
        <a href="#/">${t("home")}</a> /
        ${agents.map((a) => `<a href="#/agent/${esc(a.id)}">${esc(agentName(a))}</a>`).join(", ")} /
        ${esc(l.title)}
      </div>
      <div class="detail-head">
        <h1>${esc(l.title)}</h1>
        <div class="meta">
          ${isGuide(l) ? `<span class="badge guide">${t("guide")}</span>` : ""}
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
      ${parent ? `<p class="source-note">${t("fromGuide")} <a href="#/lineup/${encodeURIComponent(parent.id)}">${esc(parent.title)}</a></p>` : ""}
      <section class="section">
        <h2>▶ ${t("video")}</h2>
        ${videoEmbed(l.video)}
      </section>
      <section class="section">
        <h2>🖼 ${t("photos")}${steps.length ? ` <span class="count-pill">${steps.length}</span>` : ""}</h2>
        ${photoPanel(l)}
      </section>
      ${children.length ? `
        <section class="section">
          <h2>${t("inThisGuide")} <span class="count-pill">${children.length}</span></h2>
          <div class="lineup-grid">${children.map((c) => lineupCard(c, false)).join("")}</div>
        </section>` : ""}`;

    app.querySelectorAll("[data-step]").forEach((img) =>
      img.addEventListener("click", () => openLightbox(imgSteps, +img.dataset.step))
    );
    setupFrames(app, l.video);
  }

  function viewSearch(q) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = LINEUPS.filter((l) => {
      const agents = agentsOf(l).map((x) => agentById[x] || {});
      const hay = [l.title, l.map, MAP_CN[l.map], l.site, l.ability, l.side, t(l.side), l.notes, LANG_LABEL[l.lang],
        ...agents.flatMap((a) => [a.name, a.cn]), ...(l.tags || [])]
        .join(" ").toLowerCase();
      return words.every((w) => hay.includes(w));
    }).sort((a, b) => isGuide(a) - isGuide(b));
    app.innerHTML = `
      <div class="crumbs"><a href="#/">${t("home")}</a> / ${t("searchResults")}</div>
      <h1>${t("searchResults")}: “${esc(q)}”</h1>
      ${hits.length ? `<div class="lineup-grid">${hits.map((l) => lineupCard(l, true)).join("")}</div>`
                    : `<div class="empty">${t("searchEmpty")}</div>`}`;
  }

  function viewNotFound() {
    app.innerHTML = `<div class="empty">${t("notFound")}<br><br><a class="chip" href="#/">${t("back")}</a></div>`;
  }

  function viewMaker(agentId) {
    if (!window.ValoMaker) return viewNotFound();
    window.ValoMaker.render(app, {
      lang, esc, agentName, mapName, agentById,
      agents: AGENTS, maps: MAPS, lineups: LINEUPS, presetAgent: agentId,
      preview: (lineup) => { setHash("#/preview"); viewLineup(null, lineup); window.scrollTo(0, 0); },
    });
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

  // ---------- top bar ----------
  const search = document.getElementById("global-search");
  search.addEventListener("input", () => {
    const q = search.value.trim();
    setHash(q ? `#/search/${encodeURIComponent(q)}` : "#/", location.hash.startsWith("#/search/"));
    if (q) viewSearch(q); else route();
  });

  const addLink = document.getElementById("add-link");
  const langBtn = document.getElementById("lang-toggle");
  function applyLang() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    langBtn.textContent = lang === "zh" ? "EN" : "中文";
    search.placeholder = t("searchPlaceholder");
    if (addLink) addLink.textContent = t("addLineup");
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  }
  langBtn.addEventListener("click", () => {
    lang = lang === "zh" ? "en" : "zh";
    writePref("lang", lang);
    applyLang();
    if (!location.hash.startsWith("#/maker") && location.hash !== "#/preview") route();
  });

  // ---------- router ----------
  function route() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
    const [page, arg] = parts;
    if (page !== "search" && search.value) search.value = "";
    if (!page) viewHome();
    else if (page === "agent") viewAgent(arg);
    else if (page === "lineup") viewLineup(arg);
    else if (page === "maker") viewMaker(arg);
    else if (page === "preview") return; // stays on the maker's preview until the user navigates
    else if (page === "search") { if (search.value !== arg) search.value = arg || ""; viewSearch(arg || ""); }
    else viewNotFound();
    if (page !== "search") window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", route);
  applyLang();
  route();
})();
