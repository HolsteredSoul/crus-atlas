# Anatomical source review — 2026-09-06

User rejected the current procedural leg and foot as unusable. Screenshots are preserved unmodified in `output/review/rejected-full-leg.png` and `output/review/rejected-foot-detail.png`. No Sites version was saved or deployed. Source had already been pushed before the correction; that does not constitute deployment.

## Verified tools
Blender MCP connects to Blender 5.2.1 LTS. The native glTF exporter exposes Draco compression and custom-properties export. The original scene and Cube/Camera/Light are preserved. Imported right-leg source meshes live in the separate CRUS_Workshop scene; CRUS_Export holds the 74 mapped output objects.

## Preferred source
Official Z-Anatomy source: https://github.com/Z-Anatomy/Models-of-human-anatomy
Download: https://github.com/Z-Anatomy/Models-of-human-anatomy/raw/refs/heads/master/Z-Anatomy.zip
Downloaded ZIP: approximately 83 MB. Extracted `Startup.blend`: 306,838,281 bytes, retained under `output/review/source/Z-Anatomy.blend` (ignored developer source asset).

Inspected 7,184 source object names. Verified actual right-side mesh datablocks for tibia, fibula, talus, calcaneus, navicular, cuboid, all five metatarsals, tibialis anterior/posterior, soleus and ATFL/CFL/PTFL. Foot phalanges and additional calf muscles are present in the object-name inventory. Example base polygon counts: tibia 1,613; talus 1,325; calcaneus 1,432; soleus 6,774. The three inspected lateral ligament base meshes have one polygon each: inspect modifiers and evaluated appearance before claiming ligament fidelity. Names alone are not anatomical validation.

Z-Anatomy uses CC BY-SA 4.0 and requests Z-Anatomy plus upstream BodyParts3D attribution. Its public TODO still lists missing-structure work and final validation. Preserve asset licensing and do not describe the source as clinically validated.

## Fallback source
BodyParts3D official archive: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html
Offers 136 MB IS-A and 62 MB PART-OF OBJ archives, explicitly 99% polygon-reduced. Useful as an independent bone/muscle source, but separate ankle tendon/ligament coverage is incomplete in the reviewed name table.

Current official licence, updated 2025-02-27: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html — CC BY 4.0. Do not confuse that current direct-source licence with the historic upstream attribution in Z-Anatomy or with Z-Anatomy's own share-alike licence.

## Required replacement workflow
Import/select real right-leg and complete foot geometry in a separate Blender collection. Review full-limb and foot close-up renders before any web compression or integration. Inspect tendons and ligament modifiers, preserve actual attachments, crop the femur, map valid anatomical groups to stable catalogue IDs, register clinical markers to the source, then export one Draco GLB. Keep the working Three.js interface; do not attempt another tube/ellipsoid or unvalidated text-to-3D anatomy pass. Replacement is integrated: 74 named objects, 532,228-byte Draco GLB, 107,739 exported pre-triangulation polygons. Source modifiers were evaluated, tendon-material regions separated and tissue vertex colours preserved. Full bony foot plus selected intrinsic muscles are present. Source landmarks were projected onto these surfaces. Browser full-leg and foot captures: output/review/source-full-leg.png and source-foot-detail.png. Tests/build pass. Independent anatomy and performance validation remain outstanding.

## Coverage limits
Four compartment hulls are derived illustrations, not segmented fascia. Joint entries highlight actual source menisci, capsule, articular or ligament regions. Deltoid source includes tibionavicular, tibiocalcaneal and posterior tibiotalar components; separate anterior tibiotalar geometry is unavailable. Do not claim complete deltoid or complete intrinsic-foot/neurovascular coverage.
