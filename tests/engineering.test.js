import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyze, validate, validateProjectShape} from '../src/engineering.js';
const dir=new URL('../data/',import.meta.url);
const catalog=JSON.parse(readFileSync(new URL('components.json',dir),'utf8')).components;
const sample=JSON.parse(readFileSync(new URL('assembly.json',dir),'utf8'));
const clone=()=>structuredClone(sample);

test('demo configuration mass, CG and thrust estimation remain deterministic',()=>{
  const m=analyze(sample,catalog);
  assert.equal(m.massG,1162);
  assert.ok(Math.abs(m.cgMm[0]-(-9176/1162))<.00001);
  assert.ok(m.twr>2 && m.twr<3);
  assert.ok(m.hoverMin>10 && m.hoverMin<17);
});
test('demo baseline passes only limited illustrative rules',()=>{
  const v=validate(sample,catalog);
  assert.equal(v.summary.fail,0);
  assert.equal(v.summary.warning,0);
  assert.equal(v.issues[0].code,'DEMO_CHECKS');
});
test('missing motor creates fail',()=>{
  const p=clone();p.instances=p.instances.filter(i=>i.id!=='motor-4');
  assert.ok(validate(p,catalog).issues.some(i=>i.code==='MOTOR_COUNT' && i.level==='fail'));
});
test('intersecting propeller discs creates fail',()=>{
  const p=clone();p.instances.find(i=>i.id==='prop-2').positionMm=[160,-140,45];
  assert.ok(validate(p,catalog).issues.some(i=>i.code==='PROP_CLEARANCE'));
});
test('wrong UART TX-to-TX flags invalid signal or direction',()=>{
  const p=clone();p.connections.find(w=>w.id==='wire-3').toPort='TX';
  assert.ok(validate(p,catalog).issues.some(i=>i.code==='WIRE_DIRECTION' || i.code==='WIRE_SIGNAL'));
});
test('battery removed disables thrust estimation',()=>{
  const p=clone();p.instances=p.instances.filter(i=>i.id!=='battery-1');
  assert.equal(analyze(p,catalog).twr,null);
});
test('import validator rejects unknown part references and corrupt coords',()=>{
  const p=clone();p.instances[0].componentId='unknown';
  assert.throws(()=>validateProjectShape(p,catalog),/Component ID/);
  const q=clone();q.instances[0].positionMm=[NaN,0,0];
  assert.throws(()=>validateProjectShape(q,catalog),/Tọa độ/);
});
test('verified shape can round trip with exact coordinates',()=>{
  const p=validateProjectShape(sample,catalog);
  assert.deepEqual(p.instances,sample.instances);
  assert.equal(p.connections.length,9);
});
