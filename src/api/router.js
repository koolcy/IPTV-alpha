// IPTV Admin v3.0-alpha API Router

import { adminSourceList, adminSourceAdd } from './admin.js';

export async function apiRouter(request, env) {

    const url = new URL(request.url);

    if (url.pathname === '/admin/source/list') {
        return adminSourceList(env);
    }

    if (url.pathname === '/admin/source/add' && request.method === 'POST') {
        return adminSourceAdd(request, env);
    }

    return null;
}
