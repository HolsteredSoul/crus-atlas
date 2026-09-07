"""Render exported geometry in an isolated Blender scene without changing upstream objects.
Run after build-atlas.py. Optional globals: REVIEW_IDS, REVIEW_VIEW, REVIEW_LABEL.
"""
import bpy, bmesh, math, os, json
from pathlib import Path
from mathutils import Vector

root=Path(os.environ.get('CRUS_ROOT',str(Path(__file__).resolve().parent.parent)))
selected=set(globals().get('REVIEW_IDS',[]))
view=globals().get('REVIEW_VIEW','full')
label=globals().get('REVIEW_LABEL','model')
slice_y=globals().get('REVIEW_SLICE',250)
palette=json.loads((root/'src/tissue-palette.json').read_text())
previous=bpy.context.window.scene
scene=bpy.data.scenes.new('CRUS_Review')
scene.render.engine='CYCLES';scene.cycles.samples=16
scene.render.resolution_x=640;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('CRUS_ReviewWorld');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.08,.11,.12,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
scene.view_settings.view_transform='AgX'
for original in bpy.data.collections['CRUS_Export'].objects:
 if selected and original['id'] not in selected:continue
 if not selected and original['type'] in ['fascia','joint','sheath']:continue
 obj=original.copy();scene.collection.objects.link(obj);obj.hide_render=False
 if view=='section':
  obj.data=original.data.copy();bm=bmesh.new();bm.from_mesh(obj.data)
  for height,normal in [(slice_y+3,1),(slice_y-3,-1)]:
   bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.0001,plane_co=(0,0,height),plane_no=(0,0,normal),clear_outer=True)
  # Review-only planar caps make closed muscle/bone sections readable.
  # Open fascial sheets remain open; exported source geometry is untouched.
  if original['type'] in ['bone','muscle']:
   bmesh.ops.holes_fill(bm,edges=[e for e in bm.edges if e.is_boundary],sides=0)
   bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
  bm.to_mesh(obj.data);bm.free()
  colour=palette[original['type']].lstrip('#')
  mat=bpy.data.materials.new('Review section');mat.diffuse_color=tuple((int(colour[i:i+2],16)/255)**2.2 for i in (0,2,4))+(1,)
  mat.use_nodes=True;mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=mat.diffuse_color
  obj.data.materials.clear();obj.data.materials.append(mat)
  for face in obj.data.polygons:face.use_smooth=False;face.material_index=0
def point(xyz):return Vector((xyz[0],-xyz[2],xyz[1]))
target=point((0,slice_y,0) if view=='section' else (0,285,0) if view=='full' else (-20,55,90))
direction=point((0,600,1) if view=='section' else (-540,145,1080) if view=='full' else (-30,-600,90) if view=='sole' else (-220,230,420))
camera=bpy.data.objects.new('Review camera',bpy.data.cameras.new('Review camera'));scene.collection.objects.link(camera)
camera.location=target+direction;camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO';camera.data.ortho_scale=160 if view=='section' else 700 if view=='full' else 360;camera.data.clip_end=10000;scene.camera=camera
for index,(position,energy) in enumerate([((-300,500,400),2.2),((250,250,-400),1.2),((0,-450,150),1.4)]):
 light=bpy.data.objects.new('Review light',bpy.data.lights.new('Review light','SUN'));scene.collection.objects.link(light)
 light.data.energy=energy;light.data.angle=math.radians(12);light.location=point(position)
 light.rotation_euler=(target-light.location).to_track_quat('-Z','Y').to_euler()
destination=root/'docs/reviews/images'/f'blender-{label}-{view}.png';destination.parent.mkdir(parents=True,exist_ok=True)
scene.render.filepath=str(destination)
try:
 bpy.context.window.scene=scene;bpy.ops.render.render(write_still=True,scene=scene.name)
finally:
 bpy.context.window.scene=previous
 for obj in list(scene.objects):bpy.data.objects.remove(obj,do_unlink=True)
 world=scene.world;bpy.data.scenes.remove(scene);bpy.data.worlds.remove(world)
print(str(destination))
