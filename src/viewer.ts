import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import gsap from 'gsap';
import { disposeModel, loadAtlasGLB } from './model';
import { byId, partOpacity, hiddenByDefault, type Part } from './catalogue';
import { overlayColors, type Condition } from './conditions';
import { explodeOffsets, type ExplodeMode, type LayoutItem } from './layout';

export const presets=['Anterior','Posterior','Medial','Lateral','Knee plateau','Ankle mortise','Foot','Sole'] as const;
export type Preset=typeof presets[number]|'Reset';
interface Piece {mesh:THREE.Mesh<THREE.BufferGeometry,THREE.MeshStandardMaterial>;base:THREE.Vector3;size:THREE.Vector3;part:Part;}
export class AtlasViewer {
 readonly scene=new THREE.Scene(); readonly camera=new THREE.PerspectiveCamera(34,1,1,16000);
 readonly renderer:THREE.WebGLRenderer; readonly controls:OrbitControls; readonly composer:EffectComposer;readonly outline:OutlinePass;
 readonly pieces=new Map<string,Piece>();hidden=new Set<string>();selected:string|null=null;isolated:Set<string>|null=null;fade=false;xray=false;
 explodeAmount=0;explodeMode:ExplodeMode='compartment';condition:Condition|null=null;
 private conditionRevealed=new Set<string>();
 private ground=new THREE.Group();private root=new THREE.Group();private overlays=new THREE.Group();private leaders=new THREE.Group();
 private raycaster=new THREE.Raycaster();private pointer=new THREE.Vector2();private down={x:0,y:0};private raf=0;
 private observer:ResizeObserver;private plane=new THREE.Plane(new THREE.Vector3(0,-1,0),600);private cutEnabled=false;
 private label:HTMLDivElement;private dead=false;private dirty=true;private lastFrame=0;private reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 onSelect:(id:string|null)=>void=()=>{};onStatus:(message:string)=>void=()=>{};onModel:()=>void=()=>{};
 constructor(private host:HTMLElement){
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.0;this.renderer.localClippingEnabled=true;
  this.renderer.domElement.setAttribute('aria-label','Interactive 3D right lower leg. Use the structure tree for keyboard selection.');this.renderer.domElement.tabIndex=0;
  host.prepend(this.renderer.domElement);
  this.scene.add(new THREE.HemisphereLight(0xd3e4ea,0x28302a,1.5));
  const key=new THREE.DirectionalLight(0xffeee2,2.1);key.position.set(-180,480,370);this.scene.add(key);
  const fill=new THREE.DirectionalLight(0x9ac9ce,1.6);fill.position.set(230,320,-350);this.scene.add(fill);
  const side=new THREE.DirectionalLight(0xffd1a9,.65);side.position.set(-250,120,-100);this.scene.add(side);
  const grid=new THREE.GridHelper(1000,40,0x344245,0x253034);grid.position.y=-3;const gm=grid.material as THREE.Material;gm.transparent=true;gm.opacity=.27;this.ground.add(grid);
  const circle=new THREE.Mesh(new THREE.RingGeometry(85,86,96),new THREE.MeshBasicMaterial({color:0x5b7476,transparent:true,opacity:.35,side:THREE.DoubleSide}));circle.rotation.x=-Math.PI/2;circle.position.y=-1;this.ground.add(circle);this.scene.add(this.ground);
  const plantarFill=new THREE.DirectionalLight(0xe2eeee,1.5);plantarFill.position.set(0,-350,120);this.scene.add(plantarFill);
  this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.dampingFactor=.075;this.controls.minPolarAngle=.12;this.controls.maxPolarAngle=Math.PI-.12;this.controls.minDistance=65;this.controls.maxDistance=9000;this.controls.target.set(0,285,0);
  this.controls.addEventListener('change',()=>this.dirty=true);this.controls.addEventListener('start',()=>{gsap.killTweensOf(this.camera.position);gsap.killTweensOf(this.controls.target);});
  this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.scene,this.camera));
  this.outline=new OutlinePass(new THREE.Vector2(1,1),this.scene,this.camera);this.outline.edgeStrength=3;this.outline.edgeGlow=.3;this.outline.edgeThickness=1.5;this.outline.visibleEdgeColor.set('#92f1dd');this.outline.hiddenEdgeColor.set('#376960');this.composer.addPass(this.outline);this.composer.addPass(new OutputPass());
  this.scene.add(this.overlays,this.leaders);this.preset('Reset',false);
  this.label=document.createElement('div');this.label.className='model-label';host.append(this.label);
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();
  const canvas=this.renderer.domElement;
  canvas.addEventListener('pointerdown',e=>this.down={x:e.clientX,y:e.clientY});
  canvas.addEventListener('pointerup',e=>{if(e.button!==0||Math.hypot(e.clientX-this.down.x,e.clientY-this.down.y)>5)return;this.onSelect(this.hit(e));});
  canvas.addEventListener('dblclick',e=>{const id=this.hit(e);if(id){this.onSelect(id);this.focus(id);}});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.onStatus('Graphics context lost. Reload the page to restore the atlas.');});
  this.tick();
 }
 private replace(root:THREE.Group){
  this.scene.remove(this.root);disposeModel(this.root);this.root=root;this.scene.add(root);this.pieces.clear();
  root.traverse(obj=>{if(obj instanceof THREE.Mesh){const mesh=obj as Piece['mesh'];mesh.geometry.computeBoundingBox();this.pieces.set(mesh.userData.id,{mesh,base:mesh.position.clone(),size:mesh.geometry.boundingBox!.getSize(new THREE.Vector3()),part:byId.get(mesh.userData.id)!});}});
  this.hidden=new Set([...this.pieces.values()].filter(p=>hiddenByDefault(p.part)).map(p=>p.part.id));this.apply();
 }
 async load(url:string){try{const root=await loadAtlasGLB(url);if(this.dead){disposeModel(root);return;}this.clearGroup(this.overlays);this.clearGroup(this.leaders);this.condition=null;this.conditionRevealed.clear();this.explodeAmount=0;this.selected=null;this.isolated=null;this.replace(root);this.preset('Reset');this.onModel();this.onStatus('Z-Anatomy model loaded');}catch(error){this.onStatus(`Model unavailable: ${error instanceof Error?error.message:'could not load the anatomical GLB'}`);}}
 private resize(){const {width,height}=this.host.getBoundingClientRect();if(width<1||height<1)return;this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.renderer.setSize(width,height);this.composer.setSize(width,height);this.dirty=true;}
 private hit(event:PointerEvent|MouseEvent){const r=this.renderer.domElement.getBoundingClientRect();this.pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);
  const selectable=[...this.pieces.values()].filter(p=>p.mesh.visible&&p.mesh.material.opacity>.15).map(p=>p.mesh);
  return this.raycaster.intersectObjects(selectable,false).find(hit=>!this.cutEnabled||this.plane.distanceToPoint(hit.point)>=0)?.object.userData.id??null;
 }
 select(id:string|null){this.selected=id;this.apply();}
 apply(){
  for(const [id,p] of this.pieces){const context=this.isolated?this.isolated.has(id):this.condition?this.condition.parts.includes(id):id===this.selected;
   p.mesh.visible=!this.hidden.has(id)&&(!this.isolated||this.fade||context);
   const dim=(this.fade&&(!!this.selected||!!this.isolated)||!!this.condition)&&!context;
   const opacity=dim?.1:this.xray&&p.part.type==='bone'?.16:this.condition?.transparentParts?.includes(id)?.24:partOpacity(p.part);
   const mat=p.mesh.material;mat.opacity=opacity;mat.transparent=opacity<1;mat.depthWrite=opacity===1;mat.emissive.set(id===this.selected?'#56d4be':'#000000');mat.emissiveIntensity=id===this.selected?.23:0;
   mat.clippingPlanes=this.cutEnabled?[this.plane]:[];mat.needsUpdate=true;
   for(const child of p.mesh.children)if(child instanceof THREE.LineSegments){const edge=child.material as THREE.LineBasicMaterial;edge.opacity=dim?.07:.28;edge.clippingPlanes=mat.clippingPlanes;edge.needsUpdate=true;}
  }
  const mesh=this.selected?this.pieces.get(this.selected)?.mesh:null;this.outline.selectedObjects=mesh?.visible&&!this.cutEnabled?[mesh]:[];this.dirty=true;
 }
 toggle(ids:string[]){const show=ids.some(id=>this.hidden.has(id));ids.forEach(id=>{this.conditionRevealed.delete(id);show?this.hidden.delete(id):this.hidden.add(id);});this.apply();if(this.explodeAmount>0)this.explode(this.explodeAmount,this.explodeMode);}
 isolate(ids:string[],fade=false){this.isolated=new Set(ids);this.fade=fade;ids.forEach(id=>{this.conditionRevealed.delete(id);this.hidden.delete(id);});this.apply();}
 restore(){this.conditionRevealed.clear();this.hidden=new Set([...this.pieces.values()].filter(p=>hiddenByDefault(p.part)).map(p=>p.part.id));this.isolated=null;this.fade=false;this.xray=false;this.showCondition(null);this.apply();}
 setClip(enabled:boolean,height=300){this.cutEnabled=enabled;this.plane.constant=height;this.apply();this.overlays.traverse(o=>{if(o instanceof THREE.Mesh){o.material.clippingPlanes=enabled?[this.plane]:[];o.material.needsUpdate=true;}});}
 private travel(target:THREE.Vector3,position:THREE.Vector3,animate=true){const duration=animate&&!this.reduced?.75:0;gsap.to(this.controls.target,{x:target.x,y:target.y,z:target.z,duration,ease:'power2.inOut',overwrite:true,onUpdate:()=>this.dirty=true});gsap.to(this.camera.position,{x:position.x,y:position.y,z:position.z,duration,ease:'power2.inOut',overwrite:true,onUpdate:()=>this.dirty=true});this.dirty=true;}
 preset(name:Preset,animate=true){
  const footView=name==='Foot'||name==='Sole';
  const target=new THREE.Vector3(footView?-20:0,name==='Knee plateau'?425:name==='Ankle mortise'?75:footView?55:285,name==='Sole'?80:footView?100:0);
  const directions:Record<Preset,THREE.Vector3>={Anterior:new THREE.Vector3(0,70,1050),Posterior:new THREE.Vector3(0,70,-1050),Medial:new THREE.Vector3(1050,70,0),Lateral:new THREE.Vector3(-1050,70,0),'Knee plateau':new THREE.Vector3(0,230,180),'Ankle mortise':new THREE.Vector3(-60,50,330),Foot:new THREE.Vector3(-220,230,420),Sole:new THREE.Vector3(-30,-600,90),Reset:new THREE.Vector3(-540,145,1080)};
  const direction=directions[name].clone();if(['Anterior','Posterior','Medial','Lateral','Reset'].includes(name)){const fit=Math.max(1, .85/this.camera.aspect);direction.multiplyScalar(fit);}
  this.travel(target,target.clone().add(direction),animate);
 }
 focus(id?:string){
  const box=new THREE.Box3();if(id){const p=this.pieces.get(id);if(!p)return;this.hidden.delete(id);this.apply();box.setFromObject(p.mesh);}else for(const p of this.pieces.values())if(p.mesh.visible)box.union(new THREE.Box3().setFromObject(p.mesh));
  if(box.isEmpty())return;const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());const dist=Math.max(size.y,size.x/this.camera.aspect,size.z)*.65/Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2));
  const direction=this.camera.position.clone().sub(this.controls.target).normalize();this.travel(center,center.clone().addScaledVector(direction,Math.max(100,dist)));
 }
 focusCondition(condition:Condition|null=this.condition){
  if(!condition)return;
  const box=new THREE.Box3();
  for(const marker of condition.markers){
   const p=this.pieces.get(marker.partId);if(!p)continue;
   const offset=this.explodeAmount>0?p.mesh.position.clone().sub(p.base):new THREE.Vector3();
   if(marker.kind==='pressure'||marker.kind==='sprain')box.union(new THREE.Box3().setFromCenterAndSize(p.base.clone().add(offset),p.size));
   else box.union(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(...marker.position).add(offset),new THREE.Vector3(...marker.scale).multiplyScalar(2)));
  }
  if(box.isEmpty())return;
  // Include surrounding landmarks while focusing the lesion, not an entire long tendon.
  box.expandByScalar(35);
  const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
  const distance=Math.max(size.y,size.x/this.camera.aspect,size.z)*.65/Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2));
  const direction=this.camera.position.clone().sub(this.controls.target).normalize();
  this.travel(center,center.clone().addScaledVector(direction,Math.max(180,distance)));
 }
 explode(amount:number,mode:ExplodeMode){
  this.explodeAmount=amount;this.explodeMode=mode;const items:LayoutItem[]=[...this.pieces.values()].filter(p=>p.mesh.visible).map(p=>({id:p.part.id,center:p.base,size:p.size,type:p.part.type,compartment:p.part.compartment}));
  const offsets=explodeOffsets(items,mode);this.clearGroup(this.leaders);
  for(const [id,p] of this.pieces){const offset=offsets.get(id)??new THREE.Vector3();const target=p.base.clone().addScaledVector(offset,amount);gsap.to(p.mesh.position,{x:target.x,y:target.y,z:target.z,duration:this.reduced?0:.35,ease:'power2.out',overwrite:true,onUpdate:()=>this.dirty=true});
   if(amount>0&&p.mesh.visible&&offset.lengthSq()>0){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([p.base,p.mesh.position]),new THREE.LineBasicMaterial({color:0x76928d,transparent:true,opacity:.3}));line.userData.partId=id;line.frustumCulled=false;this.leaders.add(line);}
  }
 }
 private clearGroup(group:THREE.Group){group.children.forEach(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line){o.geometry.dispose();(o.material as THREE.Material).dispose();}});group.clear();}
 showCondition(condition:Condition|null){
  for(const id of this.conditionRevealed)this.hidden.add(id);
  this.conditionRevealed.clear();
  this.condition=condition;this.clearGroup(this.overlays);
  if(condition){this.isolated=null;condition.parts.forEach(id=>{if(this.hidden.has(id))this.conditionRevealed.add(id);this.hidden.delete(id);});
   for(const marker of condition.markers){
    let geometry:THREE.BufferGeometry;
    const sourcePiece=this.pieces.get(marker.partId);
    const surface=!!sourcePiece&&(marker.kind==='pressure'||marker.kind==='sprain');
    if(surface){geometry=sourcePiece!.mesh.geometry.clone();}else if(marker.kind==='rupture'){geometry=new THREE.TorusGeometry(1,.18,8,48);geometry.rotateX(Math.PI/2);}else if(marker.kind==='partial'&&condition.id==='peroneal'){geometry=new THREE.TorusGeometry(1,.18,8,48);geometry.scale(.4,1,1);}else geometry=new THREE.SphereGeometry(1,24,16);
    const material=new THREE.MeshBasicMaterial({color:overlayColors[marker.kind],transparent:true,opacity:marker.kind==='pressure'?.22:marker.kind==='fluid'?.6:.75,depthWrite:false,side:THREE.DoubleSide,polygonOffset:surface,polygonOffsetFactor:-1,polygonOffsetUnits:-1,clippingPlanes:this.cutEnabled?[this.plane]:[]});
    const base=surface?sourcePiece!.base.clone():new THREE.Vector3(...marker.position);
    const mesh=new THREE.Mesh(geometry,material);mesh.position.copy(base);if(!surface)mesh.scale.set(...marker.scale);mesh.userData={partId:marker.partId,base};mesh.renderOrder=3;this.overlays.add(mesh);
   }
  }
  this.apply();
 }
 private tick=()=>{
  if(this.dead)return;this.raf=requestAnimationFrame(this.tick);if(document.hidden)return;
  this.controls.update();const moving=gsap.globalTimeline.isActive();if(!this.dirty&&!moving)return;
  this.ground.visible=this.camera.position.y>=0;
  this.root.updateMatrixWorld(true);
  for(const obj of this.overlays.children){const p=this.pieces.get(obj.userData.partId);if(p){obj.position.copy(obj.userData.base).add(p.mesh.position).sub(p.base);obj.visible=p.mesh.visible;}}
  for(const obj of this.leaders.children){const p=this.pieces.get(obj.userData.partId);if(p&&obj instanceof THREE.Line){const positions=obj.geometry.getAttribute('position') as THREE.BufferAttribute;positions.setXYZ(1,p.mesh.position.x,p.mesh.position.y,p.mesh.position.z);positions.needsUpdate=true;obj.visible=p.mesh.visible;}}
  if(this.label){const p=this.selected?this.pieces.get(this.selected):null;this.label.hidden=!p||!p.mesh.visible;if(p){const point=p.mesh.position.clone().project(this.camera);this.label.style.left=`${(point.x*.5+.5)*100}%`;this.label.style.top=`${(-point.y*.5+.5)*100}%`;this.label.textContent=p.part.displayName;this.label.hidden=!p.mesh.visible||point.z>1||point.z< -1;}}
  this.composer.render();this.dirty=moving;this.lastFrame=performance.now();
 };
 get stats(){return {parts:this.pieces.size,visible:[...this.pieces.values()].filter(p=>p.mesh.visible).length,triangles:this.renderer.info.render.triangles,lastFrame:this.lastFrame};}
 dispose(){this.dead=true;cancelAnimationFrame(this.raf);this.observer.disconnect();this.controls.dispose();gsap.killTweensOf(this.camera.position);gsap.killTweensOf(this.controls.target);this.pieces.forEach(p=>gsap.killTweensOf(p.mesh.position));disposeModel(this.scene);this.clearGroup(this.leaders);this.composer.dispose();this.renderer.dispose();this.label.remove();this.renderer.domElement.remove();}
}
