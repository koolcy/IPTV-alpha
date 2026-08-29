import { CONFIG } from './config.js';
import { decode } from './utils/decode.js';
import { parseTXT } from './parser/txt.js';
import { parseM3U } from './parser/m3u.js';
import { outputM3U } from './api/live.js';
import { outputTVBox } from './api/tvbox.js';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const res = await fetch(CONFIG.SOURCE_URL);
    const text = decode(await res.arrayBuffer());
    const list = text.includes('#EXTM3U') ? parseM3U(text) : parseTXT(text);

    if (url.pathname === '/live.m3u') return outputM3U(list);
    if (url.pathname === '/tvbox') return outputTVBox(list);

    return new Response('IPTV Admin v3.0-alpha Running');
  }
};
