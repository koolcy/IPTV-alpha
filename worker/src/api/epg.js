function json(data, status = 200) { return Response.json(data, { status }); }
function db(env) { if (!env.DB) throw new Error('D1 binding DB is not configured'); return env.DB; }
async function body(request) { try { return await request.json(); } catch { return null; } }

export async function adminEpgImport(request, env) {
  const input = await body(request);
  if (!input?.url && !input?.xml) return json({ error: 'url or xml is required' }, 400);
  let xml = input.xml;
  if (!xml) {
    const response = await fetch(String(input.url));
    if (!response.ok) return json({ error: `EPG fetch failed: ${response.status}` }, 502);
    xml = await response.text();
  }
  if (!/<tv\b|<programme\b/i.test(xml)) return json({ error: 'invalid XMLTV document' }, 400);
  const { parseXMLTV } = await import('../parser/xmltv.js');
  const parsed = parseXMLTV(xml);
  const database = db(env);
  const channelRows = await database.prepare('SELECT id, name FROM channels').all();
  const normalize = (s = '') => s.toLowerCase().replace(/[\s\-_\.]/g, '');
  const byName = new Map((channelRows.results || []).map(c => [normalize(c.name), c]));
  const xmlToDb = new Map();
  for (const c of parsed.channels) {
    const found = byName.get(normalize(c.name));
    if (found) xmlToDb.set(c.id, String(found.id));
  }
  const statements = [];
  let imported = 0;
  for (const p of parsed.programs) {
    const channelId = xmlToDb.get(p.channel_id);
    if (!channelId || !p.title || !p.start_time || !p.end_time) continue;
    statements.push(database.prepare('INSERT INTO programs (channel_id, title, description, start_time, end_time) VALUES (?, ?, ?, ?, ?)').bind(channelId, p.title, p.description || '', p.start_time, p.end_time));
    imported++;
    if (statements.length === 50) await database.batch(statements.splice(0, statements.length));
  }
  if (statements.length) await database.batch(statements);
  return json({ success: true, channels: parsed.channels.length, programs: parsed.programs.length, matchedChannels: xmlToDb.size, importedPrograms: imported, importedAt: Date.now() });
}

export async function adminEpgList(request, env) {
  const url = new URL(request.url);
  const channelId = (url.searchParams.get('channel_id') || '').trim();
  const from = Number(url.searchParams.get('from') || Date.now());
  const to = Number(url.searchParams.get('to') || from + 86400000);
  const limit = Math.min(500, Math.max(1, Number(url.searchParams.get('limit') || 200)));
  const clauses = ['start_time < ?', 'end_time > ?'];
  const params = [to, from];
  if (channelId) { clauses.push('channel_id = ?'); params.push(channelId); }
  const rows = await db(env).prepare(`SELECT id, channel_id, title, description, start_time, end_time FROM programs WHERE ${clauses.join(' AND ')} ORDER BY start_time LIMIT ?`).bind(...params, limit).all();
  return json({ programs: rows.results || [] });
}

export async function adminEpgClear(request, env) {
  const input = await body(request);
  const before = Number(input?.before || Date.now());
  await db(env).prepare('DELETE FROM programs WHERE end_time < ?').bind(before).run();
  return json({ success: true });
}
