# Valo Lineup · 无畏契约点位教程

A static website of Valorant lineups for every agent. Each lineup page shows an **embedded video (视频教程)** and a **step-by-step photo guide (图文教程)**: stand → aim → result.

This is a plain HTML/CSS/JS site with no build step.

## Put it online (GitHub Pages)

Videos play inside the page only when the site is served from a real web host. The free option is GitHub Pages:

1. Open the repository on GitHub and go to **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Pick the branch `claude/vigilant-franklin-sf5gge` (or `main` once it's merged) and the folder `/ (root)`, then **Save**.
4. After a minute or two the site is live at **https://caoxin2333.github.io/Valo-Lineup/**.

Every push to that branch updates the site.

## Pages

| URL | What it shows |
| --- | --- |
| `#/` | All agents, filterable by role, with lineup and guide counts |
| `#/agent/sova` | One agent: **点位教程** (single lineups), **视频合集** (full-map video guides) and links to a photo lineup library for each map |
| `#/lineup/<id>` | One lineup: the embedded video, then the numbered photo steps (click a photo to enlarge it) |
| `#/maker` | **点位制作工具**, which builds a new lineup with both a video and photos |
| `#/search/<words>` | Search everything |

## Add a lineup with the lineup maker (点位制作工具)

Click **＋ 添加点位** in the top bar.

1. **Fill in the lineup details:** agent, map, side, site, ability and title.
2. **Add the video**, using one of these:
   - **Your own recording (recommended).** Record the lineup with OBS, NVIDIA or Xbox Game Bar, then pick the file.
     - Pause on the stand, aim and result moments and press **📸 截取** to turn each frame into a photo step.
     - Set a start and end point and press **生成片段** so the site gets a short clip instead of the whole recording.
   - **A YouTube or Bilibili link** with start and end times, if the lineup is part of a longer video. Linked videos can't be captured, so take screenshots in game (Win+Shift+S) and paste them with **Ctrl+V**, or upload them.
3. **Write a caption for each photo step.** You can reorder or remove steps.
4. **Press 预览** to see the finished lineup page, then **下载点位包**.

The zip contains `media/<agent>/…` (the photos, plus the clip if you recorded one) and a `lineup-<id>.js` file. To add it to the site:

1. Put the `media` folder in the repository root. On GitHub, use **Add file → Upload files** and drag the folder in.
2. Paste the code from `lineup-<id>.js` into `data/lineups.js`, right under `window.LINEUPS = [`.
3. Commit. The lineup appears on the site with both its video and photos.

Keep clips short. GitHub rejects files over 100 MB, and a 10–20 second clip is usually 2–6 MB.

## Lineup data format

Lineups are stored in `data/lineups.js`:

```js
{
  id: "sova-ascent-a-main-recon",
  agent: "sova",                 // id from data/agents.js (or a list of ids)
  map: "Ascent",                 // or "All"
  side: "attack",                // "attack" | "defense" | "both"
  site: "A",
  ability: "Recon Bolt",
  title: "A Main → A Site 侦察箭",
  difficulty: 1,                 // 1–3, optional
  lang: "zh",                    // video language, optional
  notes: "Optional tips shown above the tutorial",
  video: { type: "file", src: "media/sova/sova-ascent-a-main-recon.webm" },
  steps: [
    { img: "media/sova/sova-ascent-a-main-recon-1.jpg", caption: "站位：..." },
    { img: "media/sova/sova-ascent-a-main-recon-2.jpg", caption: "瞄准：..." },
    { img: "media/sova/sova-ascent-a-main-recon-3.jpg", caption: "落点：..." },
  ],
},
```

`video` can be any of the following:

```js
{ type: "file",     src: "media/sova/x.webm", start: 5, end: 20 }  // start/end are optional
{ type: "youtube",  id: "VIDEO_ID", start: 65, end: 90 }          // plays only that part
{ type: "bilibili", bvid: "BV1xxxxxxxxx", page: 1, start: 65 }
{ type: "link",     url: "https://..." }                          // opens in a new tab
```

Set `kind: "guide"` on a video that covers many lineups. It's then listed under 视频合集 instead of 点位教程.

### Splitting a video guide into single lineups

A single lineup can be cut from a guide video without copying anything from it:

```js
{
  id: "sova-bind-a-short-recon", from: "sova-bind-25",   // `from` links back to the guide
  agent: "sova", map: "Bind", side: "attack", site: "A", ability: "Recon Bolt",
  title: "A Short recon",
  video: { type: "youtube", id: "eTxQTyMcgog", start: 95, end: 118 },  // just this lineup's part
  steps: [
    { at: 97,  caption: "站位：..." },    // `at` = seconds into the video
    { at: 104, caption: "瞄准：..." },
    { at: 112, caption: "落点：..." },
  ],
},
```

A step with `at` instead of `img` shows the embedded player paused on that moment. The guide's page lists every lineup split from it.

## Where the existing content comes from

The 88 video guides in `data/lineups.js` (77 YouTube, 11 Bilibili) were collected from YouTube and Bilibili search in October 2026. Each one covers many lineups on a map, so they are all marked as `kind: "guide"`. They are **embedded, not copied**: they play from the original site, and each one links back to its creator.

For photos, the site doesn't copy other people's screenshots. A guide's photo section, and each agent page, link to the matching agent and map page on [Blitz.gg](https://blitz.gg/valorant/lineups/sova/ascent), which shows stand, aim and result images. You can add more sources to `PHOTO_SOURCES` in `data/agents.js`.

YouTube is blocked in mainland China. Bilibili videos and your own uploaded clips play there.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Credits

The lineup maker's zip export uses [JSZip](https://stuk.github.io/jszip/) 3.10.1 (MIT), bundled in `assets/vendor/`.

> Unofficial fan site, not affiliated with Riot Games.
