export function outputM3U(list) {
  let out = "#EXTM3U\n";

  for (const item of list) {
    out += `#EXTINF:-1 group-title="${item.group}",${item.title}\n`;
    out += `${item.url}\n`;
  }

  return new Response(out, {
    headers: {
      "Content-Type": "application/vnd.apple.mpegurl;charset=utf-8"
    }
  });
}
