import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalogue } from '../src/catalogue.ts';
import { conditions } from '../src/conditions.ts';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const destination=path.join(root,'output/review');
fs.mkdirSync(destination,{recursive:true});
fs.writeFileSync(path.join(destination,'catalogue.json'),JSON.stringify(catalogue));
fs.writeFileSync(path.join(destination,'conditions.json'),JSON.stringify(conditions));
console.log(`Prepared ${catalogue.length} parts for Blender export.`);
