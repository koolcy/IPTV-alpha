function json(data, status = 200) {
  return Response.json(data, { status });
}

function db(env) {
  if (!env.DB) throw new Error('D1 binding DB is not configured');
  return env.DB;
}

async function body(request) {
  try { return await request.json(); } catch { return null; }
}

function token() {
  return crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
}

function validUser(user) {
  return user && user.status === 'active' && Number(user.expire || 0) > Date.now();
}

export async function adminUserList(request, env) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const size = Math.min(100, Math.max(1, Number(url.searchParams.get('size') || 20)));
  const search = (url.searchParams.get('search') || '').trim();
  const offset = (page - 1) * size;
  const where = search ? 'WHERE username LIKE ?' : '';
  const params = search ? [`%${search}%`] : [];
  const database = db(env);
  const count = await database.prepare(`SELECT COUNT(*) AS total FROM users ${where}`).bind(...params).first();
  const rows = await database.prepare(`SELECT id, username, token, expire, status, plan_id, created_at FROM users ${where} ORDER BY id DESC LIMIT ? OFFSET ?`).bind(...params, size, offset).all();
  return json({ page, size, total: Number(count?.total || 0), users: rows.results || [] });
}

export async function adminUserAdd(request, env) {
  const input = await body(request);
  if (!input?.username) return json({ error: 'username is required' }, 400);
  const username = String(input.username).trim();
  if (!/^[\w.-]{2,64}$/i.test(username)) return json({ error: 'invalid username' }, 400);
  const expire = Number(input.expire || Date.now() + 30 * 86400000);
  const planId = input.plan_id == null ? null : Number(input.plan_id);
  const t = token();
  try {
    const result = await db(env).prepare('INSERT INTO users (username, password, token, expire, status, plan_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(username, '', t, expire, 'active', planId, Date.now()).run();
    return json({ success: true, id: result.meta.last_row_id, username, token: t, expire, plan_id: planId });
  } catch (error) {
    return json({ error: error.message?.includes('UNIQUE') ? 'username already exists' : 'create user failed' }, 400);
  }
}

export async function adminUserUpdate(request, env) {
  const input = await body(request);
  if (!input?.id) return json({ error: 'id is required' }, 400);
  const fields = [];
  const values = [];
  for (const key of ['username', 'expire', 'status', 'plan_id']) {
    if (input[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(key === 'expire' || key === 'plan_id' ? Number(input[key]) : String(input[key]));
    }
  }
  if (!fields.length) return json({ error: 'no fields to update' }, 400);
  values.push(Number(input.id));
  await db(env).prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
  return json({ success: true });
}

export async function adminUserDelete(request, env) {
  const input = await body(request);
  if (!input?.id) return json({ error: 'id is required' }, 400);
  await db(env).prepare('DELETE FROM users WHERE id = ?').bind(Number(input.id)).run();
  return json({ success: true });
}

export async function adminUserResetToken(request, env) {
  const input = await body(request);
  if (!input?.id) return json({ error: 'id is required' }, 400);
  const t = token();
  await db(env).prepare('UPDATE users SET token = ? WHERE id = ?').bind(t, Number(input.id)).run();
  return json({ success: true, token: t });
}

export async function getUserByToken(env, tokenValue) {
  if (!tokenValue) return null;
  return db(env).prepare('SELECT id, username, token, expire, status, plan_id FROM users WHERE token = ?').bind(tokenValue).first();
}

export async function getUserChannels(env, user) {
  const database = db(env);
  const plan = user.plan_id ? await database.prepare('SELECT id, name, channels_limit, daily_limit, epg_enable FROM plans WHERE id = ?').bind(user.plan_id).first() : null;
  const limit = Number(plan?.channels_limit || 0);
  let sql = "SELECT id, name, group_name, url, logo, source, status FROM channels WHERE status = 'active' ORDER BY group_name, name";
  if (limit > 0) sql += ` LIMIT ${Math.min(limit, 100000)}`;
  const rows = await database.prepare(sql).all();
  return { channels: rows.results || [], plan };
}

export { validUser };
