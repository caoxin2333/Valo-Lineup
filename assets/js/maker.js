// 点位制作工具 / Lineup maker (#/maker).
// Builds one lineup with both a video and photo steps, then exports a pack
// (images + video clip + the entry for data/lineups.js) to add to the repo.
(function () {
  "use strict";

  // Bundled copy first; the CDN is a fallback for pages hosted without the vendor folder.
  const JSZIP_URLS = ["assets/vendor/jszip-3.10.1.min.js", "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"];
  const MAX_IMG_WIDTH = 1600;
  const BIG_VIDEO_MB = 40;

  const I18N = {
    zh: {
      title: "点位制作工具",
      intro: "每个点位 = 一段视频 + 图文步骤（站位 → 瞄准 → 落点）。录一段点位视频，在这里截出关键画面，导出后放进网站。",
      s1: "1. 点位信息",
      agent: "英雄", map: "地图", side: "攻防", site: "包点", ability: "技能", titleField: "标题",
      difficulty: "难度", notes: "说明（可选）", videoLang: "视频语言",
      attack: "进攻", defense: "防守", both: "双方", easy: "简单", medium: "中等", hard: "困难", none: "无",
      titlePh: "例如：A Main 到 A 点侦察箭", sitePh: "A / B / C / Mid", abilityPh: "例如：Recon Bolt",
      notesPh: "例如：需要跳投；左键满蓄力，1 次弹射",
      s2: "2. 视频",
      modeFile: "我自己的录像", modeYt: "YouTube 链接", modeBili: "Bilibili 链接",
      fileHint: "用 OBS / NVIDIA / Xbox Game Bar 录下这个点位（站好位 → 瞄准 → 扔出去 → 落点），选择视频文件：",
      chooseVideo: "选择视频文件",
      setStart: "设为起点", setEnd: "设为终点", clearRange: "清除区间",
      range: "片段", whole: "整段视频",
      capture: "📸 截取当前画面为步骤",
      captureHint: "暂停在 站位 / 瞄准 / 落点 的画面上，点“截取”。",
      exportClip: "生成片段",
      recording: "正在生成片段（按实际时长播放一遍）…",
      clipReady: "片段已生成",
      clipFailed: "这个浏览器无法生成片段，将使用整段视频。",
      bigVideo: "视频超过 {mb} MB，建议设置起点和终点并生成片段。",
      ytUrl: "YouTube 链接", biliUrl: "Bilibili 链接或 BV 号", start: "开始 (分:秒)", end: "结束 (分:秒)",
      linkHint: "链接视频无法直接截图。请在游戏里截图（Win+Shift+S），然后在下面粘贴 Ctrl+V 或上传。",
      badLink: "无法识别这个链接",
      s3: "3. 图文步骤",
      stepsHint: "建议 3 张：站位、瞄准、落点。可以截取视频画面、上传图片，或直接 Ctrl+V 粘贴截图。",
      upload: "上传图片", noSteps: "还没有图文步骤。",
      captions: ["站位：", "瞄准：", "落点："], captionMore: "补充：",
      up: "上移", down: "下移", remove: "删除",
      s4: "4. 导出",
      idField: "点位 ID（网址用）",
      preview: "预览", download: "下载点位包 (.zip)", copy: "复制代码", copied: "已复制",
      need: "还缺：", needAgent: "英雄", needMap: "地图", needTitle: "标题", needVideo: "视频", needSteps: "至少 1 张图文步骤",
      howTo: "怎么放进网站",
      howToSteps: [
        "解压下载的 zip，把里面的 media 文件夹放进网站根目录（GitHub 网页上：Add file → Upload files，直接拖进去）。",
        "打开 data/lineups.js，把下面的代码粘贴到 window.LINEUPS = [ 下面。",
        "提交后刷新网站，点位就出现了。",
      ],
      zipFailed: "无法加载压缩库，文件会逐个下载。",
      roles: { controller: "控场者", initiator: "先锋", sentinel: "哨卫", duelist: "决斗者" },
      working: "处理中…",
    },
    en: {
      title: "Lineup maker",
      intro: "Every lineup = one video + photo steps (stand → aim → result). Record the lineup, grab the key frames here, then export it to the site.",
      s1: "1. Lineup details",
      agent: "Agent", map: "Map", side: "Side", site: "Site", ability: "Ability", titleField: "Title",
      difficulty: "Difficulty", notes: "Notes (optional)", videoLang: "Video language",
      attack: "Attack", defense: "Defense", both: "Both", easy: "Easy", medium: "Medium", hard: "Hard", none: "None",
      titlePh: "e.g. A Main to A Site recon", sitePh: "A / B / C / Mid", abilityPh: "e.g. Recon Bolt",
      notesPh: "e.g. Jump-throw; full charge, 1 bounce",
      s2: "2. Video",
      modeFile: "My own recording", modeYt: "YouTube link", modeBili: "Bilibili link",
      fileHint: "Record the lineup with OBS / NVIDIA / Xbox Game Bar (stand → aim → throw → result), then pick the file:",
      chooseVideo: "Choose video file",
      setStart: "Set start", setEnd: "Set end", clearRange: "Clear range",
      range: "Clip", whole: "Whole video",
      capture: "📸 Capture this frame as a step",
      captureHint: "Pause on the stand / aim / result moments and press Capture.",
      exportClip: "Make clip",
      recording: "Making the clip (plays through once in real time)…",
      clipReady: "Clip ready",
      clipFailed: "This browser can't make clips, so the whole video will be used.",
      bigVideo: "The video is over {mb} MB. Set a start and end and make a clip.",
      ytUrl: "YouTube link", biliUrl: "Bilibili link or BV id", start: "Start (m:ss)", end: "End (m:ss)",
      linkHint: "Linked videos can't be captured. Take screenshots in game (Win+Shift+S), then paste with Ctrl+V or upload below.",
      badLink: "Can't read this link",
      s3: "3. Photo steps",
      stepsHint: "Use 3 shots: stand, aim, result. Capture frames from the video, upload images, or paste a screenshot with Ctrl+V.",
      upload: "Upload images", noSteps: "No photo steps yet.",
      captions: ["Stand: ", "Aim: ", "Result: "], captionMore: "Note: ",
      up: "Move up", down: "Move down", remove: "Remove",
      s4: "4. Export",
      idField: "Lineup ID (used in the URL)",
      preview: "Preview", download: "Download lineup pack (.zip)", copy: "Copy code", copied: "Copied",
      need: "Still needed: ", needAgent: "agent", needMap: "map", needTitle: "title", needVideo: "video", needSteps: "at least 1 photo step",
      howTo: "How to add it to the site",
      howToSteps: [
        "Unzip the pack and put its media folder in the site's root folder (on GitHub: Add file → Upload files, then drag it in).",
        "Open data/lineups.js and paste the code below right under window.LINEUPS = [.",
        "Commit, refresh the site, and the lineup appears.",
      ],
      zipFailed: "Couldn't load the zip library, so the files will download one by one.",
      roles: { controller: "Controller", initiator: "Initiator", sentinel: "Sentinel", duelist: "Duelist" },
      working: "Working…",
    },
  };

  // The draft lives in memory, so it survives a trip to the preview and back.
  const draft = {
    agent: "", map: "", side: "attack", site: "", ability: "", title: "", difficulty: "1", notes: "", lang: "",
    mode: "file",
    file: null, fileUrl: "", start: null, end: null, clip: null, clipUrl: "",
    ytUrl: "", ytStart: "", ytEnd: "", biliUrl: "", biliStart: "",
    steps: [], // { blob, url, caption }
    id: "", idEdited: false,
  };

  let ctx = null;
  let root = null;
  let L = I18N.zh;

  const $ = (sel) => root.querySelector(sel);
  const esc = (s) => ctx.esc(s);

  // ---------- small utils ----------
  function slug(s) {
    return String(s || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function parseTime(s) {
    s = String(s || "").trim();
    if (!s) return 0;
    return s.split(":").reduce((acc, p) => acc * 60 + (parseFloat(p) || 0), 0);
  }

  function fmtTime(sec) {
    if (sec == null) return "–";
    const m = Math.floor(sec / 60);
    const s = (sec - m * 60).toFixed(1).padStart(4, "0");
    return `${m}:${s}`;
  }

  function youtubeId(url) {
    const m = String(url).match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/|\/live\/)([A-Za-z0-9_-]{11})/) || String(url).match(/^([A-Za-z0-9_-]{11})$/);
    return m ? m[1] : "";
  }

  function biliInfo(url) {
    const m = String(url).match(/(BV[A-Za-z0-9]{10})/);
    if (!m) return null;
    const p = String(url).match(/[?&]p=(\d+)/);
    return { bvid: m[1], page: p ? parseInt(p[1], 10) : 1 };
  }

  function once(target, event) {
    return new Promise((resolve) => target.addEventListener(event, resolve, { once: true }));
  }

  function downloadBlob(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // Draws an image or video frame onto a canvas no wider than MAX_IMG_WIDTH and returns a JPEG blob.
  function toJpeg(source, width, height) {
    const scale = Math.min(1, MAX_IMG_WIDTH / width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  }

  async function imageFileToJpeg(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return await toJpeg(img, img.naturalWidth, img.naturalHeight);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function addStep(blob) {
    const i = draft.steps.length;
    const caption = i < L.captions.length ? L.captions[i] : L.captionMore;
    draft.steps.push({ blob, url: URL.createObjectURL(blob), caption });
    renderSteps();
    renderExport();
  }

  async function addImageFiles(files) {
    for (const f of files) {
      if (!f.type.startsWith("image/")) continue;
      const blob = await imageFileToJpeg(f);
      if (blob) addStep(blob);
    }
  }

  // ---------- the lineup this draft produces ----------
  function lineupId() {
    if (draft.idEdited && draft.id) return draft.id;
    const base = [draft.agent, slug(draft.map), slug(draft.site), slug(draft.ability), slug(draft.title)].filter(Boolean).join("-") || "lineup";
    let id = base.slice(0, 80).replace(/-+$/, "");
    const taken = new Set(ctx.lineups.map((l) => l.id));
    for (let n = 2; taken.has(id); n++) id = `${base.slice(0, 76)}-${n}`;
    return id;
  }

  function videoFile() {
    if (draft.mode !== "file") return null;
    if (draft.clip) return { blob: draft.clip, ext: draft.clip.type.includes("mp4") ? "mp4" : "webm", range: false };
    if (!draft.file) return null;
    const ext = (draft.file.name.split(".").pop() || "mp4").toLowerCase();
    return { blob: draft.file, ext, range: true };
  }

  // `forPreview` uses in-memory blob URLs; otherwise the paths the files will have in the repo.
  function buildLineup(forPreview) {
    const id = lineupId();
    const dir = `media/${draft.agent || "agent"}`;
    const l = { id, agent: draft.agent, map: draft.map, side: draft.side };
    if (draft.site) l.site = draft.site;
    if (draft.ability) l.ability = draft.ability;
    l.title = draft.title;
    if (draft.lang) l.lang = draft.lang;
    if (draft.difficulty) l.difficulty = parseInt(draft.difficulty, 10);
    if (draft.notes) l.notes = draft.notes;

    if (draft.mode === "file") {
      const vf = videoFile();
      if (vf) {
        l.video = { type: "file", src: forPreview ? (draft.clip ? draft.clipUrl : draft.fileUrl) : `${dir}/${id}.${vf.ext}` };
        if (vf.range && draft.start != null) l.video.start = Math.floor(draft.start);
        if (vf.range && draft.end != null) l.video.end = Math.ceil(draft.end);
      }
    } else if (draft.mode === "youtube") {
      const vid = youtubeId(draft.ytUrl);
      if (vid) {
        l.video = { type: "youtube", id: vid };
        const s = Math.floor(parseTime(draft.ytStart));
        const e = Math.ceil(parseTime(draft.ytEnd));
        if (s) l.video.start = s;
        if (e > s) l.video.end = e;
      }
    } else if (draft.mode === "bilibili") {
      const b = biliInfo(draft.biliUrl);
      if (b) {
        l.video = { type: "bilibili", bvid: b.bvid };
        if (b.page > 1) l.video.page = b.page;
        const s = Math.floor(parseTime(draft.biliStart));
        if (s) l.video.start = s;
      }
    }

    l.steps = draft.steps.map((s, i) => ({ img: forPreview ? s.url : `${dir}/${id}-${i + 1}.jpg`, caption: s.caption.trim() }));
    return l;
  }

  function missing() {
    const m = [];
    if (!draft.agent) m.push(L.needAgent);
    if (!draft.map) m.push(L.needMap);
    if (!draft.title.trim()) m.push(L.needTitle);
    if (!buildLineup(true).video) m.push(L.needVideo);
    if (!draft.steps.length) m.push(L.needSteps);
    return m;
  }

  function entryCode() {
    const l = buildLineup(false);
    const q = JSON.stringify;
    const lines = [];
    lines.push(`  { id: ${q(l.id)}, agent: ${q(l.agent)}, map: ${q(l.map)}, side: ${q(l.side)}${l.site ? `, site: ${q(l.site)}` : ""},`);
    const meta = [l.ability ? `ability: ${q(l.ability)}` : "", `title: ${q(l.title)}`, l.lang ? `lang: ${q(l.lang)}` : "", l.difficulty ? `difficulty: ${l.difficulty}` : ""].filter(Boolean);
    lines.push(`    ${meta.join(", ")},`);
    if (l.notes) lines.push(`    notes: ${q(l.notes)},`);
    if (l.video) {
      const v = Object.entries(l.video).map(([k, val]) => `${k}: ${q(val)}`).join(", ");
      lines.push(`    video: { ${v} },`);
    }
    lines.push(`    steps: [`);
    l.steps.forEach((s) => lines.push(`      { img: ${q(s.img)}, caption: ${q(s.caption)} },`));
    lines.push(`    ] },`);
    return lines.join("\n");
  }

  // ---------- rendering ----------
  function options(list, selected, label = (x) => x) {
    return list.map((v) => `<option value="${esc(v)}"${v === selected ? " selected" : ""}>${esc(label(v))}</option>`).join("");
  }

  function render(app, c) {
    ctx = c;
    L = I18N[c.lang] || I18N.zh;
    if (c.presetAgent && ctx.agentById[c.presetAgent] && !draft.agent) draft.agent = c.presetAgent;

    const roles = ["controller", "initiator", "sentinel", "duelist"];
    const agentOptions = roles.map((r) => {
      const group = ctx.agents.filter((a) => a.role === r);
      return `<optgroup label="${esc(L.roles[r])}">${group.map((a) => `<option value="${esc(a.id)}"${a.id === draft.agent ? " selected" : ""}>${esc(ctx.agentName(a))}</option>`).join("")}</optgroup>`;
    }).join("");

    app.innerHTML = `
      <div class="maker">
        <div class="crumbs"><a href="#/">${c.lang === "zh" ? "首页" : "Home"}</a> / ${esc(L.title)}</div>
        <h1>${esc(L.title)}</h1>
        <p class="sub">${esc(L.intro)}</p>

        <section class="mk-card">
          <h2>${esc(L.s1)}</h2>
          <div class="mk-grid">
            <label class="field"><span>${esc(L.agent)} *</span>
              <select id="mk-agent"><option value="">—</option>${agentOptions}</select></label>
            <label class="field"><span>${esc(L.map)} *</span>
              <select id="mk-map"><option value="">—</option>${options(ctx.maps, draft.map, ctx.mapName)}</select></label>
            <label class="field"><span>${esc(L.side)}</span>
              <select id="mk-side">${options(["attack", "defense", "both"], draft.side, (s) => L[s])}</select></label>
            <label class="field"><span>${esc(L.site)}</span>
              <input id="mk-site" value="${esc(draft.site)}" placeholder="${esc(L.sitePh)}"></label>
            <label class="field"><span>${esc(L.ability)}</span>
              <input id="mk-ability" list="mk-abilities" value="${esc(draft.ability)}" placeholder="${esc(L.abilityPh)}">
              <datalist id="mk-abilities"></datalist></label>
            <label class="field"><span>${esc(L.difficulty)}</span>
              <select id="mk-difficulty">${options(["1", "2", "3"], draft.difficulty, (d) => ({ 1: L.easy, 2: L.medium, 3: L.hard })[d])}</select></label>
            <label class="field wide"><span>${esc(L.titleField)} *</span>
              <input id="mk-title" value="${esc(draft.title)}" placeholder="${esc(L.titlePh)}"></label>
            <label class="field wide"><span>${esc(L.notes)}</span>
              <textarea id="mk-notes" rows="2" placeholder="${esc(L.notesPh)}">${esc(draft.notes)}</textarea></label>
          </div>
        </section>

        <section class="mk-card">
          <h2>${esc(L.s2)}</h2>
          <div class="chips" role="radiogroup">
            ${["file", "youtube", "bilibili"].map((m) => `<button type="button" class="chip${draft.mode === m ? " active" : ""}" data-mode="${m}">${esc({ file: L.modeFile, youtube: L.modeYt, bilibili: L.modeBili }[m])}</button>`).join("")}
          </div>
          <div id="mk-video-panel"></div>
          <label class="field narrow"><span>${esc(L.videoLang)}</span>
            <select id="mk-lang">${options(["", "zh", "en"], draft.lang, (v) => ({ "": L.none, zh: "中文", en: "English" })[v])}</select></label>
        </section>

        <section class="mk-card" id="mk-steps-card">
          <h2>${esc(L.s3)}</h2>
          <p class="sub">${esc(L.stepsHint)}</p>
          <div id="mk-steps"></div>
          <label class="chip file-btn">${esc(L.upload)}<input id="mk-upload" type="file" accept="image/*" multiple hidden></label>
        </section>

        <section class="mk-card">
          <h2>${esc(L.s4)}</h2>
          <div id="mk-export"></div>
        </section>
      </div>`;

    root = app.querySelector(".maker");
    bindDetails();
    renderVideoPanel();
    renderSteps();
    renderExport();
    fillAbilities();
  }

  function fillAbilities() {
    const set = new Set();
    ctx.lineups.filter((l) => [].concat(l.agent).includes(draft.agent))
      .forEach((l) => String(l.ability || "").split("/").forEach((a) => a.trim() && a.trim() !== "Smokes" && set.add(a.trim())));
    $("#mk-abilities").innerHTML = [...set].map((a) => `<option value="${esc(a)}">`).join("");
  }

  function bindDetails() {
    const bind = (sel, key, after) => {
      const el = $(sel);
      el.addEventListener(el.tagName === "SELECT" ? "change" : "input", () => {
        draft[key] = el.value;
        if (after) after();
        renderExport();
      });
    };
    bind("#mk-agent", "agent", fillAbilities);
    bind("#mk-map", "map");
    bind("#mk-side", "side");
    bind("#mk-site", "site");
    bind("#mk-ability", "ability");
    bind("#mk-difficulty", "difficulty");
    bind("#mk-title", "title");
    bind("#mk-notes", "notes");
    bind("#mk-lang", "lang");

    root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
      draft.mode = b.dataset.mode;
      root.querySelectorAll("[data-mode]").forEach((x) => x.classList.toggle("active", x === b));
      renderVideoPanel();
      renderExport();
    }));

    $("#mk-upload").addEventListener("change", (e) => { addImageFiles([...e.target.files]); e.target.value = ""; });

    const card = $("#mk-steps-card");
    card.addEventListener("dragover", (e) => { e.preventDefault(); card.classList.add("drop"); });
    card.addEventListener("dragleave", () => card.classList.remove("drop"));
    card.addEventListener("drop", (e) => {
      e.preventDefault();
      card.classList.remove("drop");
      addImageFiles([...e.dataTransfer.files]);
    });
  }

  function renderVideoPanel() {
    const panel = $("#mk-video-panel");
    if (draft.mode === "file") {
      const big = draft.file && draft.file.size > BIG_VIDEO_MB * 1e6 && !draft.clip;
      panel.innerHTML = `
        <p class="sub">${esc(L.fileHint)}</p>
        <label class="chip active file-btn">${esc(L.chooseVideo)}<input id="mk-file" type="file" accept="video/*" hidden></label>
        ${draft.file ? `<span class="mk-filename">${esc(draft.file.name)} · ${(draft.file.size / 1e6).toFixed(1)} MB</span>` : ""}
        ${draft.fileUrl ? `
          <div class="video-wrap mk-player"><video id="mk-video" src="${esc(draft.fileUrl)}" controls playsinline preload="auto"></video></div>
          <p class="sub">${esc(L.captureHint)}</p>
          <div class="mk-row">
            <button type="button" class="chip active" id="mk-capture">${esc(L.capture)}</button>
          </div>
          <div class="mk-row">
            <button type="button" class="chip" id="mk-start">${esc(L.setStart)}</button>
            <button type="button" class="chip" id="mk-end">${esc(L.setEnd)}</button>
            <span class="mk-range">${esc(L.range)}: ${draft.start == null && draft.end == null ? esc(L.whole) : `${fmtTime(draft.start ?? 0)} → ${fmtTime(draft.end)}`}</span>
            ${draft.start != null || draft.end != null ? `<button type="button" class="chip" id="mk-clear">${esc(L.clearRange)}</button>` : ""}
            ${draft.start != null && draft.end != null && draft.end > draft.start ? `<button type="button" class="chip" id="mk-clip">${esc(L.exportClip)}</button>` : ""}
          </div>
          <p class="mk-status" id="mk-status">${draft.clip ? `✔ ${esc(L.clipReady)} · ${(draft.clip.size / 1e6).toFixed(1)} MB` : big ? esc(L.bigVideo.replace("{mb}", BIG_VIDEO_MB)) : ""}</p>` : ""}`;

      $("#mk-file").addEventListener("change", (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (draft.fileUrl) URL.revokeObjectURL(draft.fileUrl);
        resetClip();
        draft.file = f;
        draft.fileUrl = URL.createObjectURL(f);
        draft.start = draft.end = null;
        renderVideoPanel();
        renderExport();
      });
      if (!draft.fileUrl) return;

      const video = $("#mk-video");
      $("#mk-capture").addEventListener("click", async () => {
        if (!video.videoWidth) return;
        video.pause();
        const blob = await toJpeg(video, video.videoWidth, video.videoHeight);
        if (blob) addStep(blob);
      });
      const setRange = (key) => () => {
        draft[key] = video.currentTime;
        if (draft.start != null && draft.end != null && draft.end < draft.start) [draft.start, draft.end] = [draft.end, draft.start];
        resetClip();
        renderVideoPanel();
        renderExport();
      };
      $("#mk-start").addEventListener("click", setRange("start"));
      $("#mk-end").addEventListener("click", setRange("end"));
      const clear = $("#mk-clear");
      if (clear) clear.addEventListener("click", () => { draft.start = draft.end = null; resetClip(); renderVideoPanel(); renderExport(); });
      const clipBtn = $("#mk-clip");
      if (clipBtn) clipBtn.addEventListener("click", () => makeClip(video, clipBtn));
    } else if (draft.mode === "youtube") {
      const vid = youtubeId(draft.ytUrl);
      panel.innerHTML = `
        <div class="mk-grid">
          <label class="field wide"><span>${esc(L.ytUrl)}</span>
            <input id="mk-yt" value="${esc(draft.ytUrl)}" placeholder="https://www.youtube.com/watch?v=..."></label>
          <label class="field"><span>${esc(L.start)}</span><input id="mk-yt-start" value="${esc(draft.ytStart)}" placeholder="1:05"></label>
          <label class="field"><span>${esc(L.end)}</span><input id="mk-yt-end" value="${esc(draft.ytEnd)}" placeholder="1:30"></label>
        </div>
        ${draft.ytUrl && !vid ? `<p class="mk-status warn">${esc(L.badLink)}</p>` : ""}
        <p class="sub">${esc(L.linkHint)}</p>`;
      for (const [sel, key] of [["#mk-yt", "ytUrl"], ["#mk-yt-start", "ytStart"], ["#mk-yt-end", "ytEnd"]]) {
        $(sel).addEventListener("change", (e) => { draft[key] = e.target.value; renderVideoPanel(); renderExport(); });
      }
    } else {
      const b = biliInfo(draft.biliUrl);
      panel.innerHTML = `
        <div class="mk-grid">
          <label class="field wide"><span>${esc(L.biliUrl)}</span>
            <input id="mk-bili" value="${esc(draft.biliUrl)}" placeholder="https://www.bilibili.com/video/BV..."></label>
          <label class="field"><span>${esc(L.start)}</span><input id="mk-bili-start" value="${esc(draft.biliStart)}" placeholder="1:05"></label>
        </div>
        ${draft.biliUrl && !b ? `<p class="mk-status warn">${esc(L.badLink)}</p>` : ""}
        <p class="sub">${esc(L.linkHint)}</p>`;
      for (const [sel, key] of [["#mk-bili", "biliUrl"], ["#mk-bili-start", "biliStart"]]) {
        $(sel).addEventListener("change", (e) => { draft[key] = e.target.value; renderVideoPanel(); renderExport(); });
      }
    }
  }

  function resetClip() {
    if (draft.clipUrl) URL.revokeObjectURL(draft.clipUrl);
    draft.clip = null;
    draft.clipUrl = "";
  }

  // Re-records the chosen range in real time with MediaRecorder, so the site gets a small clip
  // instead of the whole recording.
  async function makeClip(video, btn) {
    const status = $("#mk-status");
    const capture = video.captureStream || video.mozCaptureStream;
    const mime = window.MediaRecorder && ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]
      .find((m) => MediaRecorder.isTypeSupported(m));
    if (!capture || !mime) { status.textContent = L.clipFailed; return; }

    btn.disabled = true;
    status.textContent = L.recording;
    try {
      video.pause();
      video.currentTime = draft.start;
      await once(video, "seeked");
      const rec = new MediaRecorder(capture.call(video), { mimeType: mime, videoBitsPerSecond: 5e6 });
      const chunks = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.start(250);
      await video.play();
      await new Promise((resolve) => {
        const tick = () => (video.currentTime >= draft.end || video.ended || video.paused ? resolve() : requestAnimationFrame(tick));
        tick();
      });
      video.pause();
      const stopped = once(rec, "stop");
      rec.stop();
      await stopped;
      resetClip();
      draft.clip = new Blob(chunks, { type: mime.split(";")[0] });
      draft.clipUrl = URL.createObjectURL(draft.clip);
    } catch (e) {
      status.textContent = L.clipFailed;
      btn.disabled = false;
      return;
    }
    renderVideoPanel();
    renderExport();
  }

  function renderSteps() {
    const box = $("#mk-steps");
    if (!draft.steps.length) {
      box.innerHTML = `<div class="empty small">${esc(L.noSteps)}</div>`;
      return;
    }
    box.innerHTML = `<ol class="mk-steps">${draft.steps.map((s, i) => `
      <li class="mk-step">
        <img src="${esc(s.url)}" alt="">
        <div class="mk-step-body">
          <div class="num">${i + 1}</div>
          <textarea id="mk-cap-${i}" rows="2" data-cap="${i}">${esc(s.caption)}</textarea>
        </div>
        <div class="mk-step-tools">
          <button type="button" class="icon-btn" data-up="${i}" title="${esc(L.up)}" aria-label="${esc(L.up)}"${i === 0 ? " disabled" : ""}>↑</button>
          <button type="button" class="icon-btn" data-down="${i}" title="${esc(L.down)}" aria-label="${esc(L.down)}"${i === draft.steps.length - 1 ? " disabled" : ""}>↓</button>
          <button type="button" class="icon-btn" data-del="${i}" title="${esc(L.remove)}" aria-label="${esc(L.remove)}">×</button>
        </div>
      </li>`).join("")}</ol>`;

    box.querySelectorAll("[data-cap]").forEach((el) => el.addEventListener("input", () => {
      draft.steps[+el.dataset.cap].caption = el.value;
      renderExport();
    }));
    const move = (i, j) => {
      [draft.steps[i], draft.steps[j]] = [draft.steps[j], draft.steps[i]];
      renderSteps();
      renderExport();
    };
    box.querySelectorAll("[data-up]").forEach((b) => b.addEventListener("click", () => move(+b.dataset.up, +b.dataset.up - 1)));
    box.querySelectorAll("[data-down]").forEach((b) => b.addEventListener("click", () => move(+b.dataset.down, +b.dataset.down + 1)));
    box.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
      const [s] = draft.steps.splice(+b.dataset.del, 1);
      URL.revokeObjectURL(s.url);
      renderSteps();
      renderExport();
    }));
  }

  function renderExport() {
    const box = $("#mk-export");
    if (!box) return;
    const need = missing();
    const ready = !need.length;
    const id = lineupId();
    box.innerHTML = `
      <label class="field"><span>${esc(L.idField)}</span><input id="mk-id" value="${esc(id)}"></label>
      ${ready ? "" : `<p class="mk-status warn">${esc(L.need)}${need.map(esc).join(", ")}</p>`}
      <div class="mk-row">
        <button type="button" class="chip" id="mk-preview"${ready ? "" : " disabled"}>${esc(L.preview)}</button>
        <button type="button" class="chip active" id="mk-download"${ready ? "" : " disabled"}>${esc(L.download)}</button>
        <button type="button" class="chip" id="mk-copy"${ready ? "" : " disabled"}>${esc(L.copy)}</button>
        <span class="mk-status" id="mk-export-status"></span>
      </div>
      <h3>${esc(L.howTo)}</h3>
      <ol class="mk-howto">${L.howToSteps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
      <pre class="mk-code"><code id="mk-code">${esc(entryCode())}</code></pre>`;

    $("#mk-id").addEventListener("change", (e) => {
      draft.id = slug(e.target.value);
      draft.idEdited = !!draft.id;
      renderExport();
    });
    $("#mk-preview").addEventListener("click", () => ctx.preview(buildLineup(true)));
    $("#mk-copy").addEventListener("click", async () => {
      const status = $("#mk-export-status");
      try {
        await navigator.clipboard.writeText(entryCode());
        status.textContent = L.copied;
      } catch (e) {
        const range = document.createRange();
        range.selectNodeContents($("#mk-code"));
        getSelection().removeAllRanges();
        getSelection().addRange(range);
      }
    });
    $("#mk-download").addEventListener("click", () => exportPack($("#mk-download")));
  }

  async function exportPack(btn) {
    const status = $("#mk-export-status");
    const l = buildLineup(false);
    const files = l.steps.map((s, i) => ({ path: s.img, blob: draft.steps[i].blob }));
    const vf = videoFile();
    if (vf && l.video && l.video.type === "file") files.push({ path: l.video.src, blob: vf.blob });
    const code = `// Paste into data/lineups.js, right under: window.LINEUPS = [\n${entryCode()}\n`;
    files.push({ path: `lineup-${l.id}.js`, blob: new Blob([code], { type: "text/javascript" }) });

    btn.disabled = true;
    status.textContent = L.working;
    try {
      for (const url of JSZIP_URLS) {
        if (window.JSZip) break;
        await loadScript(url).catch(() => {});
      }
      if (!window.JSZip) throw new Error("JSZip unavailable");
      const zip = new window.JSZip();
      files.forEach((f) => zip.file(f.path, f.blob));
      downloadBlob(await zip.generateAsync({ type: "blob" }), `lineup-${l.id}.zip`);
      status.textContent = "";
    } catch (e) {
      status.textContent = L.zipFailed;
      files.forEach((f, i) => setTimeout(() => downloadBlob(f.blob, f.path.split("/").pop()), i * 400));
    }
    btn.disabled = false;
  }

  // Ctrl+V a screenshot anywhere on the maker page to add it as a step.
  document.addEventListener("paste", (e) => {
    if (!root || !document.body.contains(root) || !e.clipboardData) return;
    const images = [...e.clipboardData.files].filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    e.preventDefault();
    addImageFiles(images);
  });

  window.ValoMaker = { render };
})();
