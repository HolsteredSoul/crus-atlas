import { Vector3 } from 'three';
import type { Compartment, PartType } from './catalogue';
export type ExplodeMode='compartment'|'hierarchical'|'inventory';
export interface LayoutItem {id:string;center:Vector3;size:Vector3;type:PartType;compartment:Compartment;}
const normals:Partial<Record<Compartment,[number,number,number]>>={anterior:[0,0,1],lateral:[-1,0,0],superficial_posterior:[0,0,-1],deep_posterior:[.8,0,-.6],ankle:[1,0,0],neurovascular:[-1,0,0]};
export function explodeOffsets(items:LayoutItem[],mode:ExplodeMode):Map<string,Vector3>{
 const offsets=new Map<string,Vector3>();
 if(mode==='inventory'){
  // Uniform cells derived from actual bounding boxes guarantee no overlap at amount=1.
  const columns=Math.ceil(Math.sqrt(items.length*1.5));
  const width=Math.max(60,...items.map(p=>p.size.x))+45;
  const height=Math.max(80,...items.map(p=>p.size.y))+45;
  const rows=Math.ceil(items.length/columns);
  items.forEach((p,i)=>{const target=new Vector3((i%columns-(columns-1)/2)*width,300+((rows-1)/2-Math.floor(i/columns))*height,0);offsets.set(p.id,target.sub(p.center));});
  return offsets;
 }
 const pivot=new Vector3(0,285,0);
 for(const item of items){
  const fixed=['bone','cartilage','joint'].includes(item.type);
  if(fixed){offsets.set(item.id,new Vector3());continue;}
  const radial=item.center.clone().sub(pivot);radial.y=0;
  const normal=new Vector3(...(normals[item.compartment]??[0,0,0]));
  const weight=item.type==='tendon'||item.type==='ligament'||item.type==='sheath'?.45:1;
  if(mode==='compartment')offsets.set(item.id,normal.multiplyScalar(115));
  else offsets.set(item.id,radial.multiplyScalar(1.8*weight).addScaledVector(normal,75*weight));
 }
 return offsets;
}
