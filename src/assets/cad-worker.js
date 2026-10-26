/* OpenCascade runs in an isolated worker. Terminate on timeout/cancel. */
importScripts('/cad/occt-import-js.js');
self.onmessage=async({data})=>{
 try{
  const occt=await occtimportjs({locateFile:path=>'/cad/'+path});
  const method=['step','stp'].includes(data.ext)?'ReadStepFile':['iges','igs'].includes(data.ext)?'ReadIgesFile':'ReadBrepFile';
  const result=occt[method](new Uint8Array(data.buffer),{linearUnit:'millimeter',linearDeflectionType:'absolute_value',linearDeflection:0.1,angularDeflection:0.35});
  if(!result.success||!result.meshes?.length)throw Error('OpenCascade không tessellate được file CAD này.');
  self.postMessage({result});
 }catch(error){self.postMessage({error:error.message});}
};
