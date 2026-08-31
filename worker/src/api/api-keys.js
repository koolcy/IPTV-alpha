function json(data, status = 200) { return Response.json(data, { status }); }
function makeKey() { return `iptv_${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`; }
export async function listApiKeys(request, env) {
  const { results } = await env.DB.prepare('SELECT id, name, key, status, created_at FROM api_keys ORDER BY id DESC').all();
  return json({ keys: results || [] });
}
export async function createApiKey(request, env) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  if (!name) return json({ error: 'name is required' }, 400);
  const key = makeKey();
  const result = await env.DB.prepare('INSERT INTO api_keys (name, key, status, created_at) VALUES (?, ?, ?, ?)').bind(name, key, 'active', Date.now()).run();
  return json({ ok: true, id: result.meta?.last_row_id, name, key });
}
export async function toggleApiKey(request, env) {
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return json({ error: 'id is required' }, 400);
  const row = await env.DB.prepare('SELECT status FROM api_keys WHERE id = ?').bind(id).first();
  if (!row) return json({ error: 'api key not found' }, 404);
  const status = row.status === 'active' ? 'disabled' : 'active';
  await env.DB.prepare('UPDATE api_keys SET status = ? WHERE id = ?').bind(status, id).run();
  return json({ ok: true, status });
}
export async function deleteApiKey(request, env) {
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return json({ error: 'id is required' }, 400);
  await env.DB.prepare('DELETE FROM api_keys WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
