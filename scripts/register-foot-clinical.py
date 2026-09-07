"""Register the six foot teaching regions against the accepted Blender collection.
No anatomical geometry is edited. Existing clinical registrations are preserved.
Run: blender -b --python scripts/register-foot-clinical.py
"""
import bpy, json, hashlib
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
ROOT=Path(__file__).resolve().parent.parent
with bpy.data.libraries.load(str(ROOT/'assets/generated/crus-atlas.blend'),link=False) as (source,target):
 target.collections=['Crus atlas']
objects={o.get('id'):o for o in target.collections[0].all_objects}
# Atlas coordinates: X medial, Y proximal, Z anterior, mm.
# Surface targets are reviewed anatomical regions, projected onto actual source faces.
# Calcaneal stress is intentionally intrabony, not a skin/palpation marker.
specs={
 'plantar_fasciopathy':('plantar_aponeurosis',[8,16,-30],[9,5,13],'tendinopathy','surface'),
 'fhl_tenosynovitis':('fhl_sheath',[10,68,-24],[6,12,6],'fluid','surface'),
 'navicular_stress':('navicular',[0,75,29],[7,5,6],'stress','surface'),
 'metatarsal_stress':('metatarsal_2',[-15,50,86],[6,6,12],'stress','surface'),
 'calcaneal_stress':('calcaneus',[-5,32,-32],[13,12,13],'stress','internal'),
 'talar_osteochondral':('talus',[10,85,-7],[8,4,8],'stress','surface'),
}
landmarks=json.loads((ROOT/'src/landmarks.json').read_text())
audit={'glbSha256':hashlib.sha256((ROOT/'public/models/right-lower-leg.glb').read_bytes()).hexdigest(),'coordinates':'+X medial, +Y proximal, +Z anterior; mm','regions':{}}
for id,(part,seed,scale,kind,method) in specs.items():
 o=objects[part];points=[Vector((v.co.x,v.co.z,-v.co.y)) for v in o.data.vertices]
 tree=BVHTree.FromPolygons(points,[list(p.vertices) for p in o.data.polygons])
 position,normal,face,distance=tree.find_nearest(Vector(seed))
 if method=='internal':position=Vector(seed)
 pos=[round(x,3) for x in position]
 landmarks[id]=[{'partId':part,'position':pos,'scale':scale,'kind':kind}]
 audit['regions'][id]={'partId':part,'target':seed,'position':pos,'method':method,'nearestSourceFace':face,'targetDistanceMm':round(distance,4),'note':'Illustrative site; geometry registration is not clinical validation.'}
(ROOT/'src/landmarks.json').write_text(json.dumps(landmarks,indent=2)+'\n')
(ROOT/'assets/review/foot-clinical-registration.json').write_text(json.dumps(audit,indent=2)+'\n')
print(json.dumps(audit,indent=2))
