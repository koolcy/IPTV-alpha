// Cloudflare KV storage helper

export async function getKV(env, key) {
    if (!env.IPTV_KV) return null;
    return await env.IPTV_KV.get(key, 'json');
}

export async function setKV(env, key, value) {
    if (!env.IPTV_KV) return false;
    await env.IPTV_KV.put(key, JSON.stringify(value));
    return true;
}

export async function delKV(env, key) {
    if (!env.IPTV_KV) return false;
    await env.IPTV_KV.delete(key);
    return true;
}
