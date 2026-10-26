import {context,json,fail,cors,check,verifyBlob} from '../_shared/common.ts';
const endpoint='https://api.meshy.ai/openapi/v2/text-to-3d';
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});if(req.method!=='POST')return json({error:'Method not allowed'},405);
 try{
  const {db,user}=await context(req),body=await req.json(),key=Deno.env.get('MESHY_API_KEY');
  if(!key)return json({error:'Chủ ứng dụng chưa cấu hình MESHY_API_KEY trên server. Chưa tạo task hay trừ credit.'},503);
  const headers={Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
  if(body.action==='create'){
   if(body.consent!==true||typeof body.prompt!=='string'||body.prompt.trim().length<3||body.prompt.length>600||!/^[a-f0-9-]{36}$/.test(body.id))throw Error('Cần prompt, request ID và đồng ý sử dụng credit.');
   const existing=await db.from('generation_jobs').select('*').eq('id',body.id).eq('owner_id',user.id).maybeSingle();check(existing);if(existing.data)return json(existing.data);
   const day=new Date().toISOString().slice(0,10),used=await db.from('generation_jobs').select('slot').eq('owner_id',user.id).eq('day',day);check(used);
   const slot=[1,2,3].find(n=>!used.data?.some(j=>j.slot===n));if(!slot)throw Error('Đã dùng 3 lượt tạo model hôm nay.');
   check(await db.from('generation_jobs').insert({id:body.id,owner_id:user.id,prompt:body.prompt.trim(),day,slot,status:'creating'}));
   // Do not automatically retry this POST: a timed-out request may already have spent provider credits.
   let response:Response;try{response=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify({mode:'preview',prompt:body.prompt.trim(),ai_model:'meshy-6',should_remesh:true,target_polycount:30000}),signal:AbortSignal.timeout(25000)});}catch{
    await db.from('generation_jobs').update({status:'unknown'}).eq('id',body.id);throw Error('Chưa rõ provider có nhận task không. Chủ ứng dụng cần kiểm tra Meshy; không gửi lại tự động.');
   }
   const result=await response.json();if(!response.ok||!result.result){await db.from('generation_jobs').update({status:'failed'}).eq('id',body.id);throw Error('Meshy từ chối task. Kiểm tra credits hoặc cấu hình provider.');}
   const saved=await db.from('generation_jobs').update({external_id:result.result,status:'queued'}).eq('id',body.id).select('*').single();check(saved);return json(saved.data);
  }
  if(!['status','download'].includes(body.action))throw Error('Action không hợp lệ.');
  const job=await db.from('generation_jobs').select('*').eq('id',body.id).eq('owner_id',user.id).single();check(job);if(!job.data?.external_id)throw Error('Task chưa có provider ID; cần kiểm tra trạng thái trước.');
  const response=await fetch(endpoint+'/'+encodeURIComponent(job.data.external_id),{headers,signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('Không đọc được trạng thái Meshy.');const task=await response.json();
  if(body.action==='status')return json({id:body.id,status:task.status,progress:task.progress??0,ready:task.status==='SUCCEEDED'});
  if(task.status!=='SUCCEEDED'||!task.model_urls?.glb)throw Error('Model chưa hoàn thành.');
  const url=new URL(task.model_urls.glb);if(url.protocol!=='https:')throw Error('Provider trả URL không hợp lệ.');
  const asset=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!asset.ok)throw Error('Không tải được GLB từ provider.');
  const reader=asset.body!.getReader(),chunks:Uint8Array[]=[];let bytes=0;
  while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>41943040){await reader.cancel();throw Error('Model từ provider lớn hơn 40 MiB.');}chunks.push(value);}
  const blob=new Blob(chunks,{type:'model/gltf-binary'});await verifyBlob(blob);
  return new Response(blob,{headers:{...cors,'Content-Type':'model/gltf-binary'}});
 }catch(e){return fail(e);}
});
