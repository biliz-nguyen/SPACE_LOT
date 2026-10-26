import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('public/cad',{recursive:true});
for(const f of ['occt-import-js.js','occt-import-js.wasm','license.occt.txt','license.occt-import-js.txt'])await copyFile('node_modules/occt-import-js/dist/'+f,'public/cad/'+f);
