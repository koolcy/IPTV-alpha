import { CONFIG } from './config.js';
import { decode } from './utils/decode.js';
import { parseTXT } from './parser/txt.js';
import { parseM3U } from './parser/m3u.js';
import { outputM3U } from './api/live.js';
import { outputTVBox } from './api/tvbox.js';
import { outputEPG } from './api/epg-public.js';
import { apiRouter } from './api/router.js';
import { userSubscription } from './api/user-public.js';

function cors(response) {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token, X-API-Key');
  return new Response(response.body, { status: response.status, headers });
}

async function rateLimit(request, env, bucket, limit = 60) {
  if (!env.IPTV_KV) return null;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `rl:${bucket}:${ip}:${Math.floor(Date.now() / 60000)}`;
  const current = Number(await env.IPTV_KV.get(key) || 0);
  if (current >= limit) return cors(Response.json({ error: 'rate limit exceeded' }, { status: 429 }));
  await env.IPTV_KV.put(key, String(current + 1), { expirationTtl: 120 });
  return null;
}

async function apiKeyAllowed(request, env) {
  const key = request.headers.get('X-API-Key');
  if (!key) return true;
  if (!env.DB) return false;
  const row = await env.DB.prepare('SELECT id FROM api_keys WHERE key = ? AND status = ?').bind(key, 'active').first();
  return !!row;
}

export default {
  async fetch(request, env) {
    // Normalize the existing Wrangler binding name to the application binding used by the modules.
    if (!env.DB && env.iptv) env.DB = env.iptv;
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token, X-API-Key'
    }});

    if (url.pathname.startsWith('/admin/')) {
      const configuredToken = env.ADMIN_TOKEN;
      const suppliedToken = request.headers.get('X-Admin-Token') || request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
      if (!configuredToken || suppliedToken !== configuredToken) return cors(Response.json({ error: 'Unauthorized' }, { status: 401 }));
      const limited = await rateLimit(request, env, 'admin', 120);
      if (limited) return limited;
      const response = await apiRouter(request, env);
      return cors(response || Response.json({ error: 'Not Found' }, { status: 404 }));
    }

    if (url.pathname.startsWith('/api/')) {
      if (!(await apiKeyAllowed(request, env))) return cors(Response.json({ error: 'Invalid API key' }, { status: 401 }));
      const limited = await rateLimit(request, env, 'api', 120);
      if (limited) return limited;
    }

    const userMatch = url.pathname.match(/^\/u\/([^/]+)(?:\.m3u|\/tvbox)?$/);
    if (userMatch && request.method === 'GET') {
      const limited = await rateLimit(request, env, 'subscription', 120);
      if (limited) return limited;
      const isTVBox = url.pathname.endsWith('/tvbox');
      return cors(await userSubscription(request, env, isTVBox ? 'tvbox' : 'm3u'));
    }

    if (url.pathname === '/health') return cors(Response.json({ status: 'ok', version: '3.0-beta.6' }));
    if (url.pathname === '/epg.xml') return cors(await outputEPG(env));

    const sourceURL = env.SOURCE_URL || CONFIG.SOURCE_URL;
    if (!sourceURL || sourceURL.includes('example.com')) return new Response('SOURCE_URL is not configured', { status: 500 });
    const res = await fetch(sourceURL);
    if (!res.ok) return new Response(`Source fetch failed: ${res.status}`, { status: 502 });
    const text = decode(await res.arrayBuffer());
    const list = text.includes('#EXTM3U') ? parseM3U(text) : parseTXT(text);
    if (url.pathname === '/live.m3u') return outputM3U(list);
    if (url.pathname === '/tvbox') return outputTVBox(list);
    return new Response('IPTV-alpha v3.0-beta.6');
  }
};
