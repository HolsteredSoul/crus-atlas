import { typeNames, type Part, type PartType } from './catalogue';

// Presentation groups only: preserve the source catalogue and GLB tissue contract.
export type LayerKey = PartType | 'compartment_guides';
export const layerKey = (part: Pick<Part, 'id' | 'type'>): LayerKey =>
  part.id.endsWith('_compartment') ? 'compartment_guides' : part.type;
export const layerNames: Record<LayerKey, string> = {
  ...typeNames,
  fascia: 'Anatomical fascia',
  compartment_guides: 'Compartment guides · schematic',
};
export const compartmentGuideNotice = 'Simplified space guides, not anatomical fascia surfaces. Hidden by default; use these envelopes to explore compartment relationships and pressure illustrations.';
