import {getSources, addSource} from '../storage/source.js';

export async function sourceAPI(request,env){

  const url = new URL(request.url);

  if(url.pathname === '/admin/source/list'){
    return Response.json({
      sources: await getSources(env)
    });
  }

  if(url.pathname === '/admin/source/add' && request.method === 'POST'){
    const body = await request.json();

    const source = {
      name: body.name || '未命名',
      url: body.url || '',
      status: 'active',
      update_time: Date.now()
    };

    return Response.json({
      success:true,
      sources: await addSource(env,source)
    });
  }

  return null;
}
