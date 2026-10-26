import {context,json,fail,cors,check,verifyBlob} from '../_shared/common.ts';
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});if(req.method!=='POST')return json({error:'Method not allowed'},405);
 try{
 const {db,user}=await context(req),admin=user.app_metadata?.role==='space_lot_admin';
 if(req.headers.get('content-type')?.includes('multipart/form-data')){
  const f=await req.formData(),blob=f.get('file');if(!(blob instanceof File))throw Error('Thiếu GLB.');
  const m=JSON.parse(String(f.get('metadata'))),v=await verifyBlob(blob);
  if(!m.consent||!m.title?.trim()||m.title.length>100||!m.author?.trim()||!m.source?.trim())throw Error('Thiếu tên, tác giả, nguồn hoặc quyền chia sẻ.');
  if(!Array.isArray(m.dimensionsMm)||m.dimensionsMm.length!==3||!m.dimensionsMm.every((n:number)=>Number.isFinite(n)&&n>=0&&n<=10000)||!m.dimensionsMm.some((n:number)=>n>0))throw Error('Kích thước không hợp lệ.');
  if(JSON.stringify(m).length>24000)throw Error('Metadata quá dài.');
  const since=new Date(Date.now()-86400000).toISOString(),quota=await db.from('community_assets').select('id',{count:'exact',head:true}).eq('owner_id',user.id).gte('created_at',since);check(quota);if((quota.count??0)>=10)throw Error('Tối đa 10 đóng góp/ngày.');
  const id=crypto.randomUUID(),path=`${user.id}/${id}/model.glb`;
  check(await db.storage.from('space-lot-models').upload(path,blob,{contentType:'model/gltf-binary',upsert:false}));
  const result=await db.from('community_assets').insert({id,owner_id:user.id,title:m.title.trim(),category:m.category,manufacturer:m.manufacturer||'',author:m.author,source:m.source,license:m.license,description:m.description||'',dimensions_mm:m.dimensionsMm,mass_g:m.massG,mechanical:m.mechanical,electrical:m.electrical,provenance:m.provenance||{},storage_path:path,sha256:v.hash,bytes:blob.size,triangles:v.triangles,status:'pending'}).select('id,status').single();
  if(result.error){await db.storage.from('space-lot-models').remove([path]);throw Error('Metadata không hợp lệ, file chưa được đưa vào kho.');}
  return json(result.data);
 }
 const body=await req.json();
 if(body.action==='request'){
  if(!body.title?.trim()||body.title.length>100||!body.details?.trim()||body.details.length>4000)throw Error('Cần tên model và yêu cầu chi tiết.');
  const quota=await db.from('model_requests').select('id',{count:'exact',head:true}).eq('owner_id',user.id).gte('created_at',new Date(Date.now()-86400000).toISOString());check(quota);if((quota.count??0)>=10)throw Error('Tối đa 10 yêu cầu/ngày.');
  const result=await db.from('model_requests').insert({owner_id:user.id,title:body.title,details:body.details}).select('id').single();check(result);return json(result.data);
 }
 if(body.action==='review'){
  if(!admin)throw Error('403: Chỉ chủ kho được duyệt model.');
  if(!['approved','rejected'].includes(body.status)||typeof body.note!=='string'||body.note.length>2000)throw Error('Kết quả duyệt không hợp lệ.');
  const {data:a,error}=await db.from('community_assets').select('*').eq('id',body.id).single();if(error||!a||a.status!=='pending')throw Error('Model không còn ở hàng đợi.');
  if(body.status==='approved'){
   if(body.confirm!==true)throw Error('Cần kiểm tra model và xác nhận.');
   const download=await db.storage.from('space-lot-models').download(a.storage_path);check(download);const v=await verifyBlob(download.data!);
   if(v.hash!==a.sha256)throw Error('Checksum thay đổi. Không thể công khai model.');
  }
  const result=await db.from('community_assets').update({status:body.status,verified_by:user.id,reviewed_at:new Date().toISOString(),review_note:body.note}).eq('id',a.id).eq('status','pending').select('id').single();check(result);return json(result.data);
 }
 throw Error('Action không hỗ trợ.');
 }catch(e){return fail(e);}
});
