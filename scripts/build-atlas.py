"""Run inside Blender. Import licensed Z-Anatomy, preserve surface regions, export one Draco GLB."""
import bpy, bmesh, json, math, os, hashlib
from pathlib import Path
from mathutils import Vector

ROOT = Path(os.environ.get('CRUS_ROOT', str(Path(__file__).resolve().parent.parent)))
SOURCE = ROOT / 'output/review/source/Z-Anatomy.blend'
source_info=json.loads((ROOT/'assets/source.json').read_text())
if hashlib.sha256(SOURCE.read_bytes()).hexdigest()!=source_info['sha256']:raise RuntimeError('Source checksum mismatch: review and pin the intended source before export')
metadata = {p['id']: p for p in json.loads((ROOT / 'output/review/catalogue.json').read_text(encoding='utf-8-sig'))}
# An optional second tuple entry selects existing source material regions, never guessed anatomy.
bindings = {
 'tibia':[('Tibia.r','all')], 'fibula':[('Fibula.r','all')], 'femur_distal':[('Femur.r','all')], 'patella':[('Patella.r','all')],
 'talus':[('Talus.r','all')], 'calcaneus':[('Calcaneus.r','all')], 'navicular':[('Navicular bone.r','all')],
 'medial_cuneiform':[('Medial cuneiform bone.r','all')], 'metatarsal_1':[('First metatarsal bone.r','all')], 'metatarsal_5':[('Fifth metatarsal bone.r','all')],
 'knee_joint':[('Medial meniscus.r','all'),('Lateral meniscus.r','all')],
 'tibfib_proximal':[('Articular capsule of superior tibiofibular joint.r','all')],
 'tibfib_distal':[('Anterior tibiofibular ligament.r','all'),('Posterior tibiofibular ligament.r','all')],
 'talocrural':[('Talus.r','upper_cartilage')], 'subtalar':[('Talus.r','lower_cartilage')], 'tibial_cartilage':[('Tibia.r','plateau_cartilage')],
 'tibialis_anterior':[('Tibialis anterior muscle.r','muscle')], 'ta_tendon':[('Tibialis anterior muscle.r','tendon')],
 'extensor_hallucis_longus':[('Extensor hallucis longus.r','all')],
 'extensor_digitorum_longus':[('Extensor digitorum longus.r','all'),('Tendon of extensor digitorum longus.r','all')],
 'fibularis_tertius':[('Fibularis tertius muscle.r','all')],
 'fibularis_longus':[('Fibularis longus muscle.r','muscle')], 'fl_tendon':[('Fibularis longus muscle.r','tendon')],
 'fibularis_brevis':[('Fibularis brevis muscle.r','muscle')], 'fb_tendon':[('Fibularis brevis muscle.r','tendon')],
 'gastrocnemius_medial':[('Medial head of gastrocnemius.r','all')], 'gastrocnemius_lateral':[('Lateral head of gastrocnemius.r','all')],
 'soleus':[('Soleus muscle.r','all')], 'plantaris':[('Plantaris muscle.r','all')], 'popliteus':[('Popliteus muscle.r','all')],
 'tibialis_posterior':[('Tibialis posterior muscle.r','muscle')], 'tp_tendon':[('Tibialis posterior muscle.r','tendon')],
 'flexor_digitorum_longus':[('Flexor digitorum longus.r','all')], 'flexor_hallucis_longus':[('Flexor hallucis longus.r','all')],
 'achilles':[('Calcaneal tendon.r','all')],
 'atfl':[('Anterior talofibular ligament.r','all')], 'cfl':[('Calcaneofibular ligament.r','all')], 'ptfl':[('Posterior talofibular ligament.r','all')],
 'deltoid':[('Tibionavicular ligament.r','all'),('Tibiocalcaneal ligament.r','all'),('Posterior tibiotalar ligament.r','all')],
 'syndesmosis':[('Anterior tibiofibular ligament.r','all'),('Posterior tibiofibular ligament.r','all'),('Transverse tibiofibular ligament.r','all')],
 'common_fibular_nerve':[('Common fibular nerve.r','all')], 'retrocalcaneal_bursa':[('Subtendinous calcaneal bursa.r','all')],
 'superior_fibular_retinaculum':[('Superior fibular retinaculum.r','all')],
 'cuboid':[('Cuboid bone.r','all')], 'intermediate_cuneiform':[('Intermediate cuneiform bone.r','all')], 'lateral_cuneiform':[('Lateral cuneiform bone.r','all')],
 'metatarsal_2':[('Second metatarsal bone.r','all')], 'metatarsal_3':[('Third metatarsal bone.r','all')], 'metatarsal_4':[('Fourth metatarsal bone.r','all')],
 'sesamoids':[('Sesamoid bones of foot.r','all')],
 'extensor_digitorum_brevis':[('Extensor digitorum brevis.r','all')], 'extensor_hallucis_brevis':[('Extensor hallucis brevis.r','all')],
 'abductor_hallucis':[('Abductor hallucis.r','all')], 'flexor_digitorum_brevis':[('Flexor digitorum brevis.r','all')],
 'foot_interossei':[('Dorsal interossei muscles of foot.r','all')], 'foot_lumbricals':[('Lumbrical muscles of foot.r','all')],
}
for toe, ordinal in enumerate(['first','second','third','fourth','fifth'],1):
 for segment in ['proximal','middle','distal']:
  if toe==1 and segment=='middle':continue
  bindings[f'toe_{toe}_{segment}']=[(f'{segment.title()} phalanx of {ordinal} finger of foot.r','all')]

work=bpy.data.scenes.get('CRUS_Workshop') or bpy.data.scenes.new('CRUS_Workshop')
bpy.context.window.scene=work
with bpy.data.libraries.load(str(SOURCE),link=False) as (src,dst):
 needed={name for sources in bindings.values() for name,_ in sources}
 missing=needed-set(src.objects)
 if missing:raise RuntimeError('Missing source anatomy: '+str(sorted(missing)))
 ordered=sorted(needed)
 dst.objects=ordered
source_objects=dict(zip(ordered,dst.objects))
for name in needed:
 obj=source_objects[name]
 while obj:
  if obj.name not in work.objects:work.collection.objects.link(obj)
  obj.hide_viewport=False
  obj=obj.parent
bpy.context.view_layer.update()
depsgraph=bpy.context.evaluated_depsgraph_get()
out=bpy.data.collections.get('CRUS_Export')
if out:
 for obj in list(out.objects):bpy.data.objects.remove(obj,do_unlink=True)
else:
 out=bpy.data.collections.new('CRUS_Export');work.collection.children.link(out)

palette={k:v.lstrip('#') for k,v in json.loads((ROOT/'src/tissue-palette.json').read_text()).items()}

def rgba(key):
 h=palette.get(key,'a54e40');v=[int(h[i:i+2],16)/255 for i in (0,2,4)]
 return tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in v)+(1,)
def transform(v):return Vector(((v.x+.075112879)*1000,(v.y-.035191711)*1000,v.z*1000))
white=bpy.data.materials.get('CRUS_Vertex_Surface') or bpy.data.materials.new('CRUS_Vertex_Surface')
white.use_nodes=True
nodes=white.node_tree.nodes;bsdf=nodes.get('Principled BSDF');bsdf.inputs['Base Color'].default_value=(1,1,1,1);bsdf.inputs['Roughness'].default_value=.65
for node in list(nodes):
 if node.type=='VERTEX_COLOR':nodes.remove(node)
vc=nodes.new('ShaderNodeVertexColor');vc.layer_name='Color';white.node_tree.links.new(vc.outputs['Color'],bsdf.inputs['Base Color'])
manifest={}
def finish(part_id,mesh,source_names):
 part=metadata[part_id]
 bm=bmesh.new();bm.from_mesh(mesh)
 bmesh.ops.delete(bm,geom=[v for v in bm.verts if not v.link_faces],context='VERTS')
 if part_id=='femur_distal':
  bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.0001,plane_co=(0,0,590),plane_no=(0,0,1),clear_outer=True)
  boundary=[e for e in bm.edges if e.is_boundary and all(abs(v.co.z-590)<.01 for v in e.verts)]
  if boundary:
   cap=bmesh.ops.holes_fill(bm,edges=boundary,sides=0);cl=bm.loops.layers.float_color.get('Color')
   if cl:
    for face in cap['faces']:
     for loop in face.loops:loop[cl]=rgba('bone')
 bm.to_mesh(mesh);bm.free();mesh.validate(verbose=False,clean_customdata=False);mesh.update()
 if not mesh.polygons:raise RuntimeError('No source faces for '+part_id)
 mesh.materials.clear();mesh.materials.append(white)
 for face in mesh.polygons:face.material_index=0;face.use_smooth=True
 obj=bpy.data.objects.new(part_id,mesh);out.objects.link(obj)
 for k,v in part.items():obj[k]=v
 obj['source']='Z-Anatomy / BodyParts3D';obj['sourceObjects']=source_names
 obj['representation']=part['provenance']['kind']
 xyz=[(v.co.x,v.co.z,-v.co.y) for v in mesh.vertices]
 manifest[part_id]={'sources':source_names,'provenance':part['provenance'],'vertices':len(mesh.vertices),'polygons':len(mesh.polygons),'min':[min(v[i] for v in xyz) for i in range(3)],'max':[max(v[i] for v in xyz) for i in range(3)]}
 return obj

for part_id,sources in bindings.items():
 vertices=[];faces=[];colors=[];part=metadata[part_id]
 for name,region in sources:
  original=source_objects[name];evaluated=original.evaluated_get(depsgraph)
  mesh=bpy.data.meshes.new_from_object(evaluated,depsgraph=depsgraph)
  offset=len(vertices);world=[original.matrix_world@v.co for v in mesh.vertices];vertices.extend([transform(v) for v in world])
  for poly in mesh.polygons:
   mat=mesh.materials[poly.material_index].name.lower() if len(mesh.materials)>poly.material_index and mesh.materials[poly.material_index] else ''
   tendon='tendon' in mat;cartilage='cartilage' in mat
   mean_z=sum(world[i].z for i in poly.vertices)/len(poly.vertices)
   if region=='muscle' and tendon:continue
   if region=='tendon' and not tendon:continue
   if 'cartilage' in region and not cartilage:continue
   if region=='plateau_cartilage' and mean_z<.35:continue
   if region=='upper_cartilage' and mean_z<.065:continue
   if region=='lower_cartilage' and mean_z>=.065:continue
   faces.append([offset+i for i in poly.vertices])
   tissue='tendon' if tendon else 'cartilage' if cartilage else part['type']
   colors.append(rgba(tissue))
  bpy.data.meshes.remove(mesh)
 mesh=bpy.data.meshes.new(part_id+'_geometry');mesh.from_pydata(vertices,[],faces)
 attribute=mesh.color_attributes.new(name='Color',type='FLOAT_COLOR',domain='CORNER')
 for face,color in zip(mesh.polygons,colors):
  for loop in face.loop_indices:attribute.data[loop].color=color
 finish(part_id,mesh,[n for n,_ in sources])

# Immutable accepted envelopes: tendon partitioning must not redefine compartments.
for part_id,data in json.loads((ROOT/'assets/compartment-baseline.json').read_text()).items():
 mesh=bpy.data.meshes.new(part_id+'_geometry');mesh.from_pydata(data['vertices'],[],data['faces'])
 attr=mesh.color_attributes.new(name='Color',type='FLOAT_COLOR',domain='CORNER')
 for value in attr.data:value.color=rgba('fascia')
 finish(part_id,mesh,['accepted pre-partition compartment envelope'])

if set(manifest)!=set(metadata):raise RuntimeError('Catalogue/export mismatch '+str(set(metadata)-set(manifest)))
for obj in work.objects:obj.select_set(False)
for obj in out.objects:obj.select_set(True);obj.hide_set(False);obj.hide_render=False
bpy.context.view_layer.objects.active=next(iter(out.objects))
target=ROOT/'public/models/right-lower-leg.glb';target.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(target),export_format='GLB',use_selection=True,export_extras=True,export_yup=True,export_apply=True,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6,export_draco_position_quantization=16,export_draco_normal_quantization=10,export_draco_color_quantization=10,export_materials='EXPORT',export_animations=False,export_cameras=False,export_lights=False)
(ROOT/'public/models/manifest.json').write_text(json.dumps({'source':'Z-Anatomy','sourcePin':source_info,'license':'CC BY-SA 4.0','coordinates':'+X medial, +Y proximal, +Z anterior; millimetres','parts':manifest},indent=2))
print(json.dumps({'exported':str(target),'bytes':target.stat().st_size,'parts':len(manifest),'polygons':sum(p['polygons'] for p in manifest.values())}))
