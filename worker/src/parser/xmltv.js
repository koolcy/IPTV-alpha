function decodeXml(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

function textOf(tag = '') {
  return decodeXml(tag.replace(/<[^>]+>/g, '').trim());
}

function parseXmltvTime(value) {
  if (!value) return 0;
  const match = value.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (!match) return Date.parse(value) || 0;
  const [, y, mo, d, h, mi, s] = match;
  return Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
}

export function parseXMLTV(xml) {
  const channels = [];
  const programs = [];

  for (const match of xml.matchAll(/<channel\b[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/channel>/gi)) {
    const id = decodeXml(match[1]);
    const body = match[2];
    const display = body.match(/<display-name\b[^>]*>([\s\S]*?)<\/display-name>/i);
    const icon = body.match(/<icon\b[^>]*src=["']([^"']+)["'][^>]*\/?\s*>/i);
    channels.push({ id, name: display ? textOf(display[1]) : id, logo: icon ? decodeXml(icon[1]) : '' });
  }

  for (const match of xml.matchAll(/<programme\b[^>]*channel=["']([^"']+)["'][^>]*start=["']([^"']+)["'][^>]*stop=["']([^"']+)["'][^>]*>([\s\S]*?)<\/programme>/gi)) {
    const [, channelId, start, stop, body] = match;
    const title = body.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    const desc = body.match(/<desc\b[^>]*>([\s\S]*?)<\/desc>/i);
    if (!title) continue;
    programs.push({
      channel_id: decodeXml(channelId),
      title: textOf(title[1]),
      description: desc ? textOf(desc[1]) : '',
      start_time: parseXmltvTime(start),
      end_time: parseXmltvTime(stop)
    });
  }

  return { channels, programs };
}
