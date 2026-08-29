import { isSpam } from "../filter/clean.js";

export function parseM3U(text) {
  const list = [];
  let info = null;

  for (let line of text.split(/\r?\n/)) {
    line = line.trim();

    if (line.startsWith("#EXTINF")) {
      const title = line.split(",").pop().trim();
      const group = line.match(/group-title="([^"]+)"/);

      info = {
        title,
        group: group?.[1] || "默认频道",
        logo: ""
      };
    } else if (line && !line.startsWith("#") && info) {
      info.url = line;

      if (!isSpam(info.title)) {
        list.push(info);
      }

      info = null;
    }
  }

  return list;
}
