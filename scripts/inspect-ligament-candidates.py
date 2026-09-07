"""Inspect unaccepted spring-ligament source beside accepted anatomy; no atlas mutation.
Run after build-atlas.py. Candidate geometry is excluded from the GLB.
"""
import bpy, json, os, hashlib
from pathlib import Path
from mathutils import Vector
root=Path(os.environ.get('CRUS_ROOT',str(Path(__file__).resolve().parent.parent)))
source=root/'output/review/source/Z-Anatomy.blend'
pin=json.loads((root/'assets/source.json').read_text())
assert hashlib.sha256(source.read_bytes()).hexdigest()==pin['sha256']
work=bpy.data.scenes['CRUS_Workshop'];bpy.context.window.scene=work
collection=bpy.data.collections.get('CRUS_Candidates')
if collection:
 for obj in list(collection.objects):
  if obj.get('candidate'):bpy.data.objects.remove(obj,do_unlink=True)
  else:collection.objects.unlink(obj)
else:
 collection=bpy.data.collections.new('CRUS_Candidates');work.collection.children.link(collection)
for obj in bpy.data.collections['CRUS_Export'].objects:
 if obj['id'] in ['tibia','fibula','talus','calcaneus','navicular','deltoid','syndesmosis','interosseous_membrane']:
  collection.objects.link(obj)
name='Plantar calcaneonavicular ligament.r'
with bpy.data.libraries.load(str(source),link=False) as (src,dst):dst.objects=[name]
original=dst.objects[0];obj=original
while obj:
 if obj.name not in work.objects:work.collection.objects.link(obj)
 obj.hide_viewport=False;obj=obj.parent
bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get()
mesh=bpy.data.meshes.new_from_object(original.evaluated_get(deps),depsgraph=deps)
for vertex in mesh.vertices:
 v=original.matrix_world@vertex.co;vertex.co=Vector(((v.x+.075112879)*1000,(v.y-.035191711)*1000,v.z*1000))
obj=bpy.data.objects.new('candidate_spring',mesh);collection.objects.link(obj)
obj['id']='candidate_spring';obj['type']='ligament';obj['candidate']=True;obj['sourceObject']=name
mesh.materials.clear();mat=bpy.data.materials.new('Candidate spring orange');mat.use_nodes=True
mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.65,.20,.03,1)
mesh.materials.append(mat)
for poly in mesh.polygons:poly.material_index=0;poly.use_smooth=True
xyz=[(v.co.x,v.co.z,-v.co.y) for v in mesh.vertices]
record={'sourceObject':name,'status':'candidate only; not exported','vertices':len(mesh.vertices),'polygons':len(mesh.polygons),'min':[min(v[i] for v in xyz) for i in range(3)],'max':[max(v[i] for v in xyz) for i in range(3)],'reviewColour':'orange; not the accepted tissue palette'}
target=root/'docs/reviews/ligament-candidate.json';target.write_text(json.dumps(record,indent=2))
print(json.dumps(record))
