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

A lineup can have just a video, just photos, or both. The card thumbnail is the last photo (usually the landing spot), or the YouTube thumbnail. Set `thumbnail` to use a different image.

Other optional fields:

- `kind: "guide"` marks a video that covers many lineups on one map (shown as 合集).
- `lang: "zh"` / `"en"` is the video's language, which you can filter by on the agent page.
- `agent` can be a list, such as `["omen", "clove"]`, for a video that covers several agents.
- `map: "All"` is for every-map videos.

## Where the content comes from

The 88 videos in `data/lineups.js` (77 YouTube, 11 Bilibili) were collected from YouTube and Bilibili search in October 2026. They lean towards recent uploads, full-map guides and well-known creators. The videos are **embedded, not copied**: they play from the original site, and each one has a link back to its creator.

For photo lineups, the site doesn't copy anyone's screenshots. When a lineup has no `steps` of its own, the 图文教程 tab and each agent page link to the matching agent and map page on [Blitz.gg](https://blitz.gg/valorant/lineups/sova/ascent), which shows stand, aim and result images. You can add more sources to `PHOTO_SOURCES` in `data/agents.js`. To host your own photo guides, add `steps` with your own screenshots.

Note: YouTube is blocked in mainland China. Bilibili entries (`lang: "zh"`) play there.

## Agents and maps

Agents and maps are listed in `data/agents.js`. To add a new agent, add a line with its `id`, `name`, optional Chinese name `cn` and `role`. To show a portrait instead of initials, also set `avatar: "media/agents/sova.png"`.

## Deploy to GitHub Pages

In the repository, go to **Settings → Pages**, choose **Deploy from a branch**, and pick your branch with the `/ (root)` folder. The `.nojekyll` file is already in place.

> Unofficial fan site, not affiliated with Riot Games.
