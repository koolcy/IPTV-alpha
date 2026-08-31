import { adminAPI } from './admin.js';

export async function apiRouter(request, env) {
  return adminAPI(request, env);
}
