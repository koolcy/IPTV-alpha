// IPTV v3.0-alpha source storage
// KV based source management

export async function getSources(env){
  if(!env.IPTV_KV){
    return [];
  }

  const data = await env.IPTV_KV.get('sources','json');
  return data || [];
}

export async function saveSources(env,sources){
  if(!env.IPTV_KV){
    throw new Error('IPTV_KV not configured');
  }

  await env.IPTV_KV.put(
    'sources',
    JSON.stringify(sources)
  );

  return true;
}

export async function addSource(env,source){
  const list = await getSources(env);
  list.push(source);
  await saveSources(env,list);
  return list;
}
