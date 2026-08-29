import { getKV, setKV } from '../storage/kv.js';


// 管理接口基础版

export async function adminAPI(request, env) {

    const url = new URL(request.url);


    if (url.pathname === '/admin/source/list') {

        const sources = await getKV(env, 'sources') || [];

        return Response.json({
            sources
        });
    }


    if (url.pathname === '/admin/source/add') {

        if (request.method !== 'POST') {
            return Response.json({
                error: 'POST required'
            });
        }

        const body = await request.json();

        let sources = await getKV(env, 'sources') || [];

        sources.push({
            name: body.name,
            url: body.url,
            time: Date.now()
        });

        await setKV(env, 'sources', sources);

        return Response.json({
            success:true,
            sources
        });
    }


    return null;
}
