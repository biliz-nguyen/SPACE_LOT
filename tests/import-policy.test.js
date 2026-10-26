import test from 'node:test';
import assert from 'node:assert/strict';
import {validateFiles,safeResource,inspectGLB,validateMetadata} from '../src/assets/policy.js';
const file=(name,size=100)=>({name,size});
test('import rejects oversize batches, empty files, collisions and unsupported CAD',()=>{
 for(const f of [[file('large.glb',42*1024*1024)],[file('empty.glb',0)],[file('a.glb'),file('A.glb')],[file('part.f3d')]])assert.throws(()=>validateFiles(f));
 assert.equal(validateFiles([file('part.step')]).length,1);
});
test('external, traversal and missing dependencies are blocked',()=>{
 for(const uri of ['https://evil.example/texture.png','//evil.example/x','../secret.bin','%2e%2e/a.bin','textures/a.png','missing.bin'])assert.throws(()=>safeResource(uri,[file('a.bin')]));
 assert.equal(safeResource('a.bin',[file('a.bin')]).name,'a.bin');
});
function glb(doc){const json=JSON.stringify(doc),size=(json.length+3)&~3,b=new ArrayBuffer(20+size),v=new DataView(b);v.setUint32(0,0x46546c67,true);v.setUint32(4,2,true);v.setUint32(8,b.byteLength,true);v.setUint32(12,size,true);v.setUint32(16,0x4e4f534a,true);const bytes=new Uint8Array(b,20);bytes.fill(32);bytes.set(new TextEncoder().encode(json));return b;}
test('GLB rejects invalid headers, truncated chunks and non-embedded dependencies',()=>{
 assert.throws(()=>inspectGLB(new ArrayBuffer(10)));
 assert.throws(()=>inspectGLB(glb({asset:{version:'2.0'},buffers:[{uri:'http://evil.example/x'}]})));
 assert.throws(()=>inspectGLB(glb({asset:{version:'2.0'},extensionsRequired:['KHR_draco_mesh_compression']})));
 assert.equal(inspectGLB(glb({asset:{version:'2.0'}})).asset.version,'2.0');
});
test('contribution requires provenance, license, JSON objects and consent',()=>{
 const valid={title:'GPS',category:'gps',author:'Designer',source:'Original CAD',license:'CC0',massG:null,mechanical:{},electrical:{},consent:true};assert.ok(validateMetadata(valid));
 for(const patch of [{consent:false},{source:''},{license:'unknown'},{massG:-1},{mechanical:[]}])assert.throws(()=>validateMetadata({...valid,...patch}));
});
