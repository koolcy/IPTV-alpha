import {
  adminDashboard,
  adminSourceList,
  adminSourceAdd,
  adminSourceDelete,
  adminSourceToggle,
  adminChannelList,
  adminChannelUpdate,
  adminChannelDelete,
  adminChannelGroups
} from './admin.js';

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

  return Response.json({ error: 'Not Found' }, { status: 404 });
}
