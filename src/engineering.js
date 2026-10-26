// Pure engineering helpers: no UI or WebGL dependencies.
// All numeric examples in data/components.json are illustrative, not verified specifications.
export const componentById = (catalog, id) => catalog.find(c => c.id === id);
export const instanceComponent = (catalog, instance) => componentById(catalog, instance.componentId);
export const categoryOf = (catalog, instance) => instanceComponent(catalog, instance)?.category;
export const instancesOf = (project, catalog, category) => project.instances.filter(i => categoryOf(catalog, i) === category);
export const vecDistanceXY = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function linearInterpolateCurrent(curve, thrustG) {
  if (!Array.isArray(curve) || curve.length < 2 || thrustG < 0) return null;
  const ordered = [...curve].sort((a, b) => a.thrustG - b.thrustG);
  if (thrustG > ordered[ordered.length - 1].thrustG) return null;
  for (let i=1; i<ordered.length; i++) {
    const low = ordered[i-1], high = ordered[i];
    if (thrustG <= high.thrustG) {
      const fraction = (thrustG-low.thrustG)/(high.thrustG-low.thrustG || 1);
      return low.currentA + fraction*(high.currentA-low.currentA);
    }
  }
  return null;
}

export function analyze(project, catalog) {
  let massG=0, sx=0, sy=0, sz=0;
  for (const i of project.instances) {
    const c=instanceComponent(catalog,i);
    if (!c || !Number.isFinite(c.massG)) continue;
    massG+=c.massG;
    sx+=i.positionMm[0]*c.massG; sy+=i.positionMm[1]*c.massG; sz+=i.positionMm[2]*c.massG;
  }
  const cgMm=massG ? [sx/massG,sy/massG,sz/massG] : [0,0,0];
  const frame = instancesOf(project,catalog,'frame')[0];
  const frameOrigin=frame?.positionMm ?? [0,0,0];
  const cgOffsetMm = vecDistanceXY(cgMm,frameOrigin);
  const motors=instancesOf(project,catalog,'motor');
  const props=instancesOf(project,catalog,'prop');
  const bats=instancesOf(project,catalog,'battery');
  let twr=null, hoverMin=null, hoverCurrentA=null, maximumThrustG=null;
  const m=motsSame(motors,catalog);
  const p=props.length===motors.length && props.every(x=>instanceComponent(catalog,x)?.diameterIn===10);
  const battery=bats.length===1 ? instanceComponent(catalog,bats[0]) : null;
  // Intentionally no extrapolation for other voltage/propeller combinations.
  if (m && p && battery?.cells===3 && m.thrustCurve3S1045?.length) {
    const curve=m.thrustCurve3S1045;
    maximumThrustG=motors.length*curve.at(-1).thrustG;
    twr=massG>0 ? maximumThrustG/massG : null;
    const motorCurrent=linearInterpolateCurrent(curve,massG/motors.length);
    if (motorCurrent!==null && twr>1) {
      hoverCurrentA=motors.length*motorCurrent + 0.8; // 0.8 A avionics: illustrative assumption.
      hoverMin = 60*(battery.capacityMah/1000)*battery.usableFraction/hoverCurrentA;
    }
  }
  const incompleteMass=project.instances.some(i=>!Number.isFinite(instanceComponent(catalog,i)?.massG));
  if(incompleteMass){twr=null;hoverMin=null;}
  return {massG,cgMm,cgOffsetMm,twr,hoverMin,hoverCurrentA,maximumThrustG,incompleteMass};
}
function motsSame(motors,catalog) {
  if (!motors.length) return null;
  const id=motors[0].componentId;
  return motors.every(x=>x.componentId===id) ? componentById(catalog,id) : null;
}

function portsOf(component) { return component?.ports ?? []; }
export function portOf(catalog, instance, portId) {
  return portsOf(instanceComponent(catalog,instance)).find(p=>p.id===portId);
}

export function validate(project,catalog) {
  const issues=[];
  const add=(level,code,message)=>issues.push({level,code,message});
  for(const inst of project.instances.filter(i=>instanceComponent(catalog,i)?.assetId))add('unknown','IMPORTED_SPECS',`${instanceComponent(catalog,inst).name}: mesh trực quan; chưa xác minh thông số, pinout và tương thích.`);
  const counts = Object.fromEntries(['frame','fc','battery','power','gps','receiver','motor','esc','prop'].map(k=>[k,instancesOf(project,catalog,k).length]));
  if (counts.frame!==1) add('fail','FRAME_COUNT',`Quad X cần 1 frame (hiện có ${counts.frame}).`);
  if (counts.fc!==1) add('fail','FC_COUNT',`Cần 1 flight controller (hiện có ${counts.fc}).`);
  if (counts.battery!==1) add('fail','BATTERY_COUNT',`Cần 1 pin (hiện có ${counts.battery}).`);
  if (counts.motor!==4) add('fail','MOTOR_COUNT',`Quad X cần 4 motor (hiện có ${counts.motor}).`);
  if (counts.esc!==4) add('fail','ESC_COUNT',`Demo yêu cầu 4 ESC rời (hiện có ${counts.esc}).`);
  if (counts.prop!==4) add('fail','PROP_COUNT',`Quad X cần 4 cánh quạt (hiện có ${counts.prop}).`);
  if (counts.power!==1) add('warning','POWER_COUNT','Chưa đủ dữ liệu nguồn FC: cần 1 power module 5 V trong cấu hình demo.');

  const frame = instanceComponent(catalog,instancesOf(project,catalog,'frame')[0] || {});
  const fc = instanceComponent(catalog,instancesOf(project,catalog,'fc')[0] || {});
  if (frame && fc && !frame.mountingPatternsMm?.includes(fc.mountSpacingMm)) add('fail','FC_MOUNT',`Mount FC ${fc.mountSpacingMm} mm không trùng frame.`);

  const bats=instancesOf(project,catalog,'battery');
  const battery=bats.length===1 ? instanceComponent(catalog,bats[0]) : null;
  for (const cat of ['motor','esc']) for(const inst of instancesOf(project,catalog,cat)) {
    const c=instanceComponent(catalog,inst);
    if (battery && c.supportedCells && !c.supportedCells.includes(battery.cells)) add('fail','CELLS',`${c.name} không hỗ trợ pin ${battery.cells}S.`);
  }
  if (battery) for(const inst of instancesOf(project,catalog,'power')) {
    const pm=instanceComponent(catalog,inst);
    if (pm.inputCells && !pm.inputCells.includes(battery.cells)) add('fail','PM_VOLT','Nguồn DC/DC không hỗ trợ số cell pin đang chọn.');
  }
  const motors=instancesOf(project,catalog,'motor'); const escs=instancesOf(project,catalog,'esc'); const props=instancesOf(project,catalog,'prop');
  for (const motor of motors) {
    const c=instanceComponent(catalog,motor);
    if (escs.length) {
      const minAmps=Math.min(...escs.map(e=>instanceComponent(catalog,e)?.continuousCurrentA??0));
      if (minAmps<c.maxCurrentA) add('fail','ESC_CURRENT',`ESC ${minAmps} A thấp hơn motor max ${c.maxCurrentA} A.`);
    }
  }
  if (battery && motors.length) {
    const maxCurrentA=motors.reduce((acc,m)=>acc+(instanceComponent(catalog,m)?.maxCurrentA??0),0);
    const nominalMaxA=(battery.capacityMah/1000)*battery.dischargeC;
    if (nominalMaxA<maxCurrentA) add('warning','BATTERY_C','Dòng xả định mức demo nhỏ hơn tổng dòng max motor; còn phải xét sag và nhiệt.');
  }
  for (const prop of props) {
    const p=instanceComponent(catalog,prop);
    const m=motors[0] && instanceComponent(catalog,motors[0]);
    if (m && !m.propDiameterIn?.includes(p.diameterIn)) add('warning','PROP_MOTOR',`Motor chưa có dữ liệu tương thích cánh ${p.diameterIn} inch.`);
  }
  if (props.length >=2) {
    for(let i=0;i<props.length;i++) for(let j=i+1;j<props.length;j++) {
      const a=props[i],b=props[j];
      const ra=(instanceComponent(catalog,a)?.diameterMm??0)/2;
      const rb=(instanceComponent(catalog,b)?.diameterMm??0)/2;
      if(vecDistanceXY(a.positionMm,b.positionMm)<ra+rb+5) add('fail','PROP_CLEARANCE',`Đĩa quét ${a.id} và ${b.id} không đạt khoảng hở 5 mm (kiểm tra 2D).`);
    }
  }
  // Conservative primitive AABB collision check: simplified / axis aligned, not a mesh collision guarantee.
  const interiors=project.instances.filter(i=>['fc','battery','gps','receiver','power'].includes(categoryOf(catalog,i)));
  for(let i=0;i<interiors.length;i++) for(let j=i+1;j<interiors.length;j++){
    const a=interiors[i],b=interiors[j],ca=instanceComponent(catalog,a),cb=instanceComponent(catalog,b);
    const overlaps=[0,1,2].every(k=>Math.abs(a.positionMm[k]-b.positionMm[k])<(ca.dimensionsMm[k]+cb.dimensionsMm[k])/2);
    if(overlaps) add('warning','BBOX_COLLISION',`Bounding boxes ${a.id} / ${b.id} giao nhau; cần kiểm tra mesh thực.`);
  }
  for (const w of project.connections) {
    const src=project.instances.find(i=>i.id===w.from),dst=project.instances.find(i=>i.id===w.to);
    if(!src || !dst){add('fail','WIRE_TARGET',`Dây ${w.id}: thiếu linh kiện đầu nối.`);continue;}
    const a=portOf(catalog,src,w.fromPort),b=portOf(catalog,dst,w.toPort);
    if(!a || !b){add('fail','WIRE_PORT',`Dây ${w.id}: cổng không tồn tại.`);continue;}
    if(a.direction!=='out' || b.direction!=='in') add('fail','WIRE_DIRECTION',`${w.id}: nối sai hướng tín hiệu.`);
    const signalsCompatible = (a.signal==='uart-tx'&&b.signal==='uart-rx') || (a.signal===b.signal && ['power','battery-power','pwm','motor-phase'].includes(a.signal));
    if(!signalsCompatible) add('fail','WIRE_SIGNAL',`${w.id}: không khớp loại tín hiệu ${a.signal} → ${b.signal}.`);
    const supplyV=a.nominalVoltageV;
    if(Number.isFinite(supplyV) && Array.isArray(b.voltageV) && (supplyV<b.voltageV[0] || supplyV>b.voltageV[1])) add('fail','WIRE_VOLT',`${w.id}: ${supplyV} V không nằm trong dải điện áp cổng nhận.`);
    if(a.logicVoltageV && b.logicVoltageV && a.logicVoltageV!==b.logicVoltageV) add('warning','LOGIC_LEVEL',`${w.id}: logic-level khác nhau, cần level shifter.`);
  }
  const prediction=analyze(project,catalog);
  if(prediction.twr===null) add('unknown','NO_THRUST_DATA','Thiếu dữ liệu tổ hợp motor + prop + điện áp để ước tính lực đẩy; không ngoại suy.');
  const summary={fail:issues.filter(x=>x.level==='fail').length,warning:issues.filter(x=>x.level==='warning').length,unknown:issues.filter(x=>x.level==='unknown').length};
  if (!issues.length) add('pass','DEMO_CHECKS','Các quy tắc demo hiện tại đã qua; chưa xác minh phần cứng thật.');
  return {issues,summary, counts};
}

export function validateProjectShape(obj,catalog) {
  if (!obj || obj.schemaVersion!==1 || !Array.isArray(obj.instances) || !Array.isArray(obj.connections)) throw Error('Không đúng định dạng AeroGuide project schemaVersion 1.');
  if(obj.instances.length>80 || obj.connections.length>300) throw Error('Project vượt giới hạn demo (80 parts, 300 wires).');
  const ids=new Set();
  for(const p of obj.instances){
    if(!p || typeof p.id!=='string' || !/^[\w-]{1,80}$/.test(p.id) || ids.has(p.id)) throw Error('Instance ID không hợp lệ hoặc trùng lặp.');
    if(!componentById(catalog,p.componentId)) throw Error(`Component ID không nằm trong catalog: ${String(p.componentId)}`);
    if(!Array.isArray(p.positionMm) || p.positionMm.length!==3 || !p.positionMm.every(v=>Number.isFinite(v) && Math.abs(v)<=5000)) throw Error('Tọa độ không hợp lệ.');
    ids.add(p.id);
  }
  for (const w of obj.connections) {
    if(!w || typeof w.id!=='string' || !ids.has(w.from) || !ids.has(w.to) || typeof w.fromPort!=='string' || typeof w.toPort!=='string') throw Error('Connection không hợp lệ.');
  }
  return {schemaVersion:1,projectName:String(obj.projectName||'Imported build').slice(0,72),instances:structuredClone(obj.instances),connections:structuredClone(obj.connections)};
}
