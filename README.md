# Valo Lineup · 无畏契约点位教程

A static website listing Valorant lineups for every agent. Each lineup can have a **video tutorial (视频教程)** and a **step-by-step photo guide (图文教程)**.

This is a plain HTML/CSS/JS site with no build step. You can host it anywhere, including GitHub Pages.

## Pages

| URL | What it shows |
| --- | --- |
| `#/` | All agents, filterable by role (决斗者 / 先锋 / 控场者 / 哨卫), with a lineup count on each |
| `#/agent/sova` | One agent's lineups, filterable by map, attack/defense and ability |
| `#/lineup/<id>` | One lineup, with a **Video** tab and a **Photo Guide** tab (click a photo to enlarge it; use ← → to move between photos) |
| `#/search/<words>` | Search every lineup by agent, map, site, ability, title or tag |

The 中文 / EN button in the top bar switches the interface language.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. You can also double-click `index.html`.

## Add a lineup

1. Put your screenshots (and optionally an `.mp4`) in a folder such as `media/sova/`.
2. Add an entry to `data/lineups.js`:

```js
{
  id: "sova-ascent-a-main-recon",
  agent: "sova",                 // id from data/agents.js
  map: "Ascent",
  side: "attack",                // "attack" or "defense"
  site: "A",
  ability: "Recon Bolt",
  title: "A Main → A Site 侦察箭",
  difficulty: 1,                 // 1–3, optional
  notes: "Optional tips shown above the tutorial",
  video: { type: "bilibili", bvid: "BV1xxxxxxxxx" },
  steps: [
    { img: "media/sova/ascent-a-1.jpg", caption: "站位：..." },
    { img: "media/sova/ascent-a-2.jpg", caption: "瞄准：..." },
    { img: "media/sova/ascent-a-3.jpg", caption: "落点：..." },
  ],
  tags: ["recon"],
},
```

The `video` field accepts any one of these:

```js
{ type: "youtube",  id: "VIDEO_ID", start: 12 }     // start is in seconds and is optional
{ type: "bilibili", bvid: "BV1xxxxxxxxx", page: 1 }
{ type: "file",     src: "media/sova/xxx.mp4" }    // a video stored in this repo
{ type: "link",     url: "https://..." }           // any other site; opens in a new tab
```

A lineup can have just a video, just photos, or both. The card thumbnail is the last photo (usually the landing spot). Set `thumbnail` to use a different image.

The two `example-...` entries and the `media/examples/` folder are placeholders. Delete them once you've added real lineups.

## Agents and maps

Agents and maps are listed in `data/agents.js`. To add a new agent, add a line with its `id`, `name`, optional Chinese name `cn` and `role`. To show a portrait instead of initials, also set `avatar: "media/agents/sova.png"`.

## Deploy to GitHub Pages

In the repository, go to **Settings → Pages**, choose **Deploy from a branch**, and pick your branch with the `/ (root)` folder. The `.nojekyll` file is already in place.

> Unofficial fan site, not affiliated with Riot Games.
