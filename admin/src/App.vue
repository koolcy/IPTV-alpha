<script setup>
import { onMounted, ref } from 'vue';

const apiBase = ref(localStorage.getItem('iptv_api_base') || '');
const adminToken = ref(localStorage.getItem('iptv_admin_token') || '');
const dashboard = ref(null), sources = ref([]), channels = ref([]), programs = ref([]);
const sourceName = ref(''), sourceUrl = ref(''), epgUrl = ref('');
const channelSearch = ref(''), channelPage = ref(1), channelTotal = ref(0);
const epgChannel = ref(''), loading = ref(false), message = ref('');

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('X-Admin-Token', adminToken.value);
  const response = await fetch(`${apiBase.value}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}
async function loadSources() { sources.value = (await request('/admin/source/list?size=100')).sources || []; }
async function loadChannels() {
  const p = new URLSearchParams({ page: String(channelPage.value), size: '20' });
  if (channelSearch.value.trim()) p.set('search', channelSearch.value.trim());
  const data = await request(`/admin/channel/list?${p}`); channels.value = data.channels || []; channelTotal.value = data.total || 0;
}
async function loadEpg() {
  const p = new URLSearchParams({ limit: '100' });
  if (epgChannel.value) p.set('channel_id', epgChannel.value);
  const data = await request(`/admin/epg/list?${p}`); programs.value = data.programs || [];
}
async function load() {
  loading.value = true; message.value = '';
  try { dashboard.value = await request('/admin/dashboard'); await Promise.all([loadSources(), loadChannels(), loadEpg()]); }
  catch (e) { message.value = e.message; } finally { loading.value = false; }
}
async function addSource() {
  if (!sourceName.value || !sourceUrl.value) return;
  try { await request('/admin/source/add', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:sourceName.value,url:sourceUrl.value}) }); sourceName.value=''; sourceUrl.value=''; await load(); } catch(e){message.value=e.message;}
}
async function removeSource(id) { try { await request('/admin/source/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); await loadSources(); } catch(e){message.value=e.message;} }
async function removeChannel(id) { try { await request('/admin/channel/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); await loadChannels(); } catch(e){message.value=e.message;} }
async function toggleChannel(c) { try { await request('/admin/channel/update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:c.id,status:c.status==='disabled'?'active':'disabled'})}); await loadChannels(); } catch(e){message.value=e.message;} }
async function importEpg() {
  if (!epgUrl.value.trim()) return;
  try { const r=await request('/admin/epg/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:epgUrl.value.trim()})}); message.value=`EPG导入完成：${r.importedPrograms} 个节目，匹配 ${r.matchedChannels} 个频道`; epgUrl.value=''; await loadEpg(); } catch(e){message.value=e.message;}
}
async function clearOldEpg() { try { await request('/admin/epg/clear',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({before:Date.now()})}); await loadEpg(); } catch(e){message.value=e.message;} }
function saveApi(){ localStorage.setItem('iptv_api_base',apiBase.value.replace(/\/$/,'')); localStorage.setItem('iptv_admin_token',adminToken.value); load(); }
function searchChannels(){ channelPage.value=1; loadChannels().catch(e=>message.value=e.message); }
onMounted(()=>{if(apiBase.value&&adminToken.value)load();});
</script>

<template>
<main class="shell">
<header class="header"><div><p class="eyebrow">IPTV-ALPHA</p><h1>管理后台</h1></div><span class="badge">v3.0-beta.3</span></header>
<section class="config card"><label>Worker API 地址</label><div class="row"><input v-model="apiBase" placeholder="https://your-worker.example.workers.dev" /></div><label class="token-label">Admin Token</label><div class="row"><input v-model="adminToken" type="password" placeholder="Cloudflare Worker ADMIN_TOKEN"/><button @click="saveApi">保存并连接</button></div></section>
<p v-if="message" class="error">{{ message }}</p>
<section class="stats"><div class="card stat"><span>直播源</span><strong>{{dashboard?.sources??'-'}}</strong></div><div class="card stat"><span>频道</span><strong>{{dashboard?.channels??'-'}}</strong></div><div class="card stat"><span>用户</span><strong>{{dashboard?.users??'-'}}</strong></div><div class="card stat"><span>节目</span><strong>{{dashboard?.programs??'-'}}</strong></div></section>
<section class="card"><div class="section-title"><h2>直播源管理</h2><button class="ghost" @click="loadSources">刷新</button></div><div class="form row"><input v-model="sourceName" placeholder="源名称"/><input v-model="sourceUrl" placeholder="M3U / TXT / M3U8 URL"/><button @click="addSource">添加</button></div><div v-if="!sources.length" class="empty">暂无直播源</div><div v-for="s in sources" :key="s.id" class="source"><div><strong>{{s.name}}</strong><small>{{s.url}}</small></div><button class="danger" @click="removeSource(s.id)">删除</button></div></section>
<section class="card"><div class="section-title"><h2>频道管理</h2><span>{{channelTotal}} 个频道</span></div><div class="row"><input v-model="channelSearch" @keyup.enter="searchChannels" placeholder="搜索频道名称 / URL"/><button @click="searchChannels">搜索</button></div><div v-if="!channels.length" class="empty">暂无频道</div><div v-for="c in channels" :key="c.id" class="channel"><div class="channel-main"><img v-if="c.logo" :src="c.logo" alt=""/><div><strong>{{c.name}}</strong><small>{{c.group_name||'未分组'}} · {{c.url}}</small></div></div><div class="actions"><button class="ghost" @click="toggleChannel(c)">{{c.status==='disabled'?'启用':'禁用'}}</button><button class="danger" @click="removeChannel(c.id)">删除</button></div></div><div class="pagination"><button :disabled="channelPage<=1" @click="channelPage--;loadChannels()">上一页</button><span>第 {{channelPage}} 页</span><button :disabled="channelPage*20>=channelTotal" @click="channelPage++;loadChannels()">下一页</button></div></section>
<section class="card"><div class="section-title"><h2>EPG节目单</h2><button class="ghost" @click="loadEpg">刷新</button></div><div class="row"><input v-model="epgUrl" placeholder="XMLTV / EPG 地址"/><button @click="importEpg">导入 EPG</button><button class="danger" @click="clearOldEpg">清理过期</button></div><div v-if="!programs.length" class="empty">暂无节目数据</div><div v-for="p in programs" :key="p.id" class="source"><div><strong>{{p.title}}</strong><small>{{new Date(p.start_time).toLocaleString()}} → {{new Date(p.end_time).toLocaleString()}} · Channel {{p.channel_id}}</small></div></div></section>
</main>
</template>
