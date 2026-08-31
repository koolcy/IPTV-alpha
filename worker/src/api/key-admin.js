function json(data, status = 200) {
  return Response.json(data, { status });
}

function newKey() {
  return `iptv_${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`;
}

export async function listApiKeys(request, env) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const size = Math.min(100, Math.max(1, Number(url.searchParams.get('size') || 20)));
  const offset = (page - 1) * size;
  const count = await env.DB.prepare('SELECT COUNT(*) AS total FROM api_keys').first();
  const rows = await env.DB.prepare('SELECT id, name, key, status, created_at FROM api_keys ORDER BY id DESC LIMIT ? OFFSET ?').bind(size, offset).all();
  return json({ page, size, total: Number(count?.total || 0), keys: rows.results || [] });
}

export async function createApiKey(request, env) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  if (!name) return json({ error: 'name is required' }, 400);
  const key = newKey();
  const result = await env.DB.prepare('INSERT INTO api_keys (name, key, status, created_at) VALUES (?, ?, ?, ?)').bind(name, key, 'active', Date.now()).run();
  return json({ success: true, id: result.meta?.last_row_id, name, key });
}

export async function toggleApiKey(request, env) {
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return json({ error: 'id is required' }, 400);
  const status = body.status === 'active' ? 'active' : 'disabled';
  await env.DB.prepare('UPDATE api_keys SET status = ? WHERE id = ?').bind(status, id).run();
  return json({ success: true });
}

export async function deleteApiKey(request, env) {
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return json({ error: 'id is required' }, 400);
  await env.DB.prepare('DELETE FROM api_keys WHERE id = ?').bind(id).run();
  return json({ success: true });
}
