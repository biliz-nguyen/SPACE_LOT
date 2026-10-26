const open=()=>new Promise((resolve,reject)=>{
 const q=indexedDB.open('space-lot-assets',1);
 q.onupgradeneeded=()=>q.result.createObjectStore('assets',{keyPath:'id'});
 q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);
});
async function run(mode,fn){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('assets',mode),q=fn(tx.objectStore('assets'));tx.oncomplete=()=>{resolve(q.result);db.close();};tx.onerror=()=>{reject(tx.error);db.close();};});}
export const saveAsset=asset=>run('readwrite',s=>s.put(asset));
export const getAsset=id=>run('readonly',s=>s.get(id));
export const allAssets=()=>run('readonly',s=>s.getAll());
