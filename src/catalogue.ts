import supplements from '../assets/supplements.json';
import tissuePalette from './tissue-palette.json';
export type PartType = 'bone'|'cartilage'|'joint'|'muscle'|'tendon'|'ligament'|'fascia'|'nerve'|'vessel'|'bursa'|'retinaculum'|'skin'|'sheath';
export type Compartment = 'anterior'|'lateral'|'superficial_posterior'|'deep_posterior'|'knee'|'ankle'|'foot'|'neurovascular'|'none';
export type Representation = 'source_mesh'|'source_partition'|'authored_reconstruction'|'derived_illustration';
export interface Provenance { kind:Representation; source:string; references:string[]; review:string; }
export interface Part {
  id: string; displayName: string; latinName?: string; type: PartType; compartment: Compartment;
  laterality: 'right'; group: string; parentGroup: string;
  provenance?:Provenance; defaultHidden?:boolean;
  attachments?: {origin: string; insertion: string}; action: string; description: string; wikiUrl?: string;
}
export const compartmentNames: Record<Compartment,string> = {anterior:'Anterior',lateral:'Lateral',superficial_posterior:'Superficial posterior',deep_posterior:'Deep posterior',knee:'Knee',ankle:'Ankle',foot:'Foot',neurovascular:'Neurovascular',none:'Supporting structures'};
export const typeNames: Record<PartType,string> = {bone:'Bones',cartilage:'Cartilage',joint:'Joints',muscle:'Muscles',tendon:'Tendons',ligament:'Ligaments',fascia:'Fascia & compartments',nerve:'Nerves',vessel:'Vessels',bursa:'Bursae',retinaculum:'Retinacula',skin:'Skin',sheath:'Tendon sheaths'};
const p = (id:string,displayName:string,type:PartType,compartment:Compartment,origin:string,insertion:string,action:string,description='',latinName?:string):Part => ({id,displayName,type,compartment,laterality:'right',group:compartmentNames[compartment],parentGroup:typeNames[type],attachments:{origin,insertion},action,description:description || action,latinName,wikiUrl:`https://en.wikipedia.org/wiki/${encodeURIComponent(displayName.replaceAll(' ','_'))}`});
export const catalogue: Part[] = [
  p('tibia','Tibia','bone','none','Not applicable — bone','Not applicable — bone','Transfers load from the knee to the talus.','The medial, weight-bearing bone of the crus. The anterior crest and medial malleolus are palpable.','Tibia'),
  p('fibula','Fibula','bone','none','Not applicable — bone','Not applicable — bone','Provides muscle attachments and lateral ankle stability.','The lateral bone of the crus. Its distal end forms the lateral malleolus.','Fibula'),
  p('femur_distal','Distal femur','bone','knee','Femoral shaft; cropped proximally','Not applicable — bone','Forms the femoral side of the knee.','Distal shaft and both condyles; the proximal femur is outside this atlas.'),
  p('patella','Patella','bone','knee','Within quadriceps tendon','Patellar ligament to tibial tuberosity','Increases the mechanical advantage of knee extension.'),
  p('talus','Talus','bone','ankle','Not applicable — bone','Not applicable — bone','Transfers load between the leg and hindfoot.'),
  p('calcaneus','Calcaneus','bone','foot','Not applicable — bone','Achilles attaches posteriorly','Forms the heel and provides the Achilles lever arm.'),
  p('navicular','Navicular','bone','foot','Not applicable — bone','Primary tibialis posterior attachment','Supports the medial longitudinal arch.'),
  p('medial_cuneiform','Medial cuneiform','bone','foot','Not applicable — bone','Tibialis anterior and fibularis longus attachments','Contributes to the medial midfoot.'),
  p('metatarsal_1','First metatarsal','bone','foot','Not applicable — bone','TA and fibularis longus attach to base','Supports the medial forefoot.'),
  p('metatarsal_5','Fifth metatarsal','bone','foot','Not applicable — bone','Fibularis brevis attaches to base','Provides the lateral forefoot landmark.'),
  p('knee_joint','Knee joint','joint','knee','Femoral condyles','Tibial plateau and patella','Permits flexion, extension and coupled rotation.'),
  p('tibfib_proximal','Proximal tibiofibular joint','joint','knee','Lateral tibial condyle','Fibular head','Allows small gliding movements.'),
  p('tibfib_distal','Distal tibiofibular joint','joint','ankle','Distal tibial incisura','Distal fibula','Maintains the ankle mortise as a fibrous syndesmosis.'),
  p('talocrural','Talocrural joint','joint','ankle','Tibia and fibula','Talar trochlea','Permits ankle dorsiflexion and plantarflexion.'),
  p('subtalar','Subtalar joint','joint','foot','Talus','Calcaneus','Contributes to hindfoot inversion and eversion.'),
  p('tibial_cartilage','Tibial articular cartilage','cartilage','knee','Tibial plateau','Not applicable — articular surface','Provides a low-friction load-bearing surface.'),
  p('tibialis_anterior','Tibialis anterior','muscle','anterior','Lateral tibial condyle, proximal lateral tibia and interosseous membrane','Medial cuneiform and base of first metatarsal','Dorsiflexes and inverts the foot.','The prominent muscle immediately lateral to the tibial crest.','Musculus tibialis anterior'),
  p('extensor_hallucis_longus','Extensor hallucis longus','muscle','anterior','Middle anterior fibula and interosseous membrane','Dorsal base of distal phalanx of hallux','Extends the great toe and dorsiflexes the ankle.'),
  p('extensor_digitorum_longus','Extensor digitorum longus','muscle','anterior','Lateral tibial condyle, anterior fibula and interosseous membrane','Extensor expansions of toes 2–5','Extends the lateral four toes and dorsiflexes the ankle.'),
  p('fibularis_tertius','Fibularis tertius','muscle','anterior','Distal anterior fibula','Dorsal base of fifth metatarsal','Dorsiflexes and assists eversion.','An anterior-compartment muscle despite its fibularis name; variably absent.'),
  p('fibularis_longus','Fibularis longus','muscle','lateral','Fibular head and proximal lateral fibula','Plantar medial cuneiform and base of first metatarsal','Everts and weakly plantarflexes the foot; supports the arch.'),
  p('fibularis_brevis','Fibularis brevis','muscle','lateral','Distal lateral fibula','Tuberosity at base of fifth metatarsal','Everts and weakly plantarflexes the foot.'),
  p('gastrocnemius_medial','Gastrocnemius · medial head','muscle','superficial_posterior','Posterior femur superior to medial condyle','Posterior calcaneus through Achilles tendon','Plantarflexes the ankle and flexes the knee.'),
  p('gastrocnemius_lateral','Gastrocnemius · lateral head','muscle','superficial_posterior','Lateral femoral condyle','Posterior calcaneus through Achilles tendon','Plantarflexes the ankle and flexes the knee.'),
  p('soleus','Soleus','muscle','superficial_posterior','Posterior fibular head/proximal shaft, soleal line of tibia and tendinous arch','Posterior calcaneus through Achilles tendon','Plantarflexes the ankle; contributes to postural control.','Lies deep to gastrocnemius, within the superficial posterior compartment.'),
  p('plantaris','Plantaris','muscle','superficial_posterior','Inferior lateral supracondylar line of femur','Posterior calcaneus, with variable tendon course','Weakly assists knee flexion and ankle plantarflexion.','Small, variable muscle and slender tendon; an uncommon cause of tennis-leg symptoms.'),
  p('popliteus','Popliteus','muscle','deep_posterior','Lateral femoral condyle and lateral meniscus connection','Posterior tibia above the soleal line','Unlocks the knee through tibial medial rotation or femoral lateral rotation.'),
  p('tibialis_posterior','Tibialis posterior','muscle','deep_posterior','Posterior tibia, fibula and interosseous membrane','Navicular tuberosity and expansions to adjacent tarsals/metatarsals','Inverts and plantarflexes the foot; supports the medial arch.'),
  p('flexor_digitorum_longus','Flexor digitorum longus','muscle','deep_posterior','Posterior tibia below the soleal line','Plantar bases of distal phalanges of toes 2–5','Flexes the lateral four toes and assists plantarflexion.'),
  p('flexor_hallucis_longus','Flexor hallucis longus','muscle','deep_posterior','Distal posterior fibula and interosseous membrane','Plantar base of distal phalanx of hallux','Flexes the great toe and assists plantarflexion.'),
  p('achilles','Achilles tendon','tendon','superficial_posterior','Gastrocnemius and soleus aponeuroses','Middle posterior surface of calcaneus','Transmits calf force for ankle plantarflexion.','The calcaneal tendon. Midportion and insertional regions are distinct clinical landmarks.','Tendo calcaneus'),
  p('tp_tendon','Tibialis posterior tendon','tendon','deep_posterior','Tibialis posterior muscle','Navicular tuberosity with broad plantar expansions','Transmits inversion and medial arch support behind the medial malleolus.'),
  p('fl_tendon','Fibularis longus tendon','tendon','lateral','Fibularis longus muscle','Plantar medial cuneiform and first metatarsal base','Passes behind the lateral malleolus and crosses the plantar foot.'),
  p('fb_tendon','Fibularis brevis tendon','tendon','lateral','Fibularis brevis muscle','Fifth metatarsal base','Passes anterior to longus behind the lateral malleolus.'),
  p('ta_tendon','Tibialis anterior tendon','tendon','anterior','Tibialis anterior muscle','Medial cuneiform and first metatarsal base','Crosses the anterior ankle to transmit dorsiflexion and inversion.'),
  p('atfl','Anterior talofibular ligament','ligament','ankle','Anterior lateral malleolus','Lateral talar neck','Restrains anterior talar translation and inversion in plantarflexion.','ATFL — commonly the first ligament involved in an inversion ankle sprain.'),
  p('cfl','Calcaneofibular ligament','ligament','ankle','Tip of lateral malleolus','Lateral calcaneus','Resists hindfoot inversion across ankle and subtalar joints.'),
  p('ptfl','Posterior talofibular ligament','ligament','ankle','Malleolar fossa of distal fibula','Posterolateral talus','Restrains posterior talar translation.'),
  p('deltoid','Deltoid ligament complex','ligament','ankle','Medial malleolus','Talus, calcaneus and navicular','Resists eversion and supports medial ankle stability.','Source includes tibionavicular, tibiocalcaneal and posterior tibiotalar components. A separate anterior tibiotalar component is unavailable; this complex is incomplete.'),
  p('syndesmosis','Syndesmotic ligaments','ligament','ankle','Distal tibia','Distal fibula','Resist separation and external rotation at the ankle mortise.','Schematic anterior/posterior inferior tibiofibular and interosseous ligament complex.'),
  p('anterior_compartment','Anterior compartment envelope','fascia','anterior','Crural fascia, tibia, interosseous membrane and anterior septum','Not applicable — fascial envelope','Encloses the dorsiflexors and toe extensors.'),
  p('lateral_compartment','Lateral compartment envelope','fascia','lateral','Crural fascia, fibula and intermuscular septa','Not applicable — fascial envelope','Encloses fibularis longus and brevis.'),
  p('superficial_posterior_compartment','Superficial posterior envelope','fascia','superficial_posterior','Crural fascia and transverse intermuscular septum','Not applicable — fascial envelope','Encloses gastrocnemius, soleus and plantaris.'),
  p('deep_posterior_compartment','Deep posterior envelope','fascia','deep_posterior','Tibia, fibula, interosseous membrane and transverse septum','Not applicable — fascial envelope','Encloses the deep flexors, tibialis posterior and popliteus.'),
  p('common_fibular_nerve','Common fibular nerve','nerve','neurovascular','Sciatic nerve','Superficial and deep fibular nerve branches','Supplies the anterior and lateral compartments through its branches.','Winds around the fibular neck; also called the common peroneal nerve.'),
  p('retrocalcaneal_bursa','Retrocalcaneal bursa','bursa','ankle','Between anterior Achilles and posterosuperior calcaneus','Not applicable — bursa','Reduces friction between Achilles and calcaneus.'),
  p('superior_fibular_retinaculum','Superior fibular retinaculum','retinaculum','ankle','Posterolateral fibula','Lateral calcaneus','Retains the fibular tendons in the retromalleolar groove.'),
];
for (const [id,name] of [['cuboid','Cuboid'],['intermediate_cuneiform','Intermediate cuneiform'],['lateral_cuneiform','Lateral cuneiform'],['metatarsal_2','Second metatarsal'],['metatarsal_3','Third metatarsal'],['metatarsal_4','Fourth metatarsal'],['sesamoids','Hallux sesamoids']]) {
 catalogue.push(p(id,name,'bone','foot','Not applicable — bone','Articulates with adjacent foot bones','Contributes to foot support and motion.','Source-derived right foot geometry from Z-Anatomy.'));
}
for(let toe=1;toe<=5;toe++)for(const segment of ['proximal','middle','distal']){
 if(toe===1&&segment==='middle')continue;
 catalogue.push(p(`toe_${toe}_${segment}`,`${segment[0].toUpperCase()+segment.slice(1)} phalanx · toe ${toe}`,'bone','foot','Not applicable — bone','Toe joints and flexor/extensor attachments','Contributes to toe motion and load transfer.','Source-derived phalanx; toe 1 is the hallux.'));
}
for(const [id,name] of [['extensor_digitorum_brevis','Extensor digitorum brevis'],['extensor_hallucis_brevis','Extensor hallucis brevis'],['abductor_hallucis','Abductor hallucis'],['flexor_digitorum_brevis','Flexor digitorum brevis'],['foot_interossei','Dorsal interossei of foot'],['foot_lumbricals','Lumbricals of foot']]){
 catalogue.push(p(id,name,'muscle','foot','Intrinsic foot origin; see source anatomy','Digital tendons and phalanges','Contributes to coordinated toe motion and foot support.','Intrinsic foot muscle shown using the source anatomy mesh.'));
}
for(const entry of supplements){
 const item=p(entry.id,entry.displayName,entry.type as PartType,entry.compartment as Compartment,entry.origin,entry.insertion,entry.action,entry.description);
 if('references' in entry)item.provenance={kind:'source_mesh',source:'Z-Anatomy / BodyParts3D',references:[...(entry.references as string[]),'https://github.com/Z-Anatomy/Models-of-human-anatomy'],review:'Source geometry; technical and reference review only, not independent anatomical validation.'};
 catalogue.push(item);
}
export const byId = new Map(catalogue.map(part => [part.id,part]));
export const palette:Record<PartType,string> = tissuePalette;
export const partOpacity=(part:Part)=>part.id.endsWith('_compartment')?.22:part.type==='fascia'?.65:part.type==='sheath'?.55:part.type==='joint'?.38:1;
export const hiddenByDefault=(part:Part)=>part.defaultHidden??(['fascia','joint','sheath'].includes(part.type)||part.id==='tibial_cartilage');
for(const part of catalogue){
 const kind:Representation=part.id.endsWith('_compartment')||part.type==='joint'?'derived_illustration':['ta_tendon','tp_tendon','fl_tendon','fb_tendon','tibialis_anterior','tibialis_posterior','fibularis_longus','fibularis_brevis','tibial_cartilage',...supplements.flatMap(e=>'splitFrom' in e?[e.id,String(e.splitFrom)]:[])].includes(part.id)?'source_partition':'source_mesh';
 part.provenance??={kind,source:'Z-Anatomy / BodyParts3D',references:['https://github.com/Z-Anatomy/Models-of-human-anatomy'],review:'Technical review only; independent anatomical validation pending.'};
}
