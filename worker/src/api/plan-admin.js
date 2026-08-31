function json(data, status = 200) { return Response.json(data, { status }); }

export async function listPlans(request, env) {
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('size') || 50), 100);
  const { results } = await env.DB.prepare('SELECT * FROM plans ORDER BY id DESC LIMIT ?').bind(limit).all();
  return json({ plans: results || [] });
}

export async function savePlan(request, env) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  if (!name) return json({ error: 'name is required' }, 400);
  const channelsLimit = Math.max(0, Number(body.channels_limit || 0));
  const dailyLimit = Math.max(0, Number(body.daily_limit || 0));
  const epgEnable = body.epg_enable === false ? 0 : 1;
  if (body.id) {
    await env.DB.prepare('UPDATE plans SET name=?, channels_limit=?, daily_limit=?, epg_enable=? WHERE id=?').bind(name, channelsLimit, dailyLimit, epgEnable, Number(body.id)).run();
    return json({ ok: true, id: Number(body.id) });
  }
  const result = await env.DB.prepare('INSERT INTO plans (name, channels_limit, daily_limit, epg_enable, created_at) VALUES (?, ?, ?, ?, ?)').bind(name, channelsLimit, dailyLimit, epgEnable, Date.now()).run();
  return json({ ok: true, id: result.meta?.last_row_id });
}

export async function deletePlan(request, env) {
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return json({ error: 'id is required' }, 400);
  const users = await env.DB.prepare('SELECT COUNT(*) AS count FROM users WHERE plan_id = ?').bind(id).first();
  if (Number(users?.count || 0) > 0) return json({ error: 'plan is still assigned to users' }, 409);
  await env.DB.prepare('DELETE FROM plans WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
