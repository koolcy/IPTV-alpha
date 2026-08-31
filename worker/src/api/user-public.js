import { getUserByToken, getUserChannels } from './users.js';
import { outputM3U } from './live.js';
import { outputTVBox } from './tvbox.js';

function tokenFrom(request) {
  return new URL(request.url).pathname.split('/')[2] || '';
}

function denied(message, status = 401) {
  return Response.json({ error: message }, { status });
}

async function dailyCount(env, userId) {
  const since = Date.now() - 86400000;
  const row = await env.DB.prepare('SELECT COUNT(*) AS count FROM access_logs WHERE user_id = ? AND time >= ?').bind(userId, since).first();
  return Number(row?.count || 0);
}

export async function userSubscription(request, env, format = 'm3u') {
  const token = tokenFrom(request);
  const user = await getUserByToken(env, token);
  if (!user) return denied('invalid subscription token');
  if (user.status !== 'active') return denied('subscription disabled', 403);
  if (Number(user.expire || 0) <= Date.now()) return denied('subscription expired', 403);

  const { channels, plan } = await getUserChannels(env, user);
  if (plan && Number(plan.epg_enable) === 0 && format === 'epg') return denied('EPG is disabled for this plan', 403);
  if (plan && Number(plan.daily_limit || 0) > 0) {
    const count = await dailyCount(env, user.id);
    if (count >= Number(plan.daily_limit)) return denied('daily request limit exceeded', 429);
  }

  await env.DB.prepare('INSERT INTO access_logs (user_id, ip, api, time) VALUES (?, ?, ?, ?)')
    .bind(user.id, request.headers.get('CF-Connecting-IP') || '', new URL(request.url).pathname, Date.now()).run();

  if (format === 'tvbox') return outputTVBox(channels);
  return outputM3U(channels);
}
