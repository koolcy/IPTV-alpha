import { isSpam } from "../filter/clean.js";

export function parseTXT(text) {
  const list = [];
  let group = "默认频道";

  for (let line of text.split(/\r?\n/)) {
    line = line.trim();
    if (!line) continue;

    if (line.includes(",#genre#")) {
      group = line.split(",")[0].trim();
      continue;
    }

    if (line.includes(",")) {
      const i = line.lastIndexOf(",");
      const title = line.slice(0, i).trim();
      const url = line.slice(i + 1).trim();

      if (!isSpam(title)) {
        list.push({
          title,
          url,
          group,
          logo: `https://epg.112114.xyz/logo/${title}.png`
        });
      }
    }
  }

  return list;
}
