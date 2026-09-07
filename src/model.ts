import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { catalogue, palette, partOpacity, type Part } from './catalogue';

export function materialFor(part:Part,vertexColors=false){
 const opacity=partOpacity(part);
 const guide=part.id.endsWith('_compartment');
 return new THREE.MeshStandardMaterial({color:guide?'#91b0b4':vertexColors?'#ffffff':palette[part.colourTissue??part.type],vertexColors:vertexColors&&!guide,roughness:part.type==='bone'?.78:.72,metalness:0,transparent:opacity<1,opacity,depthWrite:opacity===1,side:THREE.DoubleSide});
}
export function validateModel(root:THREE.Object3D):Map<string,THREE.Mesh> {
 const map=new Map<string,THREE.Mesh>();root.updateMatrixWorld(true);
 root.traverse(obj=>{
  if(!(obj instanceof THREE.Mesh))return;
  const id=obj.userData.id;const part=catalogue.find(p=>p.id===id);
  if(!part)throw new Error(`Unknown or missing mesh id: ${id??obj.name}`);
  if(map.has(id))throw new Error(`Duplicate mesh id: ${id}`);
  for(const key of ['displayName','type','compartment','laterality','group','parentGroup'] as const)if(obj.userData[key]!==part[key])throw new Error(`Invalid metadata ${key} for ${id}`);
  if(obj.userData.provenance?.kind!==part.provenance?.kind||obj.userData.provenance?.source!==part.provenance?.source)throw new Error(`Invalid provenance for ${id}`);
  map.set(id,obj);
 });
 const missing=catalogue.filter(p=>!map.has(p.id));if(missing.length)throw new Error(`Missing parts: ${missing.map(p=>p.id).join(', ')}`);
 return map;
}
export async function loadAtlasGLB(url:string):Promise<THREE.Group>{
 const draco=new DRACOLoader().setDecoderPath(`${import.meta.env.BASE_URL}draco/`);
 const loader=new GLTFLoader().setDRACOLoader(draco);let original:THREE.Group|undefined;
 try{
  original=(await loader.loadAsync(url)).scene;const source=validateModel(original);const root=new THREE.Group();
  for(const [id,obj] of source){
   const g=obj.geometry.clone().applyMatrix4(obj.matrixWorld);g.computeBoundingBox();
   const center=g.boundingBox!.getCenter(new THREE.Vector3());g.translate(-center.x,-center.y,-center.z);
   const mesh=new THREE.Mesh(g,materialFor(catalogue.find(p=>p.id===id)!,!!g.getAttribute('color')));
   mesh.position.copy(center);mesh.name=id;mesh.userData={...obj.userData};
   if(id.endsWith('_compartment')){
    // Coarse guides stay schematic: restrained edges, not invented smooth anatomy.
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(g,28),new THREE.LineBasicMaterial({color:'#91b0b4',transparent:true,opacity:.28,depthWrite:false}));
    mesh.add(edges);
   }
   root.add(mesh);
  }
  return root;
 }finally{if(original)disposeModel(original);draco.dispose();}
}
export function disposeModel(root:THREE.Object3D){root.traverse(obj=>{if(obj instanceof THREE.Mesh||obj instanceof THREE.Line){obj.geometry.dispose();const materials=Array.isArray(obj.material)?obj.material:[obj.material];materials.forEach(m=>m.dispose());}});}
