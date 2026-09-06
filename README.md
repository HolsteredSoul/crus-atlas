# CRUS — lower leg anatomy atlas

A static Vite + TypeScript + Three.js browser app for exploring the **right lower leg**, ankle and distal knee. Includes 74 individually selectable structures, compartment layers, camera presets, three explode modes and 14 source-linked clinical cards.

**Educational use only. Not a medical device. Not for diagnosis, treatment decisions or surgical planning.** Source anatomy and landmark registration have not undergone independent clinical validation. Clinical overlays are schematic.

## Run

Use Node.js 22.12+ or Node.js 24 and npm. From this directory:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To produce and serve the static release:

```sh
npm run build
npm run preview
```

Deploy the contents of `dist/` to a static host. No backend, API key, account or database is required by the application. The Google Fonts stylesheet is optional: local sans-serif fallbacks work without it. Draco decoders are bundled under `public/draco/`, not loaded from a CDN.

## Explore

- Left: search, expand systems/compartments, select individual parts, toggle eyes, solo a system or compartment, X-ray bones, fade others and restore the default layer state.
- Centre: drag to orbit, right-drag to pan, wheel/pinch to zoom. Double-click a part to focus it. OrbitControls uses damping and prevents flipping below the ground plane.
- Right: structure name, attachments, action, related conditions and clinical references. Section plane keeps anatomy below the chosen nominal Y coordinate; it does not create filled anatomical slice surfaces.
- Bottom: anterior, posterior, medial, lateral, knee plateau, ankle mortise and foot views; explode slider; clinical condition chips.
- Keyboard: **F** focus, **H** hide, **I** isolate, **R** reset, **Esc** clear selection/overlay, **/** search. Shortcuts are disabled while typing or while help is open. The structure tree provides keyboard selection without requiring canvas picking.
- Small screens: header layer and information buttons open the corresponding panels. Help explains axes, shortcuts, source limitations and the colour key.

**Restore all** restores the default anatomy layers and clears isolation, fading, X-ray and the clinical overlay. The four compartment envelopes, five joint-region highlights and standalone tibial cartilage are hidden by default (64/74 visible). Bone surfaces already retain their source cartilage colours. Reset additionally reassembles the model, disables clipping and resets the camera.

## Model status and attribution

The rejected procedural model has been removed. The bundled Draco GLB uses actual right-side meshes from [Z-Anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy), by Gauthier Kervyn, with upstream BodyParts3D work by Kousaku Okubo and the Database Center for Life Science. The adapted model is distributed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Preserve the source's requested credits: **Z-Anatomy — The libre 3D atlas of anatomy — CC-BY-SA 4.0** and **BodyParts3D — The Database Center for Life Science — CC-BY-SA 2.1 Japan**. See `public/models/ATTRIBUTION.txt`.

There are 31 bone entries, 20 muscle entries, five tendons, five ligament complexes, five joint regions, cartilage, four compartment envelopes, a nerve, bursa and retinaculum. The foot includes all seven tarsals, five metatarsals, 14 phalanges and hallux sesamoids, plus six selected intrinsic muscle entries. This is not complete foot musculature or neurovascular anatomy.

Modifications: select the right-leg/foot meshes, evaluate source modifiers, crop/cap the femur at 590 mm, separate source-marked tendon surfaces, merge logical parts, clean degenerate geometry, retain tissue colours as vertex colours, transform coordinates, add metadata and Draco-compress. Four convex hulls derived from muscle vertices illustrate compartments; they are not segmented fascia. Joint entries use source menisci, capsule, ligaments or articular surfaces as region highlights. The deltoid contains tibionavicular, tibiocalcaneal and posterior tibiotalar components; a separate anterior tibiotalar component is missing. Long flexor/extensor muscle entries can include source tendon portions.

The GLB is 532,228 bytes (about 0.53 MB), with 107,739 exported pre-triangulation polygons. `manifest.json` records per-part source names, counts and bounds. The source project has outstanding anatomy/validation work; provenance does not establish clinical validation. Gap, split, stress and fluid overlays remain teaching symbols, not simulated tissue damage.

Third-party runtime components: Three.js (MIT), Lucide (ISC), GSAP (Standard No Charge licence linked by its package metadata), and Google Draco (Apache-2.0). Draco decoder files are copied from the installed Three.js distribution. See `THIRD_PARTY_NOTICES.md`.

## Swap in one Draco GLB

The interface and clinical data use `src/catalogue.ts` IDs, not display names or mesh ordering. The bundled model loads by default; an invalid replacement displays an error. There is no primitive fallback.

1. Obtain a licensed right-leg model and document the source URL, creator, licence, modifications and required attribution. Do not assume an asset aggregator owns every uploaded mesh.
2. Crop the femur below mid-femur, preserving the condyles and relevant origins. Keep the ankle and required insertion landmarks. Do not mirror a left leg without correcting metadata and geometry.
3. Register the geometry to the app coordinates: **+Y proximal, +Z anterior, +X medial for the right leg**. Thus the fibula is at negative X. Nominal units are **millimetres**, with the floor near Y=0, calcaneal insertion near Y=25, ankle near Y=75, tibial plateau near Y=425 and femoral cut near Y=590. glTF normally describes metres: this app intentionally consumes numeric coordinates as millimetres; export appropriately or bake a 1000x conversion before validation. Do not retain an accidental Blender export scale.
4. Merge each named anatomical part into one mesh (disconnected subcomponents are fine). This first implementation expects one mesh per catalogue ID and all 74 IDs. Add/remove catalogue entries and matching condition references together if the source has different coverage. Missing, duplicate, unknown or incompatible IDs cause a visible error message; partial imports are not silently accepted.
5. Export each mesh's custom properties as glTF `extras`, with exactly the required values from `catalogue.ts`:

```ts
{
  id: 'tibia',
  displayName: 'Tibia',
  latinName: 'Tibia',              // optional
  type: 'bone',
  compartment: 'none',
  laterality: 'right',
  group: 'Supporting structures',
  parentGroup: 'Bones',
  attachments: { origin: '...', insertion: '...' }, // optional
  wikiUrl: 'https://...'          // optional
}
```

6. Export a single Draco-compressed binary glTF, for example `public/models/right-lower-leg.glb`. Target 15–25 MB for a cropped high-detail model; this is an upper preparation target, not padding to add to the smaller supplied GLB. Preserve custom properties when optimizing. Prefer baked static mesh transforms, outward normals, indexed triangles and sensible polygon counts.
7. Optionally override the default model URL in ignored `.env.local`:

```env
VITE_ATLAS_GLB_URL=/models/right-lower-leg.glb
```

Restart Vite or rebuild. For subdirectory deployments, use a URL that resolves beneath that deployment's base path. This is public configuration, not a secret.

`GLTFLoader` and `DRACOLoader` load and validate the GLB. The loader bakes nested transforms, recentres each mesh for explosion, restores the atlas material palette and uses the same metadata for selection and layers. Source tissue colours in COLOR_0 are preserved with atlas lighting. Without vertex colours the loader uses the catalogue tissue palette.

**Clinical marker registration is a required part of swapping the model.** Adjust marker coordinates and scales in `src/landmarks.json` to the replacement geometry and have their anatomical placement reviewed. Model metadata alone does not register spatial landmarks. Current markers were projected onto source surfaces with `scripts/register-landmarks.py`; that registration still requires anatomical review. The loader's validation checks identity metadata, not medical accuracy, orientation, scale or source licensing.

## Explode and rendering

- Compartment: four calf compartments separate in anatomical directions; bones and articular structures stay assembled.
- Hierarchical: centroid offsets relative to a calf pivot are weighted by tissue type and compartment direction; tendons/ligaments travel less than muscles.
- Inventory: only visible parts are packed in a world-XY grid using actual bounding sizes and spacing. Full explosion guarantees disjoint XY bounding boxes. Intermediate slider values interpolate from assembly and can overlap. Perspective and subsequent orbiting can project parts onto one another. Releasing the slider frames the inventory.
- Leader lines connect displaced centroids to their assembled positions. Clinical markers follow their associated meshes. Reassemble returns every part to its saved assembled position.
- Cyan emissive selection plus an OutlinePass; dimmed context at 10% opacity; optional bone transparency. Source tissue colours, soft directional lighting and a quiet floor grid provide shape cues.
- Rendering pauses when the tab is hidden and renders on demand when the view is still. Device pixel ratio is capped at 1.65. The bundled model is compact and uses vertex colours instead of texture downloads. The target is 60 fps during interaction on a midrange laptop; **this target has not been benchmarked on representative hardware**. Large replacement GLBs may require mesh/texture optimization.

## Clinical sources

Cards provide a one-sentence mechanism, illustrative palpation region, US/MRI considerations and look-alikes. They contain no treatment protocols. The tennis-leg, Achilles-rupture and soleus cards explicitly include DVT as a look-alike; an atlas or an identified muscle injury cannot exclude a vascular cause.

Primary/professional references (linked on the corresponding cards):

- [AAOS: Achilles tendinitis](https://www.orthoinfo.org/diseases--conditions/achilles-tendinitis/) and [Achilles rupture](https://www.orthoinfo.org/diseases--conditions/achilles-tendon-rupture-tear/).
- [ESSR: Ankle ultrasound technical guidelines](https://www.essr.org/content-essr/uploads/2016/10/ankle.pdf).
- [AAOS: Progressive collapsing foot deformity](https://www.orthoinfo.org/diseases--conditions/posterior-tibial-tendon-dysfunction).
- [Melville et al.: Peroneal US/MRI comparison with surgical findings](https://pubmed.ncbi.nlm.nih.gov/38337434/).
- [Delgado et al.: Tennis leg, 141-patient US study](https://pubmed.ncbi.nlm.nih.gov/12091669/).
- [Balius et al.: Soleus injuries and ultrasound sensitivity](https://pubmed.ncbi.nlm.nih.gov/24627005/).
- [AAOS: Compartment syndrome](https://www.orthoinfo.org/en/diseases--conditions/compartment-syndrome/), [sprained ankle](https://www.orthoinfo.org/en/diseases--conditions/sprained-ankle), and [shin splints](https://www.orthoinfo.org/diseases--conditions/shin-splints/?lv=true).
- [Common peroneal nerve anatomical report](https://pmc.ncbi.nlm.nih.gov/articles/PMC9052142/).

## Code map and validation

- `src/catalogue.ts` — canonical metadata, attachments, functions and material colours.
- `src/conditions.ts` — clinical cards, references, spatial markers and overlay colour language.
- `src/model.ts` — source materials and validated GLB loading.
- `src/layout.ts` — pure explode layout and non-overlapping inventory packing.
- `src/viewer.ts` — Three.js lifecycle, picking, camera, rendering, clipping and overlays.
- `src/main.ts` / `src/style.css` — responsive interface, controls and keyboard interaction.

```sh
npm test
npm run build
```

Five passing Node tests check the real GLB Draco/colour/metadata contract, source bounds and foot coverage, rejected metadata, clinical references and marker bounds, inventory separation and hierarchical weights. TypeScript and the production build pass. Browser checks exercised source loading, desktop and narrow layouts, foot preset, selection, hide/isolate/restore, inventory/reassembly and the Achilles overlay. This is not a complete accessibility or clinical validation audit. Representative-device frame-rate measurement remains unperformed. The build emits the standard warning for the approximately 533 kB minified Three.js chunk (135 kB gzip).

## Rebuild the source asset

Blender 5.2.1 LTS with its glTF/Draco exporter was used. Download the official repository's `Z-Anatomy.zip` and extract `Z-Anatomy/Startup.blend` to `output/review/source/Z-Anatomy.blend`. Source archives and review captures are ignored by Git. Set the ROOT/root paths in both Python scripts if working outside C:/DEV/Leg.

Prepare metadata in the project terminal:

```sh
node --import tsx --input-type=module -e "import fs from 'node:fs'; import {catalogue} from './src/catalogue.ts'; import {conditions} from './src/conditions.ts'; fs.mkdirSync('output/review',{recursive:true}); fs.writeFileSync('output/review/catalogue.json',JSON.stringify(catalogue)); fs.writeFileSync('output/review/conditions.json',JSON.stringify(conditions));"
```

Run `scripts/build-atlas.py` inside Blender, then `scripts/register-landmarks.py` in the same Blender session. They create a separate workshop scene/export collection, write the GLB/manifest and register illustrative clinical anchors. Run tests/build and inspect full-leg, foot and ankle views after export. The scripts do not substitute for anatomical review.
