export async function getUserPlan(env, user) {
  if (!user?.plan_id) return null;
  return env.DB.prepare('SELECT * FROM plans WHERE id = ?').bind(user.plan_id).first();
}

export async function authorizeUser(env, token) {
  if (!token) return { error: 'Missing token', status: 401 };
  const user = await env.DB.prepare('SELECT * FROM users WHERE token = ?').bind(token).first();
  if (!user) return { error: 'Invalid token', status: 401 };
  if (user.status !== 'active') return { error: 'User disabled', status: 403 };
  if (user.expire && Number(user.expire) < Date.now()) return { error: 'Subscription expired', status: 403 };
  const plan = await getUserPlan(env, user);
  if (user.plan_id && !plan) return { error: 'Plan not found', status: 403 };
  return { user, plan };
}

export function channelAllowed(channel, plan) {
  if (!plan || Number(plan.channels_limit || 0) <= 0) return true;
  return true;
}
