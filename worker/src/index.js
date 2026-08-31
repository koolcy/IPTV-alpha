import { CONFIG } from './config.js';
import { decode } from './utils/decode.js';
import { parseTXT } from './parser/txt.js';
import { parseM3U } from './parser/m3u.js';
import { outputM3U } from './api/live.js';
import { outputTVBox } from './api/tvbox.js';
import { apiRouter } from './api/router.js';

function cors(response) {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new Response(response.body, { status: response.status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }});

    if (url.pathname.startsWith('/admin/')) {
      const response = await apiRouter(request, env);
      if (response) return cors(response);
    }

    if (url.pathname === '/health') {
      return cors(Response.json({ status: 'ok', version: '3.0-beta.1' }));
    }

    if (!CONFIG.SOURCE_URL) return new Response('SOURCE_URL is not configured', { status: 500 });

    const res = await fetch(CONFIG.SOURCE_URL);
    if (!res.ok) return new Response(`Source fetch failed: ${res.status}`, { status: 502 });

    const text = decode(await res.arrayBuffer());
    const list = text.includes('#EXTM3U') ? parseM3U(text) : parseTXT(text);

    if (url.pathname === '/live.m3u') return outputM3U(list);
    if (url.pathname === '/tvbox') return outputTVBox(list);

    return new Response('IPTV-alpha v3.0-beta.1');
  }
};
