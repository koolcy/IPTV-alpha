<script setup>
import { onMounted, ref } from 'vue';

const apiBase = ref(localStorage.getItem('iptv_api_base') || '');
const adminToken = ref(localStorage.getItem('iptv_admin_token') || '');
const dashboard = ref(null);
const sources = ref([]);
const name = ref('');
const sourceUrl = ref('');
const loading = ref(false);
const message = ref('');

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('X-Admin-Token', adminToken.value);
  const response = await fetch(`${apiBase.value}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

async function load() {
  loading.value = true;
  message.value = '';
  try {
    dashboard.value = await request('/admin/dashboard');
    sources.value = (await request('/admin/source/list')).sources || [];
  } catch (error) {
    message.value = error.message;
  } finally {
    loading.value = false;
  }
}

async function addSource() {
  if (!name.value || !sourceUrl.value) return;
  try {
    const data = await request('/admin/source/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value, url: sourceUrl.value })
    });
    sources.value = data.sources || [];
    name.value = '';
    sourceUrl.value = '';
  } catch (error) {
    message.value = error.message;
  }
}

async function removeSource(id) {
  try {
    const data = await request('/admin/source/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    sources.value = data.sources || [];
  } catch (error) {
    message.value = error.message;
  }
}

function saveApi() {
  localStorage.setItem('iptv_api_base', apiBase.value.replace(/\/$/, ''));
  localStorage.setItem('iptv_admin_token', adminToken.value);
  load();
}

onMounted(() => {
  if (apiBase.value && adminToken.value) load();
});
</script>

<template>
  <main class="shell">
    <header class="header">
      <div><p class="eyebrow">IPTV-ALPHA</p><h1>管理后台</h1></div>
      <span class="badge">v3.0-beta.1</span>
    </header>

    <section class="config card">
      <label>Worker API 地址</label>
      <div class="row">
        <input v-model="apiBase" placeholder="https://your-worker.example.workers.dev" />
      </div>
      <label class="token-label">Admin Token</label>
      <div class="row">
        <input v-model="adminToken" type="password" placeholder="Cloudflare Worker ADMIN_TOKEN" />
        <button @click="saveApi">保存并连接</button>
      </div>
    </section>

    <p v-if="message" class="error">{{ message }}</p>

    <section class="stats">
      <div class="card stat"><span>直播源</span><strong>{{ dashboard?.sources ?? '-' }}</strong></div>
      <div class="card stat"><span>启用源</span><strong>{{ dashboard?.activeSources ?? '-' }}</strong></div>
      <div class="card stat"><span>Worker</span><strong>{{ dashboard ? 'Online' : '-' }}</strong></div>
    </section>

    <section class="card">
      <div class="section-title"><h2>直播源管理</h2><button class="ghost" @click="load">{{ loading ? '刷新中…' : '刷新' }}</button></div>
      <div class="form row">
        <input v-model="name" placeholder="源名称" />
        <input v-model="sourceUrl" placeholder="M3U / TXT / M3U8 URL" />
        <button @click="addSource">添加</button>
      </div>
      <div v-if="sources.length === 0" class="empty">暂无直播源</div>
      <div v-for="source in sources" :key="source.id" class="source">
        <div><strong>{{ source.name }}</strong><small>{{ source.url }}</small></div>
        <button class="danger" @click="removeSource(source.id)">删除</button>
      </div>
    </section>
  </main>
</template>
