// Cloudflare D1 database helper

export async function queryDB(env, sql, params = []) {

    if (!env.DB) {
        return [];
    }

    const result = await env.DB
        .prepare(sql)
        .bind(...params)
        .all();

    return result.results || [];
}


export async function execDB(env, sql, params = []) {

    if (!env.DB) {
        return false;
    }

    await env.DB
        .prepare(sql)
        .bind(...params)
        .run();

    return true;
}
