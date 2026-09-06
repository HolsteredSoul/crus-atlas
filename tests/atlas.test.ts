import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Group, Mesh, Vector3 } from 'three';
import { catalogue, byId } from '../src/catalogue.ts';
import { conditions } from '../src/conditions.ts';
import { buildProceduralModel, disposeModel, validateModel } from '../src/model.ts';
import { explodeOffsets, type LayoutItem } from '../src/layout.ts';

test('complete procedural mesh contract, finite geometry, and clinically important orientation',()=>{
 const root=buildProceduralModel();const meshes=validateModel(root);
 assert.equal(meshes.size,catalogue.length);assert.equal(new Set(catalogue.map(p=>p.id)).size,catalogue.length);
 for(const [id,mesh] of meshes){assert.equal(mesh.userData.laterality,'right');assert.ok(mesh.geometry.getAttribute('position').count>30,id);const box=new Box3().setFromObject(mesh);assert.ok(!box.isEmpty(),id);assert.ok([...box.min,...box.max].every(Number.isFinite),id);}
 assert.ok(meshes.get('fibula')!.position.x<meshes.get('tibia')!.position.x,'right fibula is lateral (-X)');
 assert.ok(meshes.get('gastrocnemius_medial')!.position.z<meshes.get('tibia')!.position.z,'calf is posterior');
 assert.ok(meshes.get('femur_distal')!.position.y>meshes.get('talus')!.position.y,'proximal is +Y');
 disposeModel(root);
});
test('GLB validator rejects missing, duplicate, unknown and incompatible metadata',()=>{
 assert.throws(()=>validateModel(new Group()),/Missing parts/);
 const root=buildProceduralModel();const mesh=root.children[0] as Mesh;const duplicate=mesh.clone();root.add(duplicate);assert.throws(()=>validateModel(root),/Duplicate/);root.remove(duplicate);
 const id=mesh.userData.id;mesh.userData.id='bad-id';assert.throws(()=>validateModel(root),/Unknown/);mesh.userData.id=id;
 mesh.userData.laterality='left';assert.throws(()=>validateModel(root),/laterality/);disposeModel(root);
});
test('every condition has valid parts, localizable markers, imaging notes and references',()=>{
 assert.equal(conditions.length,14);assert.equal(new Set(conditions.map(c=>c.id)).size,14);
 for(const c of conditions){assert.ok(c.mechanism&&c.landmark&&c.ultrasound&&c.mri&&c.lookAlikes,c.id);assert.ok(c.sources.every(s=>s.url.startsWith('https://')),c.id);for(const id of c.parts)assert.ok(byId.has(id),`${c.id}: ${id}`);for(const m of c.markers){assert.ok(c.parts.includes(m.partId));assert.ok(m.scale.every(n=>n>0));}}
 for(const id of ['tennis_leg','achilles_rupture','soleus_strain'])assert.match(conditions.find(c=>c.id===id)!.lookAlikes,/DVT/);
});
function items(){const root=buildProceduralModel();const data:LayoutItem[]=root.children.map(obj=>{const mesh=obj as Mesh;return {id:mesh.userData.id,center:mesh.position.clone(),size:mesh.geometry.boundingBox!.getSize(new Vector3()),type:mesh.userData.type,compartment:mesh.userData.compartment};});disposeModel(root);return data;}
test('inventory packs all visible bounds without intersection at full explosion',()=>{
 for(const parts of [items(),items().filter(p=>p.type==='muscle'),items().slice(0,1)]){
  const offsets=explodeOffsets(parts,'inventory');const boxes=parts.map(p=>new Box3().setFromCenterAndSize(p.center.clone().add(offsets.get(p.id)!),p.size));
  for(let a=0;a<boxes.length;a++)for(let b=a+1;b<boxes.length;b++)assert.equal(boxes[a].intersectsBox(boxes[b]),false,`${parts[a].id} overlaps ${parts[b].id}`);
 }
});
test('compartment and hierarchical modes retain bones; hierarchical tendon travel is reduced',()=>{
 const parts=items();for(const mode of ['compartment','hierarchical'] as const){const offsets=explodeOffsets(parts,mode);for(const p of parts.filter(p=>p.type==='bone'))assert.equal(offsets.get(p.id)!.length(),0,p.id);}
 const pair:LayoutItem[]=[{id:'m',type:'muscle',compartment:'anterior',center:new Vector3(0,285,20),size:new Vector3(10,100,10)},{id:'t',type:'tendon',compartment:'anterior',center:new Vector3(0,285,20),size:new Vector3(10,100,10)}];
 const offsets=explodeOffsets(pair,'hierarchical');assert.ok(offsets.get('t')!.length()<offsets.get('m')!.length());
});
