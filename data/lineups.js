// All lineups live here. Copy an entry, change the fields, and refresh the page.
//
// Fields
//   id          unique, used in the URL (letters, numbers, dashes)
//   agent       an id from agents.js, e.g. "sova"
//   map         a name from MAPS in agents.js, e.g. "Ascent"
//   side        "attack" | "defense"
//   site        "A" | "B" | "C" | "Mid" (anything short works)
//   ability     the utility being thrown, e.g. "Recon Bolt"
//   title       short name shown on the card
//   difficulty  1 (easy) – 3 (hard), optional
//   notes       optional text shown above the tutorial
//   video       optional, one of:
//                 { type: "youtube",  id: "VIDEO_ID", start: 12 }
//                 { type: "bilibili", bvid: "BV1xx411c7mD", page: 1 }
//                 { type: "file",     src: "media/sova/xxx.mp4" }
//                 { type: "link",     url: "https://..." }   // opens in a new tab
//   steps       photo tutorial: [{ img: "media/...", caption: "..." }, ...]
//   tags        optional list of strings, also searchable
//   example     true marks a placeholder entry (shows an "Example" badge) — delete these once you add real ones
window.LINEUPS = [
  {
    id: "example-sova-ascent-a-recon",
    example: true,
    agent: "sova",
    map: "Ascent",
    side: "attack",
    site: "A",
    ability: "Recon Bolt",
    title: "A Main → A Site 侦察箭",
    difficulty: 1,
    notes: "示例条目：把 video 和 steps 换成你自己的视频和截图。Example entry: replace the video and steps with your own.",
    video: { type: "file", src: "media/examples/example.mp4" },
    steps: [
      { img: "media/examples/step-1-stand.svg", caption: "站位 Stand：贴住 A Main 左侧箱子角。" },
      { img: "media/examples/step-2-aim.svg",   caption: "瞄准 Aim：准星对准屋顶天线顶端，0 弹跳，蓄力 1 格。" },
      { img: "media/examples/step-3-land.svg",  caption: "落点 Result：箭落在 A 点中央，扫描整个包点。" },
    ],
    tags: ["recon", "侦察"],
  },
  {
    id: "example-viper-bind-b-snakebite",
    example: true,
    agent: "viper",
    map: "Bind",
    side: "attack",
    site: "B",
    ability: "Snake Bite",
    title: "B Long 后期蛇咬 (Post-plant)",
    difficulty: 2,
    notes: "示例条目，只有图文教程、没有视频时的样子。Example of a lineup with photos only.",
    steps: [
      { img: "media/examples/step-1-stand.svg", caption: "站位 Stand：B Long 门口右侧墙角。" },
      { img: "media/examples/step-2-aim.svg",   caption: "瞄准 Aim：准星对齐墙上第二条横线，跳投。" },
      { img: "media/examples/step-3-land.svg",  caption: "落点 Result：覆盖默认下包位。" },
    ],
    tags: ["post-plant", "后期"],
  },
];
