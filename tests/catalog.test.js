import test from 'node:test';
import assert from 'node:assert/strict';
import catalogData from '../data/components.json' with { type:'json' };
import {CATALOG_FAMILIES,CATALOG_CATEGORIES,filterCatalog} from '../src/catalog.js';
const parts=catalogData.components;
test('each component category belongs to exactly one catalog group',()=>{
  const all=CATALOG_CATEGORIES.map(x=>x.id);
  assert.equal(new Set(all).size,all.length);
  for(const part of parts)assert.ok(all.includes(part.category),`Unknown category: ${part.category}`);
  assert.equal(CATALOG_FAMILIES.length,4);
});
test('catalog filters by component category',()=>{
  assert.deepEqual(filterCatalog(parts,'motor').map(x=>x.category),['motor']);
  assert.deepEqual(filterCatalog(parts,'frame').map(x=>x.category),['frame']);
});
test('search matches category labels and part names without case sensitivity',()=>{
  assert.deepEqual(filterCatalog(parts,'all','DRONE FRAMES').map(x=>x.category),['frame']);
  assert.deepEqual(filterCatalog(parts,'all','propellers').map(x=>x.category),['prop']);
  assert.deepEqual(filterCatalog(parts,'all','F405').map(x=>x.category),['fc']);
});
test('search combined with filter and empty results',()=>{
  assert.equal(filterCatalog(parts,'motor','F405').length,0);
  assert.equal(filterCatalog(parts,'all','missing-device').length,0);
  assert.equal(filterCatalog(parts).length,parts.length);
});
