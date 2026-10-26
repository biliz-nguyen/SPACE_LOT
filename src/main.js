import {setupManifest} from './manifest.js';
import './style.css';
import './expedition.css';
import {setupStudio} from './assets/studio.js';
import { DroneScene } from './scene.js';
import { store,catalog } from './store.js';
import { analyze,validate,instanceComponent,categoryOf,portOf } from './engineering.js';
import { CATALOG_FAMILIES,CATALOG_CATEGORIES,filterCatalog } from './catalog.js';

const $=(sel)=>document.querySelector(sel);
const clean=(value)=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const TYPES={frame:'Frame',fc:'Flight controller',motor:'Motor',esc:'ESC',prop:'Propeller',battery:'Battery',power:'Power',gps:'GPS',receiver:'Receiver',custom:'Imported assets'};
const ICONS={frame:'⬡',fc:'▦',motor:'◎',esc:'▥',prop:'⌁',battery:'▰',power:'⚡',gps:'◉',receiver:'⌁',custom:'◈'};
const model=new DroneScene($('#three-container'),id=>store.select(id), (id,pos)=>store.move(id,pos));
let lastToastTimer;
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(lastToastTimer);lastToastTimer=setTimeout(()=>el.classList.remove('visible'),3600);}
function formatNumber(x,digits=1){return Number.isFinite(x)?x.toLocaleString('en-US',{maximumFractionDigits:digits}):'—';}
function downloadJSON(filename,obj){const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

const expandedCatalog=new Set(['frame','motor']);
const allCatalogOpen=()=>CATALOG_CATEGORIES.every(c=>expandedCatalog.has(c.id));
function renderCatalog(){
  const filter=$('#catalog-filter');
  if(filter.options.length!==CATALOG_CATEGORIES.length+1){
    filter.innerHTML='<option value="all">All component types</option>'+CATALOG_CATEGORIES.map(c=>`<option value="${c.id}">${clean(c.label)}</option>`).join('');
  }
  filter.value=store.activeCategory;
  const query=store.search.trim().toLowerCase();
  const matching=filterCatalog(catalog,store.activeCategory,query);
  $('#part-count').textContent=catalog.length;
  $('#catalog-match-count').textContent=`${matching.length} / ${catalog.length} components`;
  $('#catalog-clear').hidden=!store.search;
  $('#catalog-toggle-all').textContent=allCatalogOpen()?'Collapse all':'Expand all';
  const markup=CATALOG_FAMILIES.map(f=>{
    const sections=f.categories.map(c=>{
      const items=matching.filter(part=>part.category===c.id);
      if(!items.length)return '';
      const open=Boolean(query)||store.activeCategory===c.id||expandedCatalog.has(c.id);
      return `<section class="catalog-section" data-section="${c.id}">
        <button class="catalog-section-toggle" type="button" data-toggle-category="${c.id}" aria-expanded="${open}" aria-controls="catalog-items-${c.id}">
          <span class="catalog-section-icon ${c.id}" aria-hidden="true">${ICONS[c.id]}</span>
          <span class="catalog-section-label"><strong>${clean(c.label)}</strong><small>${clean(c.description)}</small></span>
          <span class="catalog-section-count">${items.length}</span><span class="catalog-chevron" aria-hidden="true">⌄</span>
        </button>
        <div id="catalog-items-${c.id}" class="catalog-section-body" ${open?'':'hidden'}>${items.map(part=>`<div class="catalog-item">
          <div class="part-icon ${part.category}" aria-hidden="true">${ICONS[part.category]}</div>
          <div class="catalog-desc"><strong title="${clean(part.name)}">${clean(part.name)}</strong><small title="${clean(part.subtitle)}">${clean(part.subtitle)}</small><span>${formatNumber(part.massG,0)} g <i>·</i> ${clean(c.label)}</span></div>
          <button class="add-part" type="button" data-add="${clean(part.id)}" aria-label="Thêm ${clean(part.name)}" title="Thêm ${clean(part.name)}">+</button>
        </div>`).join('')}</div>
      </section>`;
    }).filter(Boolean).join('');
    return sections?`<div class="catalog-family"><div class="catalog-family-heading">${clean(f.name)}</div>${sections}</div>`:'';
  }).filter(Boolean).join('');
  $('#catalog-list').innerHTML=markup||'<div class="empty-state">Không tìm thấy linh kiện. Hãy thử từ khóa hoặc nhóm khác.</div>';
}
function renderAssembly(){
  $('#instance-count').textContent=`${store.project.instances.length} PARTS`;
  const order=['frame','fc','battery','power','gps','receiver','motor','esc','prop','custom'];
  const sections=order.map(category=>{
    const parts=store.project.instances.filter(i=>categoryOf(catalog,i)===category);
    if(!parts.length)return '';
    return `<div class="tree-category"><span>${TYPES[category]}</span><small>${parts.length}</small></div>`+parts.map(i=>{
      const c=instanceComponent(catalog,i);
      return `<button class="tree-item ${store.selectedId===i.id?'active':''}" data-select="${clean(i.id)}"><span class="tree-icon">${ICONS[category]}</span><span>${clean(c?.name??'Unknown')}</span><small>↗</small></button>`;
    }).join('');
  });
  $('#assembly-tree').innerHTML=sections.join('')||'<div class="empty-state">Chưa có linh kiện.</div>';
}
function renderSelection(){
  const selected=store.project.instances.find(i=>i.id===store.selectedId);
  if(!selected){$('#selected-content').innerHTML='<div class="empty-state">Chọn linh kiện trong hình 3D hoặc danh sách.</div>';return;}
  const component=instanceComponent(catalog,selected);
  $('#selected-content').innerHTML=`
    <div class="selection-hero"><div class="part-icon big ${component.category}">${ICONS[component.category]}</div><div><strong>${clean(component.name)}</strong><small>${clean(selected.id)}</small></div><span class="data-badge">${component.assetId?(component.origin==='ai'?'AI VISUAL':'IMPORTED'):'DEMO'}</span></div>
    <div class="selection-spec"><span>Dimensions</span><strong>${component.dimensionsMm.map(x=>formatNumber(x,0)).join(' × ')} mm</strong></div>
    <div class="selection-spec"><span>Mass</span><strong>${component.massG===null?'Unknown':formatNumber(component.massG)+' g'}</strong></div>
    <div class="section-title subselection">POSITION <span>mm · engineering axes</span></div>
    <div class="position-grid">${['X · forward','Y · right','Z · up'].map((axis,j)=>`<label>${axis}<input type="number" data-pos="${j}" value="${selected.positionMm[j]}" step="1" min="-5000" max="5000" /></label>`).join('')}</div>
    <div class="selected-buttons"><button class="btn secondary" id="load-model-btn">↥ Import studio</button><button class="btn danger" id="delete-selected">Remove</button><input type="file" id="model-file" accept=".glb,model/gltf-binary" hidden /></div>
    <div class="scope-note selection-note">Model import được lưu cục bộ trong My hangar. Thông số CAD/pinout cần nguồn xác thực trước khi dùng để kiểm tra tương thích.</div>`;
}
function renderMetrics(){
  const data=analyze(store.project,catalog);
  $('#mass-value').textContent= `${formatNumber(data.massG,0)} g${data.incompleteMass?' + ?':''}`;
  $('#cg-value').textContent= data.incompleteMass?'Unknown':`${formatNumber(data.cgOffsetMm,1)} mm`;
  $('#twr-value').textContent= Number.isFinite(data.twr)?`${formatNumber(data.twr,2)} : 1`:'N/A';
  $('#time-value').textContent= Number.isFinite(data.hoverMin)?`${formatNumber(data.hoverMin,1)} min`:'N/A';
  $('#scene-status').textContent=data.incompleteMass?`${store.project.instances.length} parts · CG unknown (missing mass)`:`${store.project.instances.length} parts · CG (${data.cgMm.map(n=>formatNumber(n,1)).join(', ')}) mm`;
}
function renderValidation(){
  const result=validate(store.project,catalog);
  const score=result.summary;
  $('#checks-summary').textContent=`${score.fail} ERRORS · ${score.warning} WARN · ${score.unknown} UNKNOWN`;
  $('#health-dot').className=`status-dot ${score.fail?'bad':score.warning?'warn':'good'}`;
  const color={fail:'bad',warning:'warn',unknown:'unknown',pass:'good'};
  $('#diagnostics').innerHTML=result.issues.map(i=>`<div class="diagnostic ${color[i.level]}"><span>${i.level==='fail'?'×':i.level==='warning'?'!':i.level==='unknown'?'?':'✓'}</span><div><strong>${clean(i.code)}</strong><p>${clean(i.message)}</p></div></div>`).join('')+
    '<div class="scope-note">PASS = qua quy tắc demo, không phải xác nhận thiết bị an toàn.</div>';
}
function wireOptionValue(id,port){return `${id}|${port}`;}
function renderWiring(){
  const panel=$('#wiring-panel');panel.classList.toggle('focus',store.mode==='wiring');
  $('#wire-count').textContent=`${store.project.connections.length} LINKS`;
  const links=store.project.connections;
  $('#wire-list').innerHTML=`<div class="wire-filter"><label>Hiển thị</label><select id="wire-focus"><option value="all">All links</option>${links.map(w=>`<option value="${clean(w.id)}" ${store.highlightedWire===w.id?'selected':''}>${clean(w.label||w.id)}</option>`).join('')}</select></div>` +
    links.map(w=>`<div class="wire-row"><div class="wire-dot ${w.kind==='power'?'power':''}"></div><div><strong>${clean(w.label||w.id)}</strong><small>${clean(w.fromPort)} → ${clean(w.toPort)}</small></div><button data-remove-wire="${clean(w.id)}" title="Xóa kết nối">×</button></div>`).join('') || '<div class="empty-state">Không có đường kết nối.</div>';
  const portEntries=store.project.instances.flatMap(i=>{
    const c=instanceComponent(catalog,i);
    return (c?.ports||[]).map(p=>({instance:i,port:p}));
  });
  const srcOptions=portEntries.filter(x=>x.port.direction==='out');
  const targetOptions=portEntries.filter(x=>x.port.direction==='in');
  const oldFrom=$('#wire-from').value,oldTo=$('#wire-to').value;
  $('#wire-from').innerHTML=srcOptions.map(x=>`<option value="${clean(wireOptionValue(x.instance.id,x.port.id))}">${clean(x.instance.id)} · ${clean(x.port.id)}</option>`).join('');
  $('#wire-to').innerHTML=targetOptions.map(x=>`<option value="${clean(wireOptionValue(x.instance.id,x.port.id))}">${clean(x.instance.id)} · ${clean(x.port.id)}</option>`).join('');
  if([...$('#wire-from').options].some(o=>o.value===oldFrom))$('#wire-from').value=oldFrom;
  if([...$('#wire-to').options].some(o=>o.value===oldTo))$('#wire-to').value=oldTo;
}
function render(){
  renderCatalog();renderAssembly();renderSelection();renderMetrics();renderValidation();renderWiring();
  $('#project-name').value=store.project.projectName;
  $('#explode-slider').value=store.explode;$('#explode-value').textContent=store.explode+'%';
  $('#show-labels').checked=store.showLabels;$('#show-clearance').checked=store.showClearance;
  document.querySelectorAll('.mode').forEach(n=>n.classList.toggle('active',n.dataset.mode===store.mode));
  document.querySelectorAll('.tool').forEach(n=>n.classList.toggle('active',n.dataset.tool===store.tool));
  $('#drag-hint').textContent=store.tool==='move'?'Move: kéo trực tiếp linh kiện trên mặt phẳng XY (giữ nguyên cao độ Z)':'Click để chọn · Kéo chuột trái để xoay · Cuộn để zoom';
  model.setData(store.project,catalog,{selectedId:store.selectedId,mode:store.mode,tool:store.tool,explode:store.explode,showLabels:store.showLabels,showClearance:store.showClearance,highlightedWire:store.highlightedWire});
}
store.subscribe(render);

$('#catalog-search').addEventListener('input',e=>{store.search=e.target.value;renderCatalog();});
$('#catalog-clear').addEventListener('click',()=>{store.search='';$('#catalog-search').value='';renderCatalog();$('#catalog-search').focus();});
$('#catalog-filter').addEventListener('change',e=>{store.activeCategory=e.target.value;renderCatalog();$('#catalog-list').parentElement.scrollTop=0;});
$('#catalog-toggle-all').addEventListener('click',()=>{
  const open=!allCatalogOpen();expandedCatalog.clear();
  if(open)CATALOG_CATEGORIES.forEach(c=>expandedCatalog.add(c.id));
  renderCatalog();
});
$('#catalog-list').addEventListener('click',e=>{
  const add=e.target.closest('[data-add]');
  if(add){const part=store.add(add.dataset.add);if(part)toast('Đã thêm '+part.id);else toast('Không thể thêm: đạt giới hạn 80 parts.');return;}
  const toggle=e.target.closest('[data-toggle-category]');
  if(!toggle)return;
  const key=toggle.dataset.toggleCategory;
  if(expandedCatalog.has(key))expandedCatalog.delete(key);else expandedCatalog.add(key);
  // Preserve scroll position while re-rendering the group.
  const scroll=$('#catalog-list').parentElement,top=scroll.scrollTop;
  renderCatalog();scroll.scrollTop=top;
});
$('#assembly-tree').addEventListener('click',e=>{const b=e.target.closest('[data-select]');if(b)store.select(b.dataset.select);});
$('#selected-content').addEventListener('change',async e=>{
  const input=e.target;
  if(input.matches('[data-pos]')){
    const inst=store.project.instances.find(x=>x.id===store.selectedId);if(!inst)return;
    const v=Number(input.value);if(!Number.isFinite(v)){toast('Tọa độ không hợp lệ.');renderSelection();return;}
    const pos=[...inst.positionMm];pos[Number(input.dataset.pos)]=v;store.move(inst.id,pos);
  }

});
$('#selected-content').addEventListener('click',e=>{
  if(e.target.closest('#delete-selected')){store.remove(store.selectedId);toast('Đã xóa linh kiện và dây liên quan.');}
  if(e.target.closest('#load-model-btn'))studio.open('import');
});
$('#wiring-panel').addEventListener('change',e=>{if(e.target.id==='wire-focus'){store.highlightedWire=e.target.value;store.changed(false);}});
$('#wiring-panel').addEventListener('click',e=>{
  const rm=e.target.closest('[data-remove-wire]');if(rm){store.removeWire(rm.dataset.removeWire);toast('Đã xóa demo link.');}
  if(e.target.closest('#add-wire-btn')){
    const [from,fromPort]=($('#wire-from').value||'').split('|');const [to,toPort]=($('#wire-to').value||'').split('|');
    if(!from || !to){toast('Cần hai cổng hợp lệ.');return;}
    store.addWire(from,fromPort,to,toPort);store.highlightedWire='all';toast('Đã thêm link; xem kết quả Validation.');
  }
});
$('#explode-slider').addEventListener('input',e=>{store.explode=Number(e.target.value);if(store.explode){store.tool='select';store.highlightedWire='all';}store.changed(false);});
$('#show-labels').addEventListener('change',e=>{store.showLabels=e.target.checked;store.changed(false);});
$('#show-clearance').addEventListener('change',e=>{store.showClearance=e.target.checked;store.changed(false);});
document.querySelectorAll('.mode').forEach(btn=>btn.addEventListener('click',()=>{store.mode=btn.dataset.mode;if(store.mode==='wiring')store.explode=0;store.changed(false);}));
document.querySelectorAll('.tool').forEach(btn=>btn.addEventListener('click',()=>{store.tool=btn.dataset.tool;if(store.tool==='move')store.explode=0;store.changed(false);}));
$('#camera-home').addEventListener('click',()=>model.cameraHome());$('#camera-top').addEventListener('click',()=>model.cameraTop());
$('#clear-selection').addEventListener('click',()=>store.select(null));
$('#project-name').addEventListener('change',e=>{store.project.projectName=e.target.value.slice(0,72);store.changed();});
$('#export-btn').addEventListener('click',()=>{downloadJSON('space-lot-assembly.json',store.project);toast('Đã xuất project JSON.');});
$('#import-btn').addEventListener('click',()=>studio.open('import'));
$('#import-project-btn').addEventListener('click',()=>$('#import-file').click());
$('#import-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{store.import(JSON.parse(await file.text()));toast('Đã import project.');}catch(err){toast(`Import failed: ${err.message}`);}e.target.value='';});
$('#reset-btn').addEventListener('click',()=>{if(confirm('Khôi phục cấu hình mẫu? Các thay đổi chưa export sẽ bị mất.')){store.reset();toast('Đã reset project demo.');}});
$('#report-btn').addEventListener('click',()=>{
  const report={generatedAt:new Date().toISOString(),title:'SPACE_LOT prototype validation report',disclaimer:'ILLUSTRATIVE DATA ONLY — DOES NOT APPROVE REAL HARDWARE',projectName:store.project.projectName,summary:analyze(store.project,catalog),validation:validate(store.project,catalog),instances:store.project.instances.map(i=>({id:i.id,name:instanceComponent(catalog,i)?.name,positionMm:i.positionMm}))};
  downloadJSON('space-lot-validation-report.json',report);toast('Đã xuất báo cáo JSON.');
});
setupManifest({store,catalog});
const studio=setupStudio({store,catalog,model,toast});
$('#open-hangar').onclick=()=>studio.open('local');
$('#open-community').onclick=()=>studio.open('community');
$('#open-ai').onclick=()=>studio.open('ai');
$('#three-container').addEventListener('asset-error',e=>toast(e.detail));
render();
