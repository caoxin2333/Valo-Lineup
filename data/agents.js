// Agent roster. `id` is used in URLs and in lineups.js (`agent` field).
// `cn` is optional — the English name is shown when it is missing.
// `avatar` is optional — drop an image in media/agents/ and point to it here.
window.AGENTS = [
  // Controllers 控场者
  { id: "brimstone", name: "Brimstone", cn: "炼狱",   role: "controller" },
  { id: "viper",     name: "Viper",     cn: "蝰蛇",   role: "controller" },
  { id: "omen",      name: "Omen",      cn: "幽影",   role: "controller" },
  { id: "astra",     name: "Astra",     cn: "星礈",   role: "controller" },
  { id: "harbor",    name: "Harbor",    cn: "海神",   role: "controller" },
  { id: "clove",     name: "Clove",     cn: "暮蝶",   role: "controller" },

  // Initiators 先锋
  { id: "sova",      name: "Sova",      cn: "猎枭",   role: "initiator" },
  { id: "breach",    name: "Breach",    cn: "铁臂",   role: "initiator" },
  { id: "skye",      name: "Skye",      cn: "斯凯",   role: "initiator" },
  { id: "kayo",      name: "KAY/O",     cn: "K/O",    role: "initiator" },
  { id: "fade",      name: "Fade",      cn: "黑梦",   role: "initiator" },
  { id: "gekko",     name: "Gekko",     cn: "盖可",   role: "initiator" },
  { id: "tejo",      name: "Tejo",                    role: "initiator" },

  // Sentinels 哨卫
  { id: "sage",      name: "Sage",      cn: "贤者",   role: "sentinel" },
  { id: "cypher",    name: "Cypher",    cn: "零",     role: "sentinel" },
  { id: "killjoy",   name: "Killjoy",   cn: "奇乐",   role: "sentinel" },
  { id: "chamber",   name: "Chamber",   cn: "尚勃勒", role: "sentinel" },
  { id: "deadlock",  name: "Deadlock",  cn: "钢锁",   role: "sentinel" },
  { id: "vyse",      name: "Vyse",      cn: "维斯",   role: "sentinel" },

  // Duelists 决斗者
  { id: "jett",      name: "Jett",      cn: "捷风",   role: "duelist" },
  { id: "phoenix",   name: "Phoenix",   cn: "不死鸟", role: "duelist" },
  { id: "raze",      name: "Raze",      cn: "雷兹",   role: "duelist" },
  { id: "reyna",     name: "Reyna",     cn: "芮娜",   role: "duelist" },
  { id: "yoru",      name: "Yoru",      cn: "夜露",   role: "duelist" },
  { id: "neon",      name: "Neon",      cn: "霓虹",   role: "duelist" },
  { id: "iso",       name: "Iso",       cn: "壹决",   role: "duelist" },
  { id: "waylay",    name: "Waylay",                  role: "duelist" },
];

window.MAPS = [
  "Abyss", "Ascent", "Bind", "Breeze", "Corrode", "Fracture", "Haven",
  "Icebox", "Lotus", "Pearl", "Split", "Sunset",
];
