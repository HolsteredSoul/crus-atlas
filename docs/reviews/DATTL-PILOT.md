# Anterior tibiotalar pilot — 2026-09-07

The atlas now exposes **Deep anterior tibiotalar band · interpreted** as its 94th
entry (`deep_anterior_tibiotalar`). This separates existing source geometry;
it does not add newly reconstructed anatomy or complete the deltoid complex.

## Evidence and interpretation

The component has a short medial malleolus-to-proximal medial talar-body course,
near the trochlear margin and deep to longer superficial bands. It has no
navicular or calcaneal endpoint. Those relationships favour a deep anterior
tibiotalar interpretation. Native enthesis boundaries and histological identity
remain unresolved. A talar slip of the tibionavicular/capsular complex is an
alternative identification, explicitly disclosed in the detail card.

- [Campbell et al., 2014](https://sportsfootankle.com/wp-content/uploads/2015/09/ligament-anatomy-deltoid-complex-ankle-qualitative-quantitative-anatomical-study.pdf): figures 2, 4 and 6; PDF pages 4, 6 and 8 visually inspected. These show a left ankle; comparison used anatomical directions for this right-side source.
- [Gregersen et al., 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9201323/): complementary dissection descriptions, figure 1 captions and table 1. Full text was inspected; the publisher's image download was challenged, so visual inspection of this second figure is not claimed.

Independent anatomy review accepted only the qualified source-component
interpretation. Agent review is not independent clinical validation.

## Source and reproducibility

`Tibionavicular ligament.r` contains two disconnected evaluated components:
90 vertices / 88 polygons in the larger component, and 30 vertices / 28 polygons
in the selected deep component. The selected component is reached from evaluated
vertex 15; its faces are 32–39, 72–79 and 104–115. The upstream parent name is
preserved in provenance rather than treated as a standalone dATTL label.

`assets/review/dattl-source-partition.json` records exact vertex/face membership
and the pinned source checksum. The exporter rejects changed membership or a
different source checksum. `component:15` and `except_component:15` partition
this object, retaining the existing `deltoid` ID for the remaining source bands.
The normal metadata → Blender export → editable-library workflow rebuilds it.

## Review images

- [Medial, source component with bones](images/blender-dattl-existing-component-medial.png)
- [Oblique, attachment context](images/blender-dattl-existing-component-oblique.png)
- [Anterior oblique, depth context](images/blender-dattl-existing-component-anterior.png)

These are source component renders, not the rejected authored pilot.

## Technical verification

An independent decoded GLB comparison against commit `76f3442` found:

- All 92 unaffected structures have byte-identical Draco primitive payloads and unchanged transforms.
- The original deltoid's 344 triangles equal 288 remaining triangles plus 56 in the new entry; every triangle is accounted for.
- Maximum decoded position difference is 0.000625 mm from Draco requantization; vertex colours are unchanged.
- Clinical landmark data and compartment envelopes are unchanged.
- All seven tests pass, including expanded partition accounting. TypeScript and the Vite production build pass; the existing Three.js chunk-size warning remains.
- Browser checks passed: search and detail disclosure, direct canvas picking, focus, isolation, hide/reset, all three explode controls at 100%, reassembly, Sole preset and fade context. The loaded model has 94 entries, 69 visible by default; no browser errors were recorded. [Selected view](images/browser-dattl-selected.png).

The authored pilot was rejected: early renders concealed a depth inversion,
triangle checks found attachment-edge folds, and sections revealed overlap with
the existing component. Its local workshop files are retained under ignored
`output/review/unaccepted-dattl/`; none enter the shipped GLB or accepted library.
Preserving source geometry does not validate pre-existing source contact defects.

Remaining gaps: distal interosseous ligament, tibiospring/suitable spring receiving
surface, plantar fascia distal branches, disputed superior fibular retinaculum,
and independent anatomical validation.
