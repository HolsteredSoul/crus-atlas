import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Box3, BoxGeometry, Group, Mesh, Vector3 } from 'three';
import requiredParts from '../assets/required-parts.json';
import supplements from '../assets/supplements.json';
import { catalogue, byId, partOpacity, hiddenByDefault } from '../src/catalogue.ts';
import { conditions } from '../src/conditions.ts';
import { validateModel, disposeModel } from '../src/model.ts';
import { explodeOffsets, type LayoutItem } from '../src/layout.ts';

const binary=fs.readFileSync(new URL('../public/models/right-lower-leg.glb',import.meta.url));
const gltf=JSON.parse(binary.subarray(20,20+binary.readUInt32LE(12)).toString('utf8'));
const manifest=JSON.parse(fs.readFileSync(new URL('../public/models/manifest.json',import.meta.url),'utf8'));
const nodes=gltf.nodes.filter((n:any)=>n.mesh!==undefined);
function contractFixture(){const root=new Group();for(const n of nodes){const mesh=new Mesh(new BoxGeometry(1,1,1));mesh.userData=structuredClone(n.extras);root.add(mesh);}return root;}
function items():LayoutItem[]{return catalogue.map(p=>{const b=manifest.parts[p.id];const box=new Box3(new Vector3(...b.min),new Vector3(...b.max));return {id:p.id,type:p.type,compartment:p.compartment,center:box.getCenter(new Vector3()),size:box.getSize(new Vector3())};});}

test('shipped GLB is complete Draco anatomy, with separate IDs and source tissue colours',()=>{
 assert.equal(binary.readUInt32LE(0),0x46546c67);assert.equal(binary.readUInt32LE(8),binary.length);
 assert.equal(nodes.length,catalogue.length);assert.deepEqual(new Set(catalogue.map(p=>p.id)),new Set([...requiredParts,...supplements.map(p=>p.id)]));assert.ok(binary.length<25_000_000);
 assert.ok(gltf.extensionsRequired.includes('KHR_draco_mesh_compression'));
 assert.equal(new Set(nodes.map((n:any)=>n.extras.id)).size,catalogue.length);
 const root=contractFixture();assert.equal(validateModel(root).size,catalogue.length);disposeModel(root);
 for(const n of nodes){const primitives=gltf.meshes[n.mesh].primitives;assert.equal(primitives.length,1);assert.ok(primitives[0].extensions.KHR_draco_mesh_compression);assert.ok(primitives[0].attributes.COLOR_0!==undefined,n.extras.id);}
 for(const p of catalogue){const m=manifest.parts[p.id];assert.ok(m.polygons>0,p.id);assert.ok([...m.min,...m.max].every(Number.isFinite),p.id);assert.ok(m.sources.length,p.id);}
 for(let toe=1;toe<=5;toe++){assert.ok(byId.has(`toe_${toe}_proximal`));assert.ok(byId.has(`toe_${toe}_distal`));assert.equal(byId.has(`toe_${toe}_middle`),toe!==1);}
 const lookup=new Map(items().map(p=>[p.id,p]));assert.ok(lookup.get('fibula')!.center.x<lookup.get('tibia')!.center.x);assert.ok(lookup.get('femur_distal')!.center.y>lookup.get('talus')!.center.y);assert.ok(lookup.get('toe_1_distal')!.center.z>lookup.get('talus')!.center.z);
});
test('metadata validator rejects missing, duplicate, unknown and wrong-side anatomy',()=>{
 assert.throws(()=>validateModel(new Group()),/Missing parts/);const root=contractFixture();const mesh=root.children[0] as Mesh;const dupe=mesh.clone();root.add(dupe);assert.throws(()=>validateModel(root),/Duplicate/);root.remove(dupe);const id=mesh.userData.id;mesh.userData.id='bad';assert.throws(()=>validateModel(root),/Unknown/);mesh.userData.id=id;mesh.userData.laterality='left';assert.throws(()=>validateModel(root),/laterality/);disposeModel(root);
});
test('clinical references and registered markers refer to included source anatomy',()=>{
 assert.equal(conditions.length,14);assert.equal(new Set(conditions.map(c=>c.id)).size,14);
 for(const c of conditions){assert.ok(c.mechanism&&c.landmark&&c.ultrasound&&c.mri&&c.lookAlikes);assert.ok(c.sources.every(s=>s.url.startsWith('https://')));for(const id of c.parts)assert.ok(byId.has(id));for(const m of c.markers){assert.ok(c.parts.includes(m.partId));assert.ok(m.scale.every(n=>n>0));const b=manifest.parts[m.partId];const bounds=new Box3(new Vector3(...b.min),new Vector3(...b.max)).expandByScalar(5);assert.ok(bounds.containsPoint(new Vector3(...m.position)),`${c.id}: marker outside ${m.partId}`);}}
 for(const id of ['tennis_leg','achilles_rupture','soleus_strain'])assert.match(conditions.find(c=>c.id===id)!.lookAlikes,/DVT/);
});
test('inventory avoids overlap using actual source mesh bounds',()=>{
 for(const parts of [items(),items().filter(p=>p.type==='muscle'),items().slice(0,1)]){const offsets=explodeOffsets(parts,'inventory');const boxes=parts.map(p=>new Box3().setFromCenterAndSize(p.center.clone().add(offsets.get(p.id)!),p.size));for(let a=0;a<boxes.length;a++)for(let b=a+1;b<boxes.length;b++)assert.equal(boxes[a].intersectsBox(boxes[b]),false,`${parts[a].id}/${parts[b].id}`);}
});
test('hierarchical explosion fixes bones and reduces tendon displacement',()=>{
 const parts=items();for(const mode of ['compartment','hierarchical'] as const){const offsets=explodeOffsets(parts,mode);for(const p of parts.filter(p=>p.type==='bone'))assert.equal(offsets.get(p.id)!.length(),0);}
 const pair:LayoutItem[]=[{id:'m',type:'muscle',compartment:'anterior',center:new Vector3(0,285,20),size:new Vector3(10,100,10)},{id:'t',type:'tendon',compartment:'anterior',center:new Vector3(0,285,20),size:new Vector3(10,100,10)}];const offsets=explodeOffsets(pair,'hierarchical');assert.ok(offsets.get('t')!.length()<offsets.get('m')!.length());
});

test('new tendon partitions conserve all source faces and visible fascia can be picked',()=>{
 const audit=JSON.parse(fs.readFileSync(new URL('../public/models/partition-audit.json',import.meta.url),'utf8'));
 for(const item of supplements.filter(s=>'splitFrom' in s)){
  const record=audit[item.id];assert.ok(record.allFacesAssignedExactlyOnce);
  assert.equal(Object.values<number>(record.sourceFaces).reduce((a,b)=>a+b,0),Object.values<number>(record.allocation).reduce((a,b)=>a+b,0));
  assert.ok(record.allocation[item.id]>0);assert.ok(record.allocation[String(item.splitFrom)]>0);
 }
 for(const part of catalogue){assert.ok(part.provenance);if(['fascia','sheath'].includes(part.type)){assert.ok(partOpacity(part)>.15);assert.ok(hiddenByDefault(part));}}
});
