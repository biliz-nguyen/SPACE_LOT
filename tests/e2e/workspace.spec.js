import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.route('https://**/*',r=>r.abort());});
const tetra=`solid test
facet normal 0 0 -1
outer loop
vertex 0 0 0
vertex 20 0 0
vertex 0 30 0
endloop
endfacet
facet normal 0 -1 0
outer loop
vertex 0 0 0
vertex 0 0 40
vertex 20 0 0
endloop
endfacet
facet normal -1 0 0
outer loop
vertex 0 0 0
vertex 0 30 0
vertex 0 0 40
endloop
endfacet
facet normal 1 1 1
outer loop
vertex 20 0 0
vertex 0 0 40
vertex 0 30 0
endloop
endfacet
endsolid test`;
test('STL inspect, consent gate, save, scene insertion and reload persistence',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/',{waitUntil:'domcontentloaded'});await expect(page.locator('#scene-status')).toContainText('parts');
 await page.locator('#import-btn').click();await page.locator('#asset-files').setInputFiles({name:'module.stl',mimeType:'application/octet-stream',buffer:Buffer.from(tetra)});await page.locator('#process-files').click();await expect(page.locator('.stage-item')).toContainText('20 × 30 × 40');await expect(page.locator('#save-import')).toBeDisabled();await page.locator('#confirm-import').check();await page.locator('#save-import').click();await expect(page.locator('#tab-local')).toBeVisible({timeout:20000});await expect(page.locator('#local-assets')).toContainText('module');await page.locator('[data-insert]').first().click();await expect(page.locator('#selected-content')).toContainText('module');await expect(page.locator('#mass-value')).toContainText('+ ?');await page.reload();await expect(page.locator('#asset-shelf')).toContainText('module');await expect(page.locator('#assembly-tree')).toContainText('module');await expect.poll(()=>page.evaluate(async()=>{const {store}=await import('/src/store.js');return store.project.instances.filter(x=>x.componentId.startsWith('asset-')).length;})).toBe(1);await page.screenshot({path:'test-results/workspace-desktop.png',fullPage:true});expect(errors).toEqual([]);
});
test('STEP tessellates with worker and preserves mm geometry',async({page})=>{
 await page.goto('/',{waitUntil:'domcontentloaded'});await page.locator('#import-btn').click();await page.locator('#asset-files').setInputFiles('tests/fixtures/cube.step');await page.locator('#process-files').click();await expect(page.locator('.stage-item')).toHaveCount(1,{timeout:60000});await expect(page.locator('#import-log')).toContainText('✓ cube.step');await expect(page.locator('.stage-item')).toContainText('300 × 300 × 300');await page.screenshot({path:'test-results/import-step.png'});
});
test('malformed GLB and external glTF are rejected without fetch',async({page})=>{
 await page.goto('/',{waitUntil:'domcontentloaded'});await page.locator('#import-btn').click();await page.locator('#asset-files').setInputFiles({name:'broken.glb',mimeType:'model/gltf-binary',buffer:Buffer.from('not a GLB')});await page.locator('#process-files').click();await expect(page.locator('#import-log')).toContainText('✕');await expect(page.locator('#save-import')).toBeDisabled();let fetched=false;page.on('request',r=>{if(r.url().includes('evil.example'))fetched=true;});await page.locator('#asset-files').setInputFiles({name:'external.gltf',mimeType:'model/gltf+json',buffer:Buffer.from(JSON.stringify({asset:{version:'2.0'},buffers:[{uri:'https://evil.example/buffer.bin'}]}))});await page.locator('#process-files').click();await expect(page.locator('#import-log')).toContainText('Chặn tài nguyên');expect(fetched).toBe(false);
});
test('manifest search and responsive workspace',async({page})=>{
 await page.goto('/',{waitUntil:'domcontentloaded'});await page.locator('#manifest-btn').click();await page.locator('.manifest-controls input').fill('battery');await expect(page.locator('.manifest-table tbody tr')).toHaveCount(1);await page.locator('.manifest-dialog .icon-button').click();await page.setViewportSize({width:390,height:844});await expect(page.locator('#import-btn')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);await page.screenshot({path:'test-results/workspace-mobile.png',fullPage:true});await page.locator('#import-btn').click();await expect(page.locator('#asset-studio')).toBeVisible();expect(await page.locator('#asset-studio').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
});
test('OBJ and PLY preserve explicit units, and generated GLB round-trips',async({page})=>{
 await page.goto('/',{waitUntil:'domcontentloaded'});
 const result=await page.evaluate(async()=>{
  const {parseModel}=await import('/src/assets/importer.js');
  const obj=new File(['v 0 0 0\nv 2 0 0\nv 0 3 0\nv 0 0 4\nf 1 2 3\nf 1 4 2\nf 1 3 4\nf 2 4 3\n'],'part.obj');
  const ply=new File(['ply\nformat ascii 1.0\nelement vertex 4\nproperty float x\nproperty float y\nproperty float z\nelement face 4\nproperty list uchar int vertex_indices\nend_header\n0 0 0\n20 0 0\n0 30 0\n0 0 40\n3 0 1 2\n3 0 3 1\n3 0 2 3\n3 1 3 2\n'],'part.ply');
  const a=await parseModel(obj,[obj],{unit:'cm',up:'z'}),b=await parseModel(ply,[ply],{unit:'mm',up:'z'});
  const glb=new File([a.asset.blob],'roundtrip.glb');const c=await parseModel(glb,[glb],{unit:'in',up:'z'});
  return {obj:a.asset.dimensionsMm,ply:b.asset.dimensionsMm,glb:c.asset.dimensionsMm,triangles:c.asset.triangles};
 });
 expect(result.obj).toEqual([20,30,40]);expect(result.ply).toEqual([20,30,40]);expect(result.glb).toEqual([20,30,40]);expect(result.triangles).toBe(4);
});

test('saved mesh can be dragged from hangar onto the scene',async({page})=>{
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.evaluate(async()=>{
  const {parseModel}=await import('/src/assets/importer.js'),{saveAsset}=await import('/src/assets/db.js'),{store}=await import('/src/store.js');
  const f=new File(['v 0 0 0\nv 20 0 0\nv 0 30 0\nv 0 0 40\nf 1 2 3\nf 1 4 2\nf 1 3 4\nf 2 4 3\n'],'drag-module.obj');
  const {asset}=await parseModel(f,[f],{unit:'mm',up:'z'});await saveAsset(asset);store.registerAsset(asset);
 });
 await page.locator('#open-hangar').click();await expect(page.locator('#local-assets')).toContainText('drag-module');await page.locator('#studio-close').click();
 await page.locator('#asset-shelf [draggable=true]').dragTo(page.locator('#three-container'));
 await expect(page.locator('#selected-content')).toContainText('drag-module');await expect(page.locator('#instance-count')).toHaveText('19 PARTS');
});
