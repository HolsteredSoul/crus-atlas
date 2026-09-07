"""Read serialized Blender libraries back and verify membership and hidden layers."""
import bpy, json, os
from pathlib import Path
root=Path(os.environ.get('CRUS_ROOT',str(Path(__file__).resolve().parent.parent)))
parts=json.loads((root/'output/review/catalogue.json').read_text(encoding='utf-8-sig'))
for relative,name in [('assets/generated/crus-atlas.blend','Crus atlas'),('assets/review/ligament-candidates.blend','Unaccepted ligament candidates')]:
 with bpy.data.libraries.load(str(root/relative),link=False) as (src,dst):
  assert name in src.collections,(relative,src.collections)
  dst.collections=[name]
 objects=list(dst.collections[0].all_objects);ids={o.get('id') for o in objects}
 assert len(ids)==len(objects),'Duplicate IDs in editable library'
 if name=='Crus atlas':
  assert ids=={p['id'] for p in parts}
  for obj in objects:
   assert len(obj.data.polygons)>0 and 'Color' in obj.data.color_attributes
   part=next(p for p in parts if p['id']==obj['id'])
   hidden=part.get('defaultHidden',part['type'] in ['fascia','joint','sheath'] or part['id']=='tibial_cartilage')
   assert obj.hide_viewport==hidden,(obj['id'],'visibility mismatch')
 else:assert ids=={'candidate_spring','tibia','fibula','talus','calcaneus','navicular','deltoid','syndesmosis','interosseous_membrane'}
 print('Verified editable library:',relative,len(objects),'objects')
