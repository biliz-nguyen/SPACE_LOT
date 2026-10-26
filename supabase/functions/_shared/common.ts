import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
export const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
export const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{...cors,'Content-Type':'application/json'}});
export async function context(req:Request){
 const token=req.headers.get('Authorization')?.replace(/^Bearer /i,'');if(!token)throw Error('401: Đăng nhập để tiếp tục.');
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error}=await db.auth.getUser(token);if(error||!user||user.is_anonymous)throw Error('401: Phiên đăng nhập không hợp lệ.');
 return {db,user};
}
export function fail(e:unknown){const msg=e instanceof Error?e.message:'Lỗi xử lý';return json({error:msg},/^401:/.test(msg)?401:/^403:/.test(msg)?403:400);}
export function check(result:{error:unknown}){if(result.error)throw Error('Không thể ghi dữ liệu. Vui lòng thử lại.');}
export async function verifyBlob(blob:Blob){
 if(blob.size>41943040||blob.size<20)throw Error('GLB phải nhỏ hơn 40 MiB.');
 const b=await blob.arrayBuffer(),v=new DataView(b);if(v.getUint32(0,true)!==0x46546c67||v.getUint32(4,true)!==2||v.getUint32(8,true)!==b.byteLength)throw Error('GLB header không hợp lệ.');
 let doc:any=null;
 for(let o=12;o<b.byteLength;){if(o+8>b.byteLength)throw Error('GLB chunk bị cắt.');const len=v.getUint32(o,true),kind=v.getUint32(o+4,true);o+=8;if(len%4||o+len>b.byteLength)throw Error('GLB chunk không hợp lệ.');if(kind===0x4e4f534a)doc=JSON.parse(new TextDecoder().decode(new Uint8Array(b,o,len)).trim());o+=len;}
 if(!doc||doc.asset?.version!=='2.0'||doc.extensionsRequired?.length)throw Error('Chỉ nhận glTF 2.0 tự chứa, không extension bắt buộc.');
 if([...(doc.buffers||[]),...(doc.images||[])].some((x:any)=>x.uri))throw Error('GLB không được chứa URI ngoài.');
 let triangles=0;for(const mesh of doc.meshes||[])for(const p of mesh.primitives||[]){if(p.mode!==undefined&&p.mode!==4)throw Error('Chỉ nhận triangle meshes.');const a=doc.accessors?.[p.indices??p.attributes?.POSITION];if(!a?.count)throw Error('Accessor không hợp lệ.');triangles+=a.count/3;}
 if(triangles<1||triangles>750000)throw Error('GLB vượt giới hạn tam giác.');
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b))).map(n=>n.toString(16).padStart(2,'0')).join('');return {hash,triangles:Math.round(triangles)};
}
