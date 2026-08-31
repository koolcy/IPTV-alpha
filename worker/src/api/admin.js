import { getKV, setKV } from '../storage/kv.js';

function json(data, status = 200) {
  return Response.json(data, { status });
}

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function adminAPI(request, env) {
  const url = new URL(request.url);

  if (url.pathname === '/admin/source/list' && request.method === 'GET') {
    const sources = (await getKV(env, 'sources')) || [];
    return json({ sources });
  }

  if (url.pathname === '/admin/source/add' && request.method === 'POST') {
    const body = await readBody(request);
    if (!body?.name || !body?.url) return json({ error: 'name and url are required' }, 400);

    const sources = (await getKV(env, 'sources')) || [];
    const source = {
      id: crypto.randomUUID(),
      name: String(body.name).trim(),
      url: String(body.url).trim(),
      status: 'active',
      update_time: Date.now()
    };
    sources.push(source);
    await setKV(env, 'sources', sources);
    return json({ success: true, source, sources });
  }

  if (url.pathname === '/admin/source/delete' && request.method === 'POST') {
    const body = await readBody(request);
    if (!body?.id) return json({ error: 'id is required' }, 400);

    const sources = (await getKV(env, 'sources')) || [];
    const next = sources.filter((item) => item.id !== body.id);
    await setKV(env, 'sources', next);
    return json({ success: true, sources: next });
  }

  if (url.pathname === '/admin/dashboard' && request.method === 'GET') {
    const sources = (await getKV(env, 'sources')) || [];
    return json({
      version: '3.0-beta.1',
      sources: sources.length,
      activeSources: sources.filter((item) => item.status !== 'disabled').length
    });
  }

  return null;
}
