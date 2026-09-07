import './style.css';
import { createIcons, Search, ChevronDown, ChevronRight, Eye, EyeOff, Layers3, RotateCcw, Focus, Scan, X, Box, Move, Info, ArrowUpRight, PanelLeftClose, PanelRightClose, SlidersHorizontal, Bone, Activity, MousePointer2, Maximize2, Crosshair, Check, CircleHelp } from 'lucide';
import { catalogue, byId, compartmentNames, palette, type PartType } from './catalogue';
import { conditions, overlayColors, type Condition } from './conditions';
import { AtlasViewer, presets, type Preset } from './viewer';
import type { ExplodeMode } from './layout';
import { layerKey, layerNames, compartmentGuideNotice } from './layers';

const icons={Search,ChevronDown,ChevronRight,Eye,EyeOff,Layers3,RotateCcw,Focus,Scan,X,Box,Move,Info,ArrowUpRight,PanelLeftClose,PanelRightClose,SlidersHorizontal,Bone,Activity,MousePointer2,Maximize2,Crosshair,Check,CircleHelp};
const icon=(name:string)=>`<i data-lucide="${name}" aria-hidden="true"></i>`;
const drawIcons=()=>createIcons({icons,attrs:{'stroke-width':1.5}});
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`
 <header class="topbar">
  <a class="brand" href="./" aria-label="CRUS atlas home"><span class="brand-mark">${icon('scan')}</span>CRUS<span class="brand-divider"></span><span class="brand-caption">ANATOMY ATLAS</span></a>
  <div class="breadcrumb">Human anatomy <span>/</span> <strong>Lower leg</strong><span class="right-badge">R</span></div>
  <div class="header-actions"><span class="educational-tag"><span class="status-dot"></span> Educational edition</span><button class="icon-button mobile-toggle" data-action="left-panel" aria-label="Toggle anatomy panel">${icon('layers-3')}</button><button class="icon-button mobile-toggle" data-action="right-panel" aria-label="Toggle details panel">${icon('info')}</button><button class="icon-button" data-action="help" aria-label="Help and model information">${icon('circle-help')}</button></div>
 </header>
 <main class="workspace">
  <aside class="left-panel" aria-label="Anatomy layers">
   <div class="panel-heading"><div><span class="eyebrow">EXPLORE</span><h1>Lower leg<span class="heading-dot">.</span></h1></div><span class="small-badge">RIGHT</span></div>
   <div class="left-body"><label class="search-box">${icon('search')}<input id="search" type="search" placeholder="Find a structure…" aria-label="Search structures" autocomplete="off"/><kbd>/</kbd></label>
   <div class="tree-top"><span>ANATOMY LAYERS</span><button class="text-button" data-action="restore">Restore all</button></div>
   <div class="tree" id="tree"></div></div>
   <details class="tissue-legend"><summary>Tissue colours</summary><div>${(['bone','muscle','tendon','ligament','fascia','cartilage','sheath','retinaculum'] as PartType[]).map(t=>`<span><i style="background:${palette[t]}"></i>${t==='tendon'?'Tendons / aponeuroses':layerNames[t]}</span>`).join('')}<span><i class="guide-swatch"></i>Compartment guides</span></div><small>Educational colours · injury colours are shown in Clinical notes.</small></details><div class="layer-tools"><button data-action="xray" id="xray-button" aria-pressed="false">${icon('bone')} X-ray bones</button><button data-action="fade" id="fade-button" aria-pressed="false">${icon('layers-3')} Fade others</button></div>
   <div class="layer-footer"><span class="status-dot"></span><span id="part-count">${catalogue.length} structures</span><span class="unit">mm</span></div>
  </aside>
  <section class="center-panel" aria-label="Anatomy viewer">
   <div class="viewport" id="viewport">
    <div class="viewport-top"><div class="view-title"><span class="eyebrow">REGIONAL ANATOMY</span><h2>Crus & ankle</h2><span id="view-caption">Right lower limb · anterolateral view</span></div><span class="schematic-badge" id="model-badge"><span></span> Loading anatomy…</span></div>
    <div class="viewport-toolbar"><button class="icon-button" data-action="focus" title="Focus selection (F)" aria-label="Focus selection">${icon('focus')}</button><button class="icon-button" data-action="isolate" title="Isolate selection (I)" aria-label="Isolate selection">${icon('scan')}</button><button class="icon-button" data-action="hide" title="Hide selection (H)" aria-label="Hide selection">${icon('eye-off')}</button><span></span><button class="icon-button" data-action="reset" title="Reset (R)" aria-label="Reset atlas">${icon('rotate-ccw')}</button></div>
    <div class="orientation"><span class="axis axis-y">S</span><span class="axis axis-x">M</span><span class="axis axis-z">A</span><span class="axis-origin"></span><small>RIGHT LEG</small></div>
    <div class="canvas-hint">${icon('mouse-pointer-2')} Drag to orbit <span>·</span> Scroll to zoom <span>·</span> Right-drag to pan</div>
    <div class="viewport-foot"><span class="status-dot"></span><span id="render-status">Interactive 3D</span><span class="viewport-foot-right">PROXIMAL +Y</span></div>
    <div class="viewer-error" id="viewer-error" hidden></div>
   </div>
   <div class="bottom-dock">
    <div class="view-presets"><span class="dock-label">VIEW</span>${presets.map(p=>`<button data-action="preset" data-preset="${p}" class="preset-button" aria-pressed="false">${p}</button>`).join('')}<button class="icon-button" data-action="reset" aria-label="Reset view">${icon('rotate-ccw')}</button></div>
    <div class="explode-controls"><span class="dock-label">${icon('box')} EXPLODE</span><select id="explode-mode" aria-label="Explode mode"><option value="compartment">Compartment</option><option value="hierarchical">Hierarchical</option><option value="inventory">Inventory</option></select><input id="explode" type="range" min="0" max="1" value="0" step="0.01" aria-label="Explode amount"/><output id="explode-value" for="explode">0%</output><button class="text-button" data-action="reassemble">Reassemble</button></div>
    <div class="conditions-heading"><span class="dock-label">${icon('activity')} CLINICAL EXPLORER</span><span>Illustrative overlays</span><button class="text-button" data-action="clear-condition" id="clear-condition" hidden>Clear overlay ${icon('x')}</button></div>
    <div class="condition-filters" role="group" aria-label="Filter clinical conditions by region"><button data-action="condition-filter" data-id="all" aria-pressed="true">All</button><button data-action="condition-filter" data-id="foot_ankle" aria-pressed="false">Foot &amp; ankle</button><button data-action="condition-filter" data-id="calf_knee" aria-pressed="false">Calf &amp; knee</button></div>
    <div class="condition-chips" id="condition-chips">${conditions.map(c=>`<button data-action="condition" data-id="${c.id}" class="condition-chip" aria-pressed="false"><span style="--chip-color:${overlayColors[c.kind]}"></span>${c.shortName}</button>`).join('')}</div>
   </div>
  </section>
  <aside class="right-panel" aria-label="Structure and clinical details">
   <div class="detail-tabs" role="tablist" aria-label="Detail view"><button role="tab" id="structure-tab" aria-controls="detail" aria-selected="true" data-action="tab" data-tab="structure">Structure</button><button role="tab" id="clinical-tab" aria-controls="detail" aria-selected="false" data-action="tab" data-tab="clinical">Clinical notes <span id="clinical-dot"></span></button></div>
   <div id="detail" class="detail-content" role="tabpanel" aria-labelledby="structure-tab"></div>
   <div class="clip-panel"><label><span>${icon('sliders-horizontal')} Section plane</span><input type="checkbox" id="clip-enabled" aria-label="Enable clipping plane"/></label><input type="range" id="clip-height" min="10" max="590" value="300" aria-label="Clipping height in millimetres" disabled/><div class="clip-labels"><span>Distal</span><output id="clip-output">300 mm</output><span>Proximal</span></div></div>
   <div class="disclaimer">${icon('info')}<p><strong>For education only.</strong> Not a medical device. Not for diagnosis or surgical planning. Source anatomy; clinical overlays are schematic.</p></div>
  </aside>
 </main>
 <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>
 <dialog id="help-dialog"><div class="dialog-top"><span class="eyebrow">CRUS / FIELD GUIDE</span><button class="icon-button" data-action="close-help" aria-label="Close help">${icon('x')}</button></div><h2>Explore the lower leg.</h2><p>Orbit around the right leg, including underneath the foot. Choose Sole for a plantar view; select a structure to explore its attachments and clinical landmarks.</p><dl class="key-list"><div><dt><kbd>F</kbd></dt><dd>Focus selected structure</dd></div><div><dt><kbd>H</kbd></dt><dd>Hide selected structure</dd></div><div><dt><kbd>I</kbd></dt><dd>Isolate selected structure</dd></div><div><dt><kbd>R</kbd></dt><dd>Restore atlas and camera</dd></div><div><dt><kbd>Esc</kbd></dt><dd>Clear selection and overlay</dd></div></dl><h3>About this model</h3><p>Source-derived model with ${catalogue.length} individually named parts. Adapted from Z-Anatomy and BodyParts3D; educational anatomy, not a clinically validated reconstruction. +Y is proximal, +Z anterior and +X medial. Coordinates use millimetres.</p><p>The foot includes all tarsals, five metatarsals, phalanges and selected intrinsic muscles. Tendon and cartilage surfaces are retained from the source. Compartment envelopes and joint-region highlights are illustrative. <a href="https://github.com/Z-Anatomy/Models-of-human-anatomy" target="_blank" rel="noopener noreferrer">Source: Z-Anatomy / BodyParts3D · CC BY-SA 4.0</a>.</p><h3>Overlay colour key</h3><div class="overlay-key">${Object.entries(overlayColors).map(([k,v])=>`<span><i style="background:${v}"></i>${({tendinopathy:'Tendon / fascia change',partial:'Partial tear',stress:'Bone stress / osteochondral site',fluid:'Fluid / bursa',pressure:'Compartment pressure',landmark:'Nerve landmark'} as Record<string,string>)[k]??k}</span>`).join('')}</div><p class="dialog-disclaimer">Educational use only. Not a medical device. No diagnosis, treatment recommendations or surgical planning.</p></dialog>
`;
drawIcons();
const $=<T extends HTMLElement=HTMLElement>(selector:string)=>document.querySelector<T>(selector)!;
let viewer:AtlasViewer|undefined;
let selected:string|null='tibia',activeCondition:Condition|null=null,tab:'structure'|'clinical'='structure';
let conditionFilter:'all'|'foot_ankle'|'calf_knee'='all';
let query='',toastTimer:ReturnType<typeof setTimeout>;
const collapsed=new Set<string>(['joint','cartilage','tendon','ligament','fascia','compartment_guides','nerve','bursa','retinaculum','sheath']);
const collapsedCompartments=new Set<string>(['muscle:lateral','muscle:superficial_posterior','muscle:deep_posterior']);
function toast(message:string){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,4500);}
function renderTree(){
 const matches=catalogue.filter(p=>`${p.displayName} ${p.latinName??''} ${p.id} ${p.compartment} ${layerNames[layerKey(p)]} ${p.id==='atfl'?'ATFL':p.id==='cfl'?'CFL':p.id==='tp_tendon'?'PTTD':''}`.toLowerCase().includes(query));
 const types=[...new Set(catalogue.map(layerKey))];
 const row=(p:typeof catalogue[number])=>`<div class="part-row${selected===p.id?' selected':''}${viewer?.hidden.has(p.id)?' is-hidden':''}"><button class="part-select" data-action="select" data-id="${p.id}" aria-pressed="${selected===p.id}"><span class="part-dot${layerKey(p)==='compartment_guides'?' guide-swatch':''}" style="--tissue-color:${palette[p.colourTissue??p.type]};background:${palette[p.colourTissue??p.type]}"></span><span>${p.displayName}</span></button><button class="eye-button" data-action="visibility" data-id="${p.id}" aria-label="${viewer?.hidden.has(p.id)?'Show':'Hide'} ${p.displayName}">${icon(viewer?.hidden.has(p.id)?'eye-off':'eye')}</button></div>`;
 $('#tree').innerHTML=matches.length?types.map(type=>{
  const parts=matches.filter(p=>layerKey(p)===type);if(!parts.length)return '';
  const closed=!query&&collapsed.has(type);const all=catalogue.filter(p=>layerKey(p)===type);const shown=all.some(p=>!viewer?.hidden.has(p.id));
  const children=type==='muscle'?([...new Set(parts.map(p=>p.compartment))].map(comp=>{const id=`${type}:${comp}`,close=!query&&collapsedCompartments.has(id);return `<div class="compartment"><div class="compartment-header"><button data-action="compartment" data-id="${id}" aria-expanded="${!close}">${icon(close?'chevron-right':'chevron-down')}${compartmentNames[comp]}</button><button class="group-solo" data-action="solo-compartment" data-id="${comp}" title="Solo ${compartmentNames[comp]} compartment">Solo</button></div>${close?'':parts.filter(p=>p.compartment===comp).map(row).join('')}</div>`;}).join('')):parts.map(row).join('');
  return `<section class="tree-system"><div class="system-header"><button class="system-disclosure" data-action="system" data-id="${type}" aria-expanded="${!closed}">${icon(closed?'chevron-right':'chevron-down')}<span>${layerNames[type]}</span><span class="system-count">${parts.length}</span></button><button class="group-solo" data-action="solo-system" data-id="${type}" title="Solo ${layerNames[type]}">Solo</button><button class="eye-button" data-action="system-visibility" data-id="${type}" aria-label="Toggle ${layerNames[type]}">${icon(shown?'eye':'eye-off')}</button></div>${closed?'':`<div class="system-children">${type==='compartment_guides'?`<p class="guide-notice">${compartmentGuideNotice}</p>`:''}${children}</div>`}</section>`;
 }).join(''):`<div class="empty-tree">No structures match “${escapeHtml(query)}”.<button class="text-button" data-action="clear-search">Clear search</button></div>`;
 $('#part-count').textContent=viewer?`${viewer.stats.visible} / ${catalogue.length} visible`:`${catalogue.length} structures`;drawIcons();
}
function escapeHtml(text:string){return text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));}
function renderDetail(){
 $('#structure-tab').setAttribute('aria-selected',String(tab==='structure'));$('#clinical-tab').setAttribute('aria-selected',String(tab==='clinical'));$('#detail').setAttribute('aria-labelledby',`${tab}-tab`);$('#clinical-dot').classList.toggle('on',!!activeCondition);
 if(tab==='clinical'){
  if(!activeCondition){$('#detail').innerHTML=`<div class="empty-detail"><span class="detail-symbol">${icon('activity')}</span><span class="eyebrow">CLINICAL EXPLORER</span><h2>Anatomy in context.</h2><p>Choose a condition below the viewer to locate a clinical landmark and compare its imaging considerations.</p><div class="clinical-guide"><span>01</span> Choose a condition<br/><span>02</span> Locate the highlighted region<br/><span>03</span> Explore related structures</div><p class="muted">All overlays are schematic. A coloured region does not represent a diagnosis.</p></div>`;}
  else {const c=activeCondition;$('#detail').innerHTML=`<span class="detail-category" style="color:${overlayColors[c.kind]}"><span style="background:${overlayColors[c.kind]}"></span>${c.region}</span><h2>${c.title}</h2><p class="detail-description">${c.mechanism}</p><div class="landmark-card"><div>${icon('crosshair')} ${escapeHtml(c.landmarkLabel??'Palpation landmark')}</div><p>${c.landmark}</p><button class="text-button" data-action="locate">Locate on model ${icon('focus')}</button></div>${c.illustration?`<p class="illustration-note">${escapeHtml(c.illustration)}</p>`:''}<h3>Imaging considerations</h3><div class="imaging-note"><span>US</span><p>${c.ultrasound}</p></div><div class="imaging-note"><span>MRI</span><p>${c.mri}</p></div><h3>Look-alikes</h3><p>${c.lookAlikes}</p><h3>Related structures</h3><div class="related-parts">${c.parts.map(id=>`<button data-action="select" data-id="${id}">${byId.get(id)?.displayName} ${icon('arrow-up-right')}</button>`).join('')}</div><h3>References</h3><div class="sources">${c.sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} ${icon('arrow-up-right')}</a>`).join('')}</div>`;}
 } else {
  const p=selected?byId.get(selected):null;
  if(!p)$('#detail').innerHTML=`<div class="empty-detail"><span class="detail-symbol">${icon('mouse-pointer-2')}</span><span class="eyebrow">STRUCTURE INSPECTOR</span><h2>A closer look.</h2><p>Select a structure on the model or in the anatomy tree to explore its attachments and function.</p><button data-action="select" data-id="tibia" class="primary-button">Explore the tibia ${icon('arrow-up-right')}</button></div>`;
  else {const related=conditions.filter(c=>c.parts.includes(p.id));$('#detail').innerHTML=`<div class="detail-title-line"><span class="detail-category"><span class="${layerKey(p)==='compartment_guides'?'guide-swatch':''}" style="background:${palette[p.colourTissue??p.type]}"></span>${layerNames[layerKey(p)]} <b>/</b> Right</span><button class="icon-button" data-action="clear" aria-label="Clear selection">${icon('x')}</button></div><h2>${p.displayName}</h2>${p.latinName?`<p class="latin">${p.latinName}</p>`:''}<span class="compartment-tag">${compartmentNames[p.compartment]}</span><p class="detail-description">${p.description}</p>${layerKey(p)==='compartment_guides'?`<p class="guide-notice">${compartmentGuideNotice}</p>`:''}<div class="provenance-note"><strong>${p.provenance?.kind.replaceAll('_',' ')??'Source anatomy'}</strong><span>${p.provenance?.source??'Z-Anatomy / BodyParts3D'}</span><small>${p.provenance?.review??'Independent anatomical validation pending.'}</small></div><div class="selection-actions"><button class="primary-button" data-action="focus">${icon('focus')} Focus <kbd>F</kbd></button><button data-action="isolate">${icon('scan')} Isolate <kbd>I</kbd></button></div><div class="attachment-block"><div class="attachment-track"><span></span><i></i><span></span></div><div><h3>Origin / proximal attachment</h3><p>${p.attachments?.origin??'Not specified'}</p><h3>Insertion / distal attachment</h3><p>${p.attachments?.insertion??'Not specified'}</p></div></div><h3>Function</h3><p>${p.action}</p><h3>Related clinical landmarks <span class="number-badge">${related.length}</span></h3>${related.length?`<div class="related-conditions">${related.map(c=>`<button data-action="condition" data-id="${c.id}"><span style="background:${overlayColors[c.kind]}"></span>${c.shortName}${icon('arrow-up-right')}</button>`).join('')}</div>`:'<p class="muted">No overlay in this edition. Browse the clinical explorer for neighbouring landmarks.</p>'}<div class="structure-id">CATALOGUE ID <code>${p.id}</code></div>`;}
 }
 drawIcons();
}
function updateButtons(){
 $('#fade-button').setAttribute('aria-pressed',String(viewer?.fade??false));$('#xray-button').setAttribute('aria-pressed',String(viewer?.xray??false));
 document.querySelectorAll<HTMLElement>('.condition-chip').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.id===activeCondition?.id));const c=conditions.find(c=>c.id===b.dataset.id);b.hidden=conditionFilter!=='all'&&c?.area!==conditionFilter;});
 document.querySelectorAll<HTMLElement>('[data-action=condition-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===conditionFilter)));$('#clear-condition').hidden=!activeCondition;
}
function markPreset(name:string){document.querySelectorAll<HTMLElement>('.preset-button').forEach(b=>{const active=b.dataset.preset===name;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});}
function selectPart(id:string|null){selected=id;viewer?.select(id);tab='structure';renderTree();renderDetail();}
function activateCondition(id:string){
 const c=conditions.find(c=>c.id===id);if(!c)return;activeCondition=c;tab='clinical';selected=c.parts[0];setExplode(0);viewer?.select(selected);viewer?.showCondition(c);viewer?.preset(c.view,false);viewer?.focusCondition(c);if(matchMedia('(max-width:1000px)').matches){$('.workspace').classList.add('show-right');$('.workspace').classList.remove('show-left');}$('#view-caption').textContent=`Right lower limb · ${c.view.toLowerCase()} landmark view`;renderTree();renderDetail();updateButtons();
}
function clearCondition(){activeCondition=null;viewer?.showCondition(null);renderDetail();updateButtons();renderTree();}
function setExplode(amount:number){const mode=$<HTMLSelectElement>('#explode-mode').value as ExplodeMode;viewer?.explode(amount,mode);$<HTMLInputElement>('#explode').value=String(amount);$('#explode-value').textContent=`${Math.round(amount*100)}%`;}
function reset(){activeCondition=null;selected=null;viewer?.restore();viewer?.select(null);setExplode(0);viewer?.preset('Reset');viewer?.setClip(false);$<HTMLInputElement>('#clip-enabled').checked=false;$<HTMLInputElement>('#clip-height').disabled=true;tab='structure';$('#view-caption').textContent='Right lower limb · anterolateral view';renderTree();renderDetail();updateButtons();}
app.addEventListener('click',event=>{
 const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');if(!button)return;const {action,id}=button.dataset;
 switch(action){
  case 'select':selectPart(id!);break;
  case 'clear':selectPart(null);break;
  case 'focus':if(selected)viewer?.focus(selected);else viewer?.focus();break;
  case 'hide':if(selected){viewer?.hidden.add(selected);viewer?.apply();renderTree();toast(`${byId.get(selected)?.displayName} hidden`);}else toast('Select a structure first.');break;
  case 'isolate':if(selected){viewer?.isolate([selected]);renderTree();updateButtons();}else toast('Select a structure first.');break;
  case 'fade':if(viewer){viewer.fade=!viewer.fade;viewer.apply();updateButtons();}break;
  case 'xray':if(viewer){viewer.xray=!viewer.xray;viewer.apply();updateButtons();}break;
  case 'visibility':viewer?.toggle([id!]);renderTree();break;
  case 'system-visibility':viewer?.toggle(catalogue.filter(p=>layerKey(p)===id).map(p=>p.id));renderTree();break;
  case 'solo-system':viewer?.isolate(catalogue.filter(p=>layerKey(p)===id).map(p=>p.id));renderTree();updateButtons();break;
  case 'solo-compartment':viewer?.isolate(catalogue.filter(p=>p.compartment===id).map(p=>p.id));renderTree();updateButtons();break;
  case 'system':collapsed.has(id!)?collapsed.delete(id!):collapsed.add(id!);renderTree();break;
  case 'compartment':collapsedCompartments.has(id!)?collapsedCompartments.delete(id!):collapsedCompartments.add(id!);renderTree();break;
  case 'restore':viewer?.restore();activeCondition=null;renderTree();renderDetail();updateButtons();break;
  case 'preset':viewer?.preset(button.dataset.preset as Preset);$('#view-caption').textContent=`Right lower limb · ${button.dataset.preset!.toLowerCase()} view`;markPreset(button.dataset.preset!);break;
  case 'reset':reset();markPreset('');break;
  case 'reassemble':setExplode(0);viewer?.preset('Reset');markPreset('');$('#view-caption').textContent='Right lower limb · anterolateral view';break;
  case 'condition':activateCondition(id!);markPreset(activeCondition?.view??'');break;
  case 'condition-filter':conditionFilter=id as typeof conditionFilter;updateButtons();break;
  case 'clear-condition':clearCondition();break;
  case 'locate':if(activeCondition){viewer?.preset(activeCondition.view,false);viewer?.focusCondition(activeCondition);}break;
  case 'tab':tab=button.dataset.tab as typeof tab;renderDetail();break;
  case 'clear-search':query='';$<HTMLInputElement>('#search').value='';renderTree();break;
  case 'help':$<HTMLDialogElement>('#help-dialog').showModal();break;
  case 'close-help':$<HTMLDialogElement>('#help-dialog').close();break;
  case 'left-panel':$('.workspace').classList.toggle('show-left');$('.workspace').classList.remove('show-right');break;
  case 'right-panel':$('.workspace').classList.toggle('show-right');$('.workspace').classList.remove('show-left');break;
 }
});
$('#search').addEventListener('input',e=>{query=(e.target as HTMLInputElement).value.trim().toLowerCase();renderTree();});
$('#explode').addEventListener('input',e=>setExplode(Number((e.target as HTMLInputElement).value)));
$('#explode').addEventListener('change',()=>{if(viewer?.explodeMode==='inventory'&&viewer.explodeAmount>0)setTimeout(()=>viewer?.focus(),400);});
$('#explode-mode').addEventListener('change',()=>{setExplode(Number($<HTMLInputElement>('#explode').value));if(viewer?.explodeMode==='inventory'&&viewer.explodeAmount>0)setTimeout(()=>viewer?.focus(),400);});
$('#clip-enabled').addEventListener('change',e=>{const on=(e.target as HTMLInputElement).checked;$<HTMLInputElement>('#clip-height').disabled=!on;viewer?.setClip(on,Number($<HTMLInputElement>('#clip-height').value));});
$('#clip-height').addEventListener('input',e=>{const value=Number((e.target as HTMLInputElement).value);viewer?.setClip(true,value);$('#clip-output').textContent=`${value} mm`;});
document.addEventListener('keydown',e=>{
 if($<HTMLDialogElement>('#help-dialog').open)return;
 if((e.target as HTMLElement).closest('input,select,textarea,[contenteditable="true"]')||e.ctrlKey||e.altKey||e.metaKey)return;
 const actions:Record<string,string>={f:'focus',h:'hide',i:'isolate',r:'reset'};
 if(actions[e.key.toLowerCase()]){e.preventDefault();document.querySelector<HTMLButtonElement>(`[data-action="${actions[e.key.toLowerCase()]}"]`)?.click();}
 if(e.key==='Escape'){clearCondition();selectPart(null);}if(e.key==='/'){e.preventDefault();$('#search').focus();}
});
// Native tab semantics with arrow-key navigation.
$('.detail-tabs').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();tab=tab==='structure'?'clinical':'structure';renderDetail();$(`#${tab}-tab`).focus();}});
try{
 viewer=new AtlasViewer($('#viewport'));viewer.onSelect=selectPart;viewer.onStatus=message=>{toast(message);if(message.startsWith('Model unavailable:')){$('#viewer-error').hidden=false;$('#viewer-error').textContent=message;$('#model-badge').textContent='Model unavailable';}};viewer.select(selected);
 viewer.onModel=()=>{selected=null;activeCondition=null;$('#model-badge').textContent='Z-Anatomy · CC BY-SA 4.0';$('#viewer-error').hidden=true;setExplode(0);renderTree();renderDetail();updateButtons();};
 viewer.load(import.meta.env.VITE_ATLAS_GLB_URL || `${import.meta.env.BASE_URL}models/right-lower-leg.glb`);
}catch(error){$('#viewer-error').hidden=false;$('#viewer-error').innerHTML='<h2>3D graphics unavailable</h2><p>Enable WebGL or hardware acceleration, then reload. The anatomy catalogue and clinical notes remain available.</p>';$('#render-status').textContent='Catalogue mode';console.error(error);}
renderTree();renderDetail();updateButtons();
if(import.meta.hot)import.meta.hot.dispose(()=>viewer?.dispose());
