"""Save compact editable libraries; never save the downloaded whole-body workshop.
Run after build-atlas.py (and optionally inspect-ligament-candidates.py).
"""
import bpy, os, json
from pathlib import Path
root=Path(os.environ.get('CRUS_ROOT',str(Path(__file__).resolve().parent.parent)))
metadata={p['id']:p for p in json.loads((root/'output/review/catalogue.json').read_text(encoding='utf-8-sig'))}
for source,relative in [('CRUS_Export','assets/generated/crus-atlas.blend'),('CRUS_Candidates','assets/review/ligament-candidates.blend')]:
 if source not in bpy.data.collections:continue
 # Collection-only libraries avoid a Blender 5.2 scene-copy crash in libraries.write.
 library=bpy.data.collections.new('Crus atlas' if source=='CRUS_Export' else 'Unaccepted ligament candidates')
 library['coordinates']='Blender Z proximal, -Y anterior, X medial; numeric millimetres; use scene unit scale .001'
 library['license']='Z-Anatomy derivative CC BY-SA 4.0; see repository attribution'
 groups={}
 for original in bpy.data.collections[source].objects:
  part=metadata.get(original.get('id'),{})
  group='Review only' if original.get('candidate') or part.get('defaultHidden') else 'Illustrative envelopes' if original.get('id','').endswith('_compartment') else 'Source anatomy'
  if group not in groups:
   groups[group]=bpy.data.collections.new(group);library.children.link(groups[group])
  obj=original.copy();groups[group].objects.link(obj)
  obj.hide_viewport=part.get('defaultHidden',part.get('type') in ['fascia','joint','sheath'] or part.get('id')=='tibial_cartilage');obj.hide_render=obj.hide_viewport
 target=root/relative;target.parent.mkdir(parents=True,exist_ok=True)
 bpy.data.libraries.write(str(target),{library},path_remap='RELATIVE',fake_user=True,compress=True)
 print(str(target),target.stat().st_size)
 for obj in list(library.all_objects):bpy.data.objects.remove(obj,do_unlink=True)
 for collection in groups.values():bpy.data.collections.remove(collection)
 bpy.data.collections.remove(library)
