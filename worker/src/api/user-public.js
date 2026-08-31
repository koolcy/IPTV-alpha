import { getUserByToken, getUserChannels, validUser } from './users.js';
import { outputM3U } from './live.js';
import { outputTVBox } from './tvbox.js';

function tokenFrom(request) {
  return new URL(request.url).pathname.split('/')[2] || '';
}

function denied(message, status = 401) {
  return Response.json({ error: message }, { status });
}

export async function userSubscription(request, env, format = 'm3u') {
  const token = tokenFrom(request);
  const user = await getUserByToken(env, token);
  if (!user) return denied('invalid subscription token');
  if (user.status !== 'active') return denied('subscription disabled', 403);
  if (Number(user.expire || 0) <= Date.now()) return denied('subscription expired', 403);

  const { channels, plan } = await getUserChannels(env, user);
  if (plan && Number(plan.epg_enable) === 0 && format === 'epg') return denied('EPG is disabled for this plan', 403);

  await env.DB?.prepare('INSERT INTO access_logs (user_id, ip, api, time) VALUES (?, ?, ?, ?)')
    .bind(user.id, request.headers.get('CF-Connecting-IP') || '', new URL(request.url).pathname, Date.now()).run();

  if (format === 'tvbox') return outputTVBox(channels);
  return outputM3U(channels);
}

export { validUser };
