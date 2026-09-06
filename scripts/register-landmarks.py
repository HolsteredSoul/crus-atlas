"""Spatially place illustrative regions on the exported source; not clinical validation."""
import bpy,json
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
root=Path('C:/DEV/Leg')
cards=json.loads((root/'output/review/conditions.json').read_text(encoding='utf-8-sig'))
objects={o.name:o for o in bpy.data.collections['CRUS_Export'].objects}
points={k:[Vector((v.co.x,v.co.z,-v.co.y)) for v in o.data.vertices] for k,o in objects.items()}
trees={}
def nearest(part,point):
 if part not in trees:trees[part]=BVHTree.FromPolygons(points[part],[list(p.vertices) for p in objects[part].data.polygons])
 return list(trees[part].find_nearest(Vector(point))[0])
def center(part):
 v=points[part];return [(min(p[i] for p in v)+max(p[i] for p in v))/2 for i in range(3)]
def cross_section(part,y):
 vertices=points[part];chosen=sorted(vertices,key=lambda v:abs(v.y-y))[:max(8,len(vertices)//50)]
 c=sum(chosen,Vector())/len(chosen);return list(c)
insertion=min(p.y for p in points['achilles'])
anchors={
 'achilles_mid':[cross_section('achilles',insertion+40)],
 'achilles_rupture':[cross_section('achilles',insertion+40)],
 'achilles_insertion':[cross_section('achilles',insertion+7),center('retrocalcaneal_bursa'),nearest('calcaneus',[0,59,-45])],
 'pttd':[nearest('tp_tendon',[23,73,-12])],
 'peroneal':[nearest('fl_tendon',[-32,75,-23]),nearest('fb_tendon',[-32,75,-21])],
 'tennis_leg':[nearest('gastrocnemius_medial',[20,285,-59]),nearest('soleus',[15,270,-35])],
 'soleus_strain':[nearest('soleus',[0,255,-40])],
 'cecs_anterior':[center('anterior_compartment')],
 'cecs_deep':[center('deep_posterior_compartment')],
 'lateral_sprain':[center('atfl'),center('cfl')],
 'high_sprain':[center('syndesmosis')],
 'mtss':[nearest('tibia',[22,193,-6])],
 'stress_fracture':[nearest('tibia',[0,225,16])],
 'fibular_neck':[nearest('common_fibular_nerve',[-43,396,-12])],
}
result={}
for card in cards:
 markers=card['markers']
 for index,marker in enumerate(markers):
  marker['position']=[round(n,3) for n in anchors[card['id']][index]]
  if card['id']=='achilles_mid':marker['scale']=[8,20,7]
  if card['id']=='achilles_rupture':marker['scale']=[10,6,9]
  if card['id']=='pttd':marker['scale']=[7,16,7]
  if card['id']=='peroneal':marker['scale']=[5,15,5]
 result[card['id']]=markers
(root/'src/landmarks.json').write_text(json.dumps(result,indent=2))
print(json.dumps({'registered_cards':len(result),'achilles_insertion_y':insertion,'midportion_marker':result['achilles_mid'][0]['position']}))
