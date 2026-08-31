import { adminDashboard, adminSourceList, adminSourceAdd, adminSourceDelete, adminSourceToggle, adminChannelList, adminChannelUpdate, adminChannelDelete, adminChannelGroups } from './admin.js';
import { adminEpgImport, adminEpgList, adminEpgClear } from './epg.js';
import { adminUserList, adminUserAdd, adminUserUpdate, adminUserDelete, adminUserResetToken } from './users.js';
import { listPlans, savePlan, deletePlan } from './plan-admin.js';
import { listApiKeys, createApiKey, toggleApiKey, deleteApiKey } from './key-admin.js';

export async function apiRouter(request, env) {
  const url = new URL(request.url);
  if (url.pathname === '/admin/dashboard' && request.method === 'GET') return adminDashboard(env);
  if (url.pathname === '/admin/source/list' && request.method === 'GET') return adminSourceList(request, env);
  if (url.pathname === '/admin/source/add' && request.method === 'POST') return adminSourceAdd(request, env);
  if (url.pathname === '/admin/source/delete' && request.method === 'POST') return adminSourceDelete(request, env);
  if (url.pathname === '/admin/source/toggle' && request.method === 'POST') return adminSourceToggle(request, env);
  if (url.pathname === '/admin/channel/list' && request.method === 'GET') return adminChannelList(request, env);
  if (url.pathname === '/admin/channel/update' && request.method === 'POST') return adminChannelUpdate(request, env);
  if (url.pathname === '/admin/channel/delete' && request.method === 'POST') return adminChannelDelete(request, env);
  if (url.pathname === '/admin/channel/groups' && request.method === 'GET') return adminChannelGroups(env);
  if (url.pathname === '/admin/epg/import' && request.method === 'POST') return adminEpgImport(request, env);
  if (url.pathname === '/admin/epg/list' && request.method === 'GET') return adminEpgList(request, env);
  if (url.pathname === '/admin/epg/clear' && request.method === 'POST') return adminEpgClear(request, env);
  if (url.pathname === '/admin/user/list' && request.method === 'GET') return adminUserList(request, env);
  if (url.pathname === '/admin/user/add' && request.method === 'POST') return adminUserAdd(request, env);
  if (url.pathname === '/admin/user/update' && request.method === 'POST') return adminUserUpdate(request, env);
  if (url.pathname === '/admin/user/delete' && request.method === 'POST') return adminUserDelete(request, env);
  if (url.pathname === '/admin/user/reset-token' && request.method === 'POST') return adminUserResetToken(request, env);
  if (url.pathname === '/admin/plan/list' && request.method === 'GET') return listPlans(request, env);
  if (url.pathname === '/admin/plan/save' && request.method === 'POST') return savePlan(request, env);
  if (url.pathname === '/admin/plan/delete' && request.method === 'POST') return deletePlan(request, env);
  if (url.pathname === '/admin/api-key/list' && request.method === 'GET') return listApiKeys(request, env);
  if (url.pathname === '/admin/api-key/create' && request.method === 'POST') return createApiKey(request, env);
  if (url.pathname === '/admin/api-key/toggle' && request.method === 'POST') return toggleApiKey(request, env);
  if (url.pathname === '/admin/api-key/delete' && request.method === 'POST') return deleteApiKey(request, env);
  return Response.json({ error: 'Not Found' }, { status: 404 });
}
