# CRUS — lower leg anatomy atlas

A static Vite + TypeScript + Three.js browser app for exploring the **right lower leg**, ankle and distal knee. Includes 94 individually selectable entries (including one explicitly disputed source entry), compartment layers, camera presets, three explode modes and 14 source-linked clinical cards.

Public repository: [HolsteredSoul/crus-atlas](https://github.com/HolsteredSoul/crus-atlas). Original application code/scripts are MIT; anatomical derivatives remain CC BY-SA 4.0. See [LICENSE.md](LICENSE.md).

## GitHub Pages

Hosted atlas: [holsteredsoul.github.io/crus-atlas/](https://holsteredsoul.github.io/crus-atlas/).
The `Deploy atlas to GitHub Pages` workflow tests and builds changes pushed to
`master`, then publishes only `dist/`. It can also be run manually from Actions.
Repository Settings > Pages > Source must be **GitHub Actions**.

The Pages build uses `--base=/crus-atlas/` so JavaScript, the GLB and bundled Draco
decoders resolve beneath the repository URL. Local development retains the
relative base in `vite.config.ts`. No Blender rebuild is needed to deploy the
committed model, and no separate server or API credentials are required.

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
- Centre: drag to orbit, right-drag to pan, wheel/pinch to zoom. Double-click a part to focus it. OrbitControls uses damping and allows inspection underneath the foot while keeping a small limit at each pole to avoid inversion.
- Right: structure name, attachments, action, related conditions and clinical references. Section plane keeps anatomy below the chosen nominal Y coordinate; it does not create filled anatomical slice surfaces.
- Bottom: anterior, posterior, medial, lateral, knee plateau, ankle mortise, foot and Sole (plantar) views; explode slider; clinical condition chips.
- Keyboard: **F** focus, **H** hide, **I** isolate, **R** reset, **Esc** clear selection/overlay, **/** search. Shortcuts are disabled while typing or while help is open. The structure tree provides keyboard selection without requiring canvas picking.
- Small screens: header layer and information buttons open the corresponding panels. Help explains axes, shortcuts, source limitations and the colour key.

**Restore all** restores the default anatomy layers and clears isolation, fading, X-ray and the clinical overlay. Fascia, compartment envelopes, joint-region highlights, tendon sheaths, standalone tibial cartilage and the disputed retinaculum are hidden by default (69/94 visible). Bone surfaces retain their embedded source cartilage colours. Reset additionally reassembles the model, disables clipping and resets the camera.

The tissue legend and tree swatches use `src/tissue-palette.json`: off-white bone, brick-red muscle, ochre tendon/aponeurosis, violet ligament, teal fascia, pale-blue cartilage, medium-blue sheath and rose-purple retinaculum. These educational colours are applied to GLB vertex regions in Blender, not just fallback materials. Clinical-overlay colours have their own explanation in the clinical cards/help. Selection remains cyan.

## Model status and attribution

The rejected procedural model has been removed. The bundled Draco GLB uses actual right-side meshes from [Z-Anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy), by Gauthier Kervyn, with upstream BodyParts3D work by Kousaku Okubo and the Database Center for Life Science. The adapted model is distributed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Preserve the source's requested credits: **Z-Anatomy — The libre 3D atlas of anatomy — CC-BY-SA 4.0** and **BodyParts3D — The Database Center for Life Science — CC-BY-SA 2.1 Japan**. See `public/models/ATTRIBUTION.txt`.

There are 31 bone entries, 20 muscle entries, ten tendons, six ligament entries, five joint regions, cartilage, six anatomical fascia/aponeurosis entries, four illustrative compartment envelopes, eight sheaths, a nerve, bursa and one disputed retinaculum source entry. The foot includes all seven tarsals, five metatarsals, 14 phalanges and hallux sesamoids, plus six selected intrinsic muscle entries. This is not complete foot musculature or neurovascular anatomy.

Modifications: select right-leg/foot meshes, evaluate source modifiers, crop/cap the femur at 590 mm, separate source-marked tendon surfaces, merge logical parts, clean degenerate geometry, preserve tissue-region boundaries with educational vertex colours, transform coordinates, add metadata and Draco-compress. EDL, EHL, FHL, FDL and plantaris now retain their muscle IDs with separate tendon IDs. `partition-audit.json` accounts for every evaluated source face exactly once in each pair, including the deltoid/anterior-band partition. Its exact source component membership and checksum are pinned in `assets/review/dattl-source-partition.json`. The four original compartment hulls are frozen in `assets/compartment-baseline.json`; anatomical fascia/septa are distinct layers. Joint entries use source menisci, capsule, ligaments or articular surfaces as region illustrations.

See [the itemised review](docs/reviews/IMPLEMENTATION.md) and [unresolved registry](assets/unresolved.json). The plantar aponeurosis represents the central sheet with unresolved distal branching. A disconnected component inside the source Tibionavicular ligament is now separately selectable as **Deep anterior tibiotalar band · interpreted**. Its deep tibia-to-talar-body course supports that interpretation; a talar tibionavicular/capsular slip remains an alternative. Distal interosseous and tibiospring remain unresolved; the deltoid is incomplete. See [the dATTL pilot review](docs/reviews/DATTL-PILOT.md). The historic `superior_fibular_retinaculum` ID retains source geometry for inspection, explicitly relabelled as disputed and hidden by default. No new authored reconstruction was accepted.

The GLB is about 0.70 MB, with 130,758 exported pre-triangulation polygons. `manifest.json` records the pinned source checksum and per-part provenance, names, counts and bounds. Provenance and agent review do not establish clinical validation. Gap, split, stress and fluid overlays remain teaching symbols, not simulated tissue damage.

Third-party runtime components: Three.js (MIT), Lucide (ISC), GSAP (Standard No Charge licence linked by its package metadata), and Google Draco (Apache-2.0). Draco decoder files are copied from the installed Three.js distribution. See `THIRD_PARTY_NOTICES.md`.

## Swap in one Draco GLB

The interface and clinical data use `src/catalogue.ts` IDs, not display names or mesh ordering. The bundled model loads by default; an invalid replacement displays an error. There is no primitive fallback.

1. Obtain a licensed right-leg model and document the source URL, creator, licence, modifications and required attribution. Do not assume an asset aggregator owns every uploaded mesh.
2. Crop the femur below mid-femur, preserving the condyles and relevant origins. Keep the ankle and required insertion landmarks. Do not mirror a left leg without correcting metadata and geometry.
3. Register the geometry to the app coordinates: **+Y proximal, +Z anterior, +X medial for the right leg**. Thus the fibula is at negative X. Nominal units are **millimetres**, with the floor near Y=0, calcaneal insertion near Y=25, ankle near Y=75, tibial plateau near Y=425 and femoral cut near Y=590. glTF normally describes metres: this app intentionally consumes numeric coordinates as millimetres; export appropriately or bake a 1000x conversion before validation. Do not retain an accidental Blender export scale.
4. Merge each named anatomical part into one mesh (disconnected subcomponents are fine). Export exactly the catalogue membership: the original IDs in `assets/required-parts.json` plus additions in `assets/supplements.json`. Add/remove catalogue entries and matching condition references together if coverage changes. Missing, duplicate, unknown or incompatible IDs cause a visible error; partial imports are not silently accepted.
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
  wikiUrl: 'https://...',         // optional
  provenance: { kind: 'source_mesh', source: 'Z-Anatomy / BodyParts3D', references: ['https://...'], review: '...' }
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

The Sole preset frames the plantar surface. Orbiting can pass beneath the foot; the floor guides disappear below ground level, and focus preserves the viewing side. Reset returns to the upright overview.

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

Seven Node tests check real GLB Draco/colour/metadata, explicit membership, source bounds, rejected identity/provenance, clinical references and marker bounds, inventory separation, hierarchical weights, partition face conservation and pickable fascia/sheath opacity. TypeScript and production build pass. Actual browser checks and their limits are recorded in the itemised review. This is not a complete accessibility or clinical validation audit. Representative-device frame-rate measurement remains unperformed. The build emits the standard warning for the approximately 533 kB minified Three.js chunk (135 kB gzip).

## Rebuild the source asset

Blender 5.2.1 LTS with its glTF/Draco exporter was used. Download the archive identified by `assets/source.json` and extract its stated member to `output/review/source/Z-Anatomy.blend`. The exporter verifies SHA-256 before importing. Source archives, dependencies and temporary outputs are ignored; selected review images and compact Blender libraries are committed. Scripts resolve the repository from their own file paths, or the optional `CRUS_ROOT` environment variable.

Prepare metadata in the project terminal:

```sh
node --import tsx scripts/prepare-export.ts
```

Open and run `scripts/build-atlas.py` in Blender's Text Editor. It creates a separate workshop/export collection and writes the matching GLB, manifest and partition audit. Reimports always use fresh upstream objects, so edits in the workshop cannot silently contaminate a rebuild. Run `scripts/save-editable-assets.py` to save the compact `assets/generated/crus-atlas.blend` library. Use **File > Append > crus-atlas.blend > Collection > Crus atlas** for editable source-derived meshes; covering layers are hidden initially. Set the destination scene unit scale to 0.001 for numeric millimetres. Keep future authored geometry in `assets/authored/`, which regeneration never overwrites.

For candidate review, run `scripts/inspect-ligament-candidates.py` after the exporter, then the asset-save script. Append the **Unaccepted ligament candidates** collection from `assets/review/ligament-candidates.blend` to inspect the orange spring candidate and surrounding source anatomy; it is not used by the app. `scripts/render-review.py` renders selected IDs in a disposable scene. Section caps and optional review offsets affect only temporary copies, not exports.

The same workflow was verified in a clean background process (replace `blender` with your executable path):

```sh
blender --background --factory-startup --python-exit-code 1 --python scripts/build-atlas.py --python scripts/inspect-ligament-candidates.py --python scripts/save-editable-assets.py
```

`scripts/register-landmarks.py` is for an intentional model replacement, not routine supplementation: this iteration preserved `src/landmarks.json` exactly. Re-registering requires anatomical review. Run tests/build and inspect full-leg, ankle, Sole and layered views after export. Blender assets and scripts do not substitute for anatomical validation.
