import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { catalogue, palette, type Part } from './catalogue';

export type V3 = [number,number,number];
interface Shape {path?: V3[]; radii?: number[]; flatten?:number; center?:V3; size?:V3;}
const oval=(center:V3,size:V3):Shape=>({center,size});
const tube=(path:V3[],radii:number[],flatten=1):Shape=>({path,radii,flatten});
// Millimetres. +Y proximal; +Z anterior; +X medial for this RIGHT leg.
export const shapes:Record<string,Shape[]> = {
 tibia:[tube([[3,89,0],[5,126,1],[4,230,2],[0,357,1],[0,445,0],[0,459,0]],[22,17,13,17,30,29],.8),oval([19,88,0],[11,19,15]),oval([0,421,20],[11,17,10])],
 fibula:[tube([[-35,78,0],[-34,119,-3],[-30,257,-4],[-33,416,-1],[-34,446,0]],[10,7,5,7,13],.85),oval([-35,80,0],[10,16,13])],
 femur_distal:[tube([[0,490,-3],[0,518,-5],[0,577,-5]],[25,20,17],.95),oval([21,482,-4],[23,25,25]),oval([-21,482,-4],[23,25,25])],
 patella:[oval([0,478,29],[20,25,10])],
 talus:[oval([0,73,12],[24,16,26]),oval([2,66,37],[22,13,20])],
 calcaneus:[oval([0,38,0],[24,24,44]),oval([0,32,33],[21,18,24])],
 navicular:[oval([9,58,58],[24,13,15])],medial_cuneiform:[oval([20,46,81],[13,13,17])],
 metatarsal_1:[tube([[20,42,91],[22,32,134],[24,29,160]],[9,6,10],.9)],metatarsal_5:[tube([[-32,33,73],[-39,25,115],[-40,24,140]],[10,5,8],.85)],
 knee_joint:[oval([0,462,0],[39,4,25])],tibfib_proximal:[oval([-32,444,0],[12,3,11])],
 tibfib_distal:[oval([-23,108,0],[8,18,12])],talocrural:[oval([0,90,9],[27,3,22])],subtalar:[oval([0,56,10],[24,3,25])],
 tibial_cartilage:[oval([18,460,0],[18,3,23]),oval([-18,460,0],[18,3,23])],
 tibialis_anterior:[tube([[-17,432,20],[-19,384,30],[-16,312,28],[-11,224,23],[-8,166,20]],[5,17,15,10,3],.8)],
 extensor_hallucis_longus:[tube([[-24,344,23],[-25,289,31],[-24,214,26],[-16,129,23],[-1,87,32],[23,32,171]],[2,8,6,3,2,1.5],.75)],
 extensor_digitorum_longus:[tube([[-32,435,13],[-38,371,22],[-35,286,23],[-31,194,20],[-26,103,23],[-13,53,96]],[3,13,11,6,2,2],.8)],
 fibularis_tertius:[tube([[-35,246,13],[-39,201,17],[-37,152,16],[-30,103,23],[-33,37,80]],[2,8,6,2,2],.85)],
 fibularis_longus:[tube([[-39,440,-2],[-51,386,-1],[-49,316,0],[-43,237,-2],[-40,178,-2]],[3,15,14,7,3],.95)],
 fibularis_brevis:[tube([[-37,336,-9],[-48,283,-7],[-47,217,-4],[-42,156,-6]],[3,10,9,3],.9)],
 gastrocnemius_medial:[tube([[21,495,-16],[23,435,-41],[24,369,-58],[20,307,-62],[10,257,-47],[1,203,-36]],[4,22,27,19,8,3],.8)],
 gastrocnemius_lateral:[tube([[-21,492,-17],[-22,438,-40],[-22,379,-55],[-19,323,-57],[-9,273,-45],[0,203,-36]],[4,19,24,16,6,3],.8)],
 soleus:[tube([[0,426,-26],[0,374,-35],[0,304,-38],[0,226,-37],[0,172,-34]],[9,35,36,23,6],.49)],
 plantaris:[tube([[-26,499,-13],[-28,449,-29],[-24,418,-35],[-8,365,-48],[10,275,-49],[10,189,-38],[8,66,-39]],[1,5,3,1,1,1,1],.85)],
 popliteus:[tube([[-24,479,-15],[-8,441,-24],[20,417,-20]],[2,12,7],.55)],
 tibialis_posterior:[tube([[-10,413,-13],[-4,353,-20],[-2,283,-22],[8,197,-17],[22,142,-11]],[4,14,16,8,3],.75)],
 flexor_digitorum_longus:[tube([[17,405,-15],[24,338,-21],[23,264,-23],[25,182,-17],[27,103,-13],[17,40,22],[8,27,111]],[3,10,11,5,2,2,1],.85)],
 flexor_hallucis_longus:[tube([[-28,352,-16],[-27,290,-24],[-22,218,-23],[-13,139,-22],[4,65,-13],[19,24,79],[23,21,173]],[3,12,13,5,2,2,1.5],.85)],
 achilles:[tube([[0,241,-38],[0,192,-36],[0,139,-35],[0,102,-38],[0,65,-40]],[12,9,6,7,12],.55)],
 tp_tendon:[tube([[18,171,-12],[28,128,-13],[32,96,-9],[29,74,9],[25,55,47],[21,55,61]],[3,3,3,3,3,4],.85)],
 fl_tendon:[tube([[-42,202,-5],[-43,133,-11],[-44,93,-11],[-41,66,-2],[-31,30,51],[-8,22,68],[20,31,92]],[3,3,3,3,3,3,4],.9)],
 fb_tendon:[tube([[-44,175,-3],[-41,125,-4],[-40,93,-3],[-40,67,13],[-34,35,75]],[3,3,3,3,4],.85)],
 ta_tendon:[tube([[-8,188,21],[-5,133,25],[1,99,27],[14,65,53],[23,45,83],[23,40,95]],[3,3,3,3,3,4],.8)],
 atfl:[tube([[-35,85,6],[-26,82,20],[-17,77,29]],[4,4,4],.6)],
 cfl:[tube([[-36,78,0],[-35,61,-3],[-26,43,-7]],[4,4,4],.65)],
 ptfl:[tube([[-34,83,-9],[-19,78,-15],[-5,76,-12]],[4,4,4],.6)],
 deltoid:[tube([[25,89,0],[27,64,17],[21,52,39]],[5,9,4],.6),tube([[25,89,0],[26,61,-1],[20,42,-5]],[4,7,4],.6)],
 syndesmosis:[tube([[-8,118,14],[-20,110,14],[-33,104,10]],[4,5,4],.6),tube([[-7,114,-12],[-21,107,-13],[-32,104,-9]],[4,5,4],.6)],
 anterior_compartment:[oval([-17,287,24],[37,145,30])],lateral_compartment:[oval([-44,287,-1],[22,145,26])],
 superficial_posterior_compartment:[oval([0,321,-47],[53,145,36])],deep_posterior_compartment:[oval([0,285,-21],[32,145,23])],
 common_fibular_nerve:[tube([[-27,511,-31],[-36,465,-21],[-44,438,-11],[-40,419,5],[-35,390,12]],[2.5,2.5,2.5,2.5,2])],
 retrocalcaneal_bursa:[oval([0,73,-25],[12,6,6])],
 superior_fibular_retinaculum:[tube([[-37,110,-8],[-48,94,-14],[-39,63,-14],[-25,50,-18]],[3,5,5,3],.6)],
};

function shapeGeometry(s:Shape):THREE.BufferGeometry {
 if(s.center && s.size){const g=new THREE.SphereGeometry(1,24,16);g.scale(...s.size);g.translate(...s.center);return g.toNonIndexed();}
 const curve=new THREE.CatmullRomCurve3(s.path!.map(v=>new THREE.Vector3(...v)));
 const steps=Math.max(32,s.path!.length*12), radial=14, frames=curve.computeFrenetFrames(steps,false);
 const positions:number[]=[],indices:number[]=[],uv:number[]=[];
 for(let i=0;i<=steps;i++){
  const t=i/steps,point=curve.getPointAt(t),ix=t*(s.radii!.length-1),a=Math.floor(ix),r=THREE.MathUtils.lerp(s.radii![a],s.radii![Math.min(a+1,s.radii!.length-1)],ix-a);
  for(let j=0;j<=radial;j++){const angle=j/radial*Math.PI*2;
   const v=point.clone().addScaledVector(frames.normals[i],Math.cos(angle)*r).addScaledVector(frames.binormals[i],Math.sin(angle)*r*(s.flatten??1));
   positions.push(v.x,v.y,v.z);uv.push(j/radial,t);
   if(i<steps&&j<radial){const n=i*(radial+1)+j;indices.push(n,n+radial+1,n+1,n+1,n+radial+1,n+radial+2);}
  }
 }
 // Close both path ends so cut views and silhouettes remain coherent.
 for(const end of [0,steps]){const point=curve.getPointAt(end/steps),c=positions.length/3;positions.push(point.x,point.y,point.z);uv.push(.5,end/steps);for(let j=0;j<radial;j++){const n=end*(radial+1)+j;indices.push(...(end===0?[c,n+1,n]:[c,n,n+1]));}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g.toNonIndexed();
}
let muscleTexture:THREE.CanvasTexture|undefined;
function fibers(){
 if(typeof document==='undefined')return null;
 if(muscleTexture)return muscleTexture;
 const c=document.createElement('canvas');c.width=256;c.height=512;const ctx=c.getContext('2d')!;
 ctx.fillStyle='#b7a098';ctx.fillRect(0,0,256,512);
 for(let i=0;i<110;i++){const x=(i*47.319)%256;ctx.strokeStyle=i%3?'#c8b5a8':'#958076';ctx.lineWidth=.5+(i%4)*.3;ctx.beginPath();ctx.moveTo(x,0);ctx.bezierCurveTo(x+8,170,x-8,360,x+3,512);ctx.stroke();}
 muscleTexture=new THREE.CanvasTexture(c);muscleTexture.colorSpace=THREE.SRGBColorSpace;return muscleTexture;
}
export function materialFor(part:Part){return new THREE.MeshStandardMaterial({color:palette[part.type],roughness:part.type==='bone'?.72:.57,metalness:0,transparent:part.type==='fascia'||part.type==='joint',opacity:part.type==='fascia'?.12:part.type==='joint'?.38:1,side:THREE.DoubleSide,...(part.type==='muscle'?{map:fibers(),bumpMap:fibers(),bumpScale:.35}:{})});}
export function buildProceduralModel():THREE.Group {
 const root=new THREE.Group();root.name='right_lower_leg';
 for(const part of catalogue){
  const geometries=shapes[part.id].map(shapeGeometry);const g=mergeGeometries(geometries)!;geometries.forEach(g=>g.dispose());g.computeBoundingBox();
  const center=g.boundingBox!.getCenter(new THREE.Vector3());g.translate(-center.x,-center.y,-center.z);
  const mesh=new THREE.Mesh(g,materialFor(part));mesh.name=part.id;mesh.position.copy(center);mesh.userData={...part};root.add(mesh);
 }
 return root;
}
export function validateModel(root:THREE.Object3D):Map<string,THREE.Mesh> {
 const map=new Map<string,THREE.Mesh>();
 root.updateMatrixWorld(true);
 root.traverse(obj=>{if(!(obj instanceof THREE.Mesh))return;const id=obj.userData.id;const part=catalogue.find(p=>p.id===id);if(!part)throw new Error(`Unknown or missing mesh id: ${id??obj.name}`);if(map.has(id))throw new Error(`Duplicate mesh id: ${id}`);for(const key of ['displayName','type','compartment','laterality','group','parentGroup'] as const){if(obj.userData[key]!==part[key])throw new Error(`Invalid metadata ${key} for ${id}`);}map.set(id,obj);});
 const missing=catalogue.filter(p=>!map.has(p.id));if(missing.length)throw new Error(`Missing parts: ${missing.map(p=>p.id).join(', ')}`);
 return map;
}
export async function loadAtlasGLB(url:string):Promise<THREE.Group>{
 const draco=new DRACOLoader().setDecoderPath(`${import.meta.env.BASE_URL}draco/`);const loader=new GLTFLoader().setDRACOLoader(draco);
 try{
  const gltf=await loader.loadAsync(url);const source=validateModel(gltf.scene);const root=new THREE.Group();
  for(const [id,obj] of source){const g=obj.geometry.clone().applyMatrix4(obj.matrixWorld);g.computeBoundingBox();const center=g.boundingBox!.getCenter(new THREE.Vector3());g.translate(-center.x,-center.y,-center.z);const mesh=new THREE.Mesh(g,materialFor(catalogue.find(p=>p.id===id)!));mesh.position.copy(center);mesh.name=id;mesh.userData={...obj.userData};root.add(mesh);}
  disposeModel(gltf.scene);return root;
 }finally{draco.dispose();}
}
export function disposeModel(root:THREE.Object3D){root.traverse(obj=>{if(obj instanceof THREE.Mesh){obj.geometry.dispose();const materials=Array.isArray(obj.material)?obj.material:[obj.material];materials.forEach(m=>m.dispose());}});}
