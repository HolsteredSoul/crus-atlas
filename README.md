# CRUS — lower leg anatomy atlas

A static Vite + TypeScript + Three.js browser app for exploring the **right lower leg**, ankle and distal knee. Includes 47 individually selectable structures, compartment layers, camera presets, three explode modes and 14 source-linked clinical cards.

**Educational use only. Not a medical device. Not for diagnosis, treatment decisions or surgical planning.** Anatomical geometry and clinical overlays are schematic and have not undergone anatomical or clinical validation.

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
- Bottom: anterior, posterior, medial, lateral, knee plateau and ankle mortise views; explode slider; clinical condition chips.
- Keyboard: **F** focus, **H** hide, **I** isolate, **R** reset, **Esc** clear selection/overlay, **/** search. Shortcuts are disabled while typing or while help is open. The structure tree provides keyboard selection without requiring canvas picking.
- Small screens: header layer and information buttons open the corresponding panels. Help explains axes, shortcuts, source limitations and the colour key.

**Restore all** restores the default anatomy layers and clears isolation, fading, X-ray and the clinical overlay. The four translucent compartment envelopes are hidden by default; expand Compartment envelopes to show them. Reset additionally reassembles the model, disables clipping and resets the camera.

## Model status and attribution

The supplied model is an **original procedural stand-in** created for this application, not a real anatomical scan or a segmented cadaver model. No third-party anatomical meshes from Open3DModel, BodyParts3D or Z-Anatomy are bundled. These remain candidate sources for a future licensed replacement. Do not attribute the current geometry to those projects.

All requested muscle groups, major tendons, ligaments, joints and six minimum bones are represented. Additional midfoot bones, two metatarsals, cartilage, a common fibular nerve, retrocalcaneal bursa and retinaculum provide landmarks. Four optional translucent envelopes identify the compartments. Muscle fibres are a procedural rendering texture, not reconstructed fascicles.

Detailed toes, distal phalanges, the full forefoot, complete neurovascular anatomy and proximal femur are outside this schematic. Toe insertions are described in the catalogue even when their terminal bones are not modelled. Some long flexor/extensor paths combine muscle and a simplified terminal extension under one muscle ID. The separately requested Achilles, TA, TP and fibular tendons have their own IDs. Ligament complexes are simplified envelopes/straps. Clinical pressure, gap, split, stress-band and bursal overlays are visual teaching symbols, not simulated tissue damage.

Third-party runtime components: Three.js (MIT), Lucide (ISC), GSAP (Standard No Charge licence linked by its package metadata), and Google Draco (Apache-2.0). Draco decoder files are copied from the installed Three.js distribution. See `THIRD_PARTY_NOTICES.md`.

## Swap in one Draco GLB

The interface and clinical data use `src/catalogue.ts` IDs, not display names or mesh ordering. The procedural fallback remains usable if no GLB is configured or a load fails.

1. Obtain a licensed right-leg model and document the source URL, creator, licence, modifications and required attribution. Do not assume an asset aggregator owns every uploaded mesh.
2. Crop the femur below mid-femur, preserving the condyles and relevant origins. Keep the ankle and required insertion landmarks. Do not mirror a left leg without correcting metadata and geometry.
3. Register the geometry to the app coordinates: **+Y proximal, +Z anterior, +X medial for the right leg**. Thus the fibula is at negative X. Nominal units are **millimetres**, with the floor near Y=0, calcaneal insertion near `[0,65,-40]`, ankle near Y=85, tibial plateau near Y=460 and femoral cut near Y=580. glTF normally describes metres: this app intentionally consumes numeric coordinates as millimetres; export appropriately or bake a 1000x conversion before validation. Do not retain an accidental Blender export scale.
4. Merge each named anatomical part into one mesh (disconnected subcomponents are fine). This first implementation expects one mesh per catalogue ID and all 47 IDs. Add/remove catalogue entries and matching condition references together if the source has different coverage. Missing, duplicate, unknown or incompatible IDs cause a visible fallback message; partial imports are not silently accepted.
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

6. Export a single Draco-compressed binary glTF, for example `public/models/right-lower-leg.glb`. Target 15–25 MB for a cropped high-detail model; this is a source-preparation target, not a size claimed for an asset supplied here. Preserve custom properties when optimizing. Prefer baked static mesh transforms, outward normals, indexed triangles and sensible polygon counts.
7. Create the ignored `.env.local` file:

```env
VITE_ATLAS_GLB_URL=/models/right-lower-leg.glb
```

Restart Vite or rebuild. For subdirectory deployments, use a URL that resolves beneath that deployment's base path. This is public configuration, not a secret.

`GLTFLoader` and `DRACOLoader` load and validate the GLB. The loader bakes nested transforms, recentres each mesh for explosion, restores the atlas material palette and uses the same metadata for selection and layers. Materials from the source are deliberately replaced so bones, cartilage and connective tissues remain readable.

**Clinical marker registration is a required part of swapping the model.** Adjust marker coordinates and scales in `src/conditions.ts` to the replacement geometry and have their anatomical placement reviewed. Model metadata alone does not register spatial landmarks. The current markers are nominal positions on the procedural stand-in. The loader's validation checks identity metadata, not medical accuracy, orientation, scale or source licensing.

## Explode and rendering

- Compartment: four calf compartments separate in anatomical directions; bones and articular structures stay assembled.
- Hierarchical: centroid offsets relative to a calf pivot are weighted by tissue type and compartment direction; tendons/ligaments travel less than muscles.
- Inventory: only visible parts are packed in a world-XY grid using actual bounding sizes and spacing. Full explosion guarantees disjoint XY bounding boxes. Intermediate slider values interpolate from assembly and can overlap. Perspective and subsequent orbiting can project parts onto one another. Releasing the slider frames the inventory.
- Leader lines connect displaced centroids to their assembled positions. Clinical markers follow their associated meshes. Reassemble returns every part to its saved assembled position.
- Cyan emissive selection plus an OutlinePass; dimmed context at 10% opacity; optional bone transparency. Muscle fibre shading, soft directional lighting and a quiet floor grid provide shape cues.
- Rendering pauses when the tab is hidden and renders on demand when the view is still. Device pixel ratio is capped at 1.65. Shared procedural fibre texture and modest segment counts limit overhead. The target is 60 fps during interaction on a midrange laptop; **this target has not been benchmarked on representative hardware**. Large replacement GLBs may require mesh/texture optimization.

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
- `src/model.ts` — original procedural geometry, material generation and validated GLB loading.
- `src/layout.ts` — pure explode layout and non-overlapping inventory packing.
- `src/viewer.ts` — Three.js lifecycle, picking, camera, rendering, clipping and overlays.
- `src/main.ts` / `src/style.css` — responsive interface, controls and keyboard interaction.

```sh
npm test
npm run build
```

Five Node tests verify complete finite geometry, anatomical coordinate relationships, metadata rejection, clinical-reference/marker integrity, inventory non-overlap and fixed-bone/reduced-tendon offsets. TypeScript strict checks and the Vite production build pass. The local Vite endpoint was verified with HTTP 200. Browser interaction/accessibility testing and representative-device frame-rate measurement remain unperformed; do not treat the node/build checks as those tests. The production build currently emits the standard warning for the approximately 538 kB minified Three.js chunk (about 137 kB gzip).

