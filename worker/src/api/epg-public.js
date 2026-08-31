function xml(value = '') {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
function stamp(ms) {
  const d = new Date(Number(ms));
  const p = n => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${p(d.getUTCMonth()+1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())} +0000`;
}
export async function outputEPG(env) {
  if (!env.DB) return new Response('D1 binding DB is not configured', { status: 500 });
  const channels = await env.DB.prepare('SELECT id, name, logo FROM channels WHERE status = ? ORDER BY id').bind('active').all();
  const programs = await env.DB.prepare('SELECT channel_id, title, description, start_time, end_time FROM programs WHERE end_time >= ? ORDER BY start_time LIMIT 5000').bind(Date.now()).all();
  const channelXml = (channels.results || []).map(c => `<channel id="${xml(c.id)}"><display-name>${xml(c.name)}</display-name>${c.logo ? `<icon src="${xml(c.logo)}"/>` : ''}</channel>`).join('');
  const programXml = (programs.results || []).map(p => `<programme start="${stamp(p.start_time)}" stop="${stamp(p.end_time)}" channel="${xml(p.channel_id)}"><title>${xml(p.title)}</title>${p.description ? `<desc>${xml(p.description)}</desc>` : ''}</programme>`).join('');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<tv generator-info-name="IPTV-alpha">${channelXml}${programXml}</tv>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
}
