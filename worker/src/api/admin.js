function json(data, status = 200) {
  return Response.json(data, { status });
}

function db(env) {
  if (!env.DB) throw new Error('D1 binding DB is not configured');
  return env.DB;
}

async function readBody(request) {
  try { return await request.json(); } catch { return null; }
}

export async function adminSourceList(request, env) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const size = Math.min(100, Math.max(1, Number(url.searchParams.get('size') || 20)));
  const search = (url.searchParams.get('search') || '').trim();
  const offset = (page - 1) * size;
  const database = db(env);
  const where = search ? 'WHERE name LIKE ? OR url LIKE ?' : '';
  const params = search ? [`%${search}%`, `%${search}%`] : [];
  const count = await database.prepare(`SELECT COUNT(*) AS total FROM sources ${where}`).bind(...params).first();
  const sources = await database.prepare(`SELECT id, name, url, status, update_time FROM sources ${where} ORDER BY id DESC LIMIT ? OFFSET ?`).bind(...params, size, offset).all();
  return json({ page, size, total: Number(count?.total || 0), sources: sources.results || [] });
}

export async function adminSourceAdd(request, env) {
  const body = await readBody(request);
  if (!body?.name || !body?.url) return json({ error: 'name and url are required' }, 400);
  const result = await db(env).prepare('INSERT INTO sources (name, url, status, update_time) VALUES (?, ?, ?, ?)').bind(String(body.name).trim(), String(body.url).trim(), 'active', Date.now()).run();
  return json({ success: true, id: result.meta.last_row_id });
}

export async function adminSourceDelete(request, env) {
  const body = await readBody(request);
  if (!body?.id) return json({ error: 'id is required' }, 400);
  await db(env).prepare('DELETE FROM sources WHERE id = ?').bind(Number(body.id)).run();
  return json({ success: true });
}

export async function adminSourceToggle(request, env) {
  const body = await readBody(request);
  if (!body?.id) return json({ error: 'id is required' }, 400);
  const status = body.status === 'disabled' ? 'disabled' : 'active';
  await db(env).prepare('UPDATE sources SET status = ? WHERE id = ?').bind(status, Number(body.id)).run();
  return json({ success: true, status });
}

export async function adminChannelList(request, env) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const size = Math.min(100, Math.max(1, Number(url.searchParams.get('size') || 20)));
  const search = (url.searchParams.get('search') || '').trim();
  const group = (url.searchParams.get('group') || '').trim();
  const offset = (page - 1) * size;
  const database = db(env);
  const clauses = [];
  const params = [];
  if (search) { clauses.push('(name LIKE ? OR url LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  if (group) { clauses.push('group_name = ?'); params.push(group); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const count = await database.prepare(`SELECT COUNT(*) AS total FROM channels ${where}`).bind(...params).first();
  const channels = await database.prepare(`SELECT id, name, group_name, url, logo, source, status FROM channels ${where} ORDER BY id DESC LIMIT ? OFFSET ?`).bind(...params, size, offset).all();
  return json({ page, size, total: Number(count?.total || 0), channels: channels.results || [] });
}

export async function adminChannelUpdate(request, env) {
  const body = await readBody(request);
  if (!body?.id) return json({ error: 'id is required' }, 400);
  const fields = [], values = [];
  for (const key of ['name', 'group_name', 'url', 'logo', 'source', 'status']) {
    if (body[key] !== undefined) { fields.push(`${key} = ?`); values.push(String(body[key])); }
  }
  if (!fields.length) return json({ error: 'no fields to update' }, 400);
  values.push(Number(body.id));
  await db(env).prepare(`UPDATE channels SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
  return json({ success: true });
}

export async function adminChannelDelete(request, env) {
  const body = await readBody(request);
  if (!body?.id) return json({ error: 'id is required' }, 400);
  await db(env).prepare('DELETE FROM channels WHERE id = ?').bind(Number(body.id)).run();
  return json({ success: true });
}

export async function adminChannelGroups(env) {
  const rows = await db(env).prepare("SELECT group_name, COUNT(*) AS count FROM channels WHERE group_name IS NOT NULL AND group_name != '' GROUP BY group_name ORDER BY group_name").all();
  return json({ groups: rows.results || [] });
}

export async function adminDashboard(env) {
  const database = db(env);
  const [sources, activeSources, channels, activeChannels, users, programs] = await Promise.all([
    database.prepare('SELECT COUNT(*) AS n FROM sources').first(),
    database.prepare("SELECT COUNT(*) AS n FROM sources WHERE status = 'active'").first(),
    database.prepare('SELECT COUNT(*) AS n FROM channels').first(),
    database.prepare("SELECT COUNT(*) AS n FROM channels WHERE status = 'active'").first(),
    database.prepare('SELECT COUNT(*) AS n FROM users').first(),
    database.prepare('SELECT COUNT(*) AS n FROM programs').first()
  ]);
  return json({ version: '3.0-beta.4', sources: Number(sources?.n || 0), activeSources: Number(activeSources?.n || 0), channels: Number(channels?.n || 0), activeChannels: Number(activeChannels?.n || 0), users: Number(users?.n || 0), programs: Number(programs?.n || 0) });
}
