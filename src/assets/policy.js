export const MAX_BYTES=40*1024*1024;
export const MAX_TRIANGLES=750000;
export const FORMATS=['glb','gltf','obj','stl','ply','step','stp','iges','igs','brep'];
export const CAD=['step','stp','iges','igs','brep'];
export const extension=name=>name.toLowerCase().split('.').pop();
export function validateFiles(files){
 if(!files.length||files.length>32)throw Error('Chọn từ 1 đến 32 file, bao gồm texture đi kèm.');
 if(files.reduce((n,f)=>n+f.size,0)>MAX_BYTES)throw Error('Tổng dung lượng tối đa 40 MiB mỗi lần import.');
 const names=new Set();
 for(const f of files){if(!f.size)throw Error(`File trống: ${f.name}`);const n=f.name.toLowerCase();if(names.has(n))throw Error(`Tên file trùng: ${f.name}. Hãy đổi tên trước khi import.`);names.add(n);}
 const models=files.filter(f=>FORMATS.includes(extension(f.name)));
 if(!models.length)throw Error('Định dạng chưa hỗ trợ. CAD độc quyền như F3D, SLDPRT, DWG cần export STEP; FBX cần export GLB.');
 return models;
}
export function safeResource(uri,files){
 if(/^data:(application\/octet-stream|application\/gltf-buffer|image\/(png|jpeg|webp));base64,/i.test(uri))return uri;
 if(/^[a-z]+:|^\/|\.{2}[\\/]/i.test(uri))throw Error('Chặn tài nguyên bên ngoài: '+uri);
 const decoded=decodeURIComponent(uri).replace(/\\/g,'/');
 if(decoded.includes('..')||decoded.includes('/'))throw Error('Đặt model và texture/buffer cùng thư mục trước khi chọn file.');
 const file=files.find(f=>f.name.toLowerCase()===decoded.toLowerCase());
 if(!file)throw Error('Thiếu file đi kèm: '+uri);
 return file;
}
export function inspectGLB(buffer){
 const view=new DataView(buffer);
 if(buffer.byteLength<20||view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==buffer.byteLength)throw Error('GLB header hoặc độ dài không hợp lệ.');
 let json=null;
 for(let offset=12;offset<buffer.byteLength;){
  if(offset+8>buffer.byteLength)throw Error('GLB chunk bị cắt.');
  const len=view.getUint32(offset,true),type=view.getUint32(offset+4,true);offset+=8;
  if(len%4||offset+len>buffer.byteLength)throw Error('GLB chunk không hợp lệ.');
  if(type===0x4e4f534a)json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,offset,len)).trim());offset+=len;
 }
 if(!json||json.asset?.version!=='2.0')throw Error('Thiếu glTF 2.0 JSON.');
 for(const b of json.buffers||[])if(b.uri)throw Error('GLB phải nhúng toàn bộ buffer.');
 for(const i of json.images||[])if(i.uri)throw Error('GLB phải nhúng toàn bộ texture.');
 if(json.extensionsRequired?.length)throw Error('Hãy export GLB không nén Draco/KTX và không extension bắt buộc.');
 return json;
}
export const unitMm=unit=>({mm:1,cm:10,m:1000,in:25.4})[unit]??null;
export function validateMetadata(m){
 if(!m.title?.trim()||m.title.length>100)throw Error('Tên model bắt buộc, tối đa 100 ký tự.');
 if(!['frame','fc','motor','esc','prop','battery','power','gps','receiver','custom'].includes(m.category))throw Error('Nhóm model không hợp lệ.');
 if(!['CC0','CC-BY-4.0','CC-BY-SA-4.0'].includes(m.license))throw Error('Chọn license chia sẻ.');
 if(!m.author?.trim()||m.author.length>120||!m.source?.trim()||m.source.length>2000)throw Error('Cần tác giả và nguồn gốc model.');
 if(m.massG!==null&&(!Number.isFinite(m.massG)||m.massG<0||m.massG>100000))throw Error('Khối lượng không hợp lệ.');
 for(const k of ['mechanical','electrical'])if(!m[k]||typeof m[k]!=='object'||Array.isArray(m[k]))throw Error(k+' phải là JSON object.');
 if(!m.consent)throw Error('Cần xác nhận quyền chia sẻ và đồng ý gửi duyệt.');
 return m;
}
