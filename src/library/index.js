import { HEALTH } from './health.js';
import { IBADAH } from './ibadah.js';
import { KNOWLEDGE } from './knowledge.js';
import { FINANCE } from './finance.js';

/** @typedef {'health'|'ibadah'|'knowledge'|'finance'} Category */
/** @typedef {{id:string, category:Category, title:string, minutes:number, why:string, source:{label:string, url?:string}}} Task */

/** @type {Category[]} */
export const CATEGORIES = ['health', 'ibadah', 'knowledge', 'finance'];
export const CATEGORY_LABELS = { health: 'Health', ibadah: 'Ibadah', knowledge: 'Knowledge', finance: 'Finance' };

/** @type {Record<Category, Task[]>} */
export const LIBRARY = { health: HEALTH, ibadah: IBADAH, knowledge: KNOWLEDGE, finance: FINANCE };

const byId = new Map(Object.values(LIBRARY).flat().map((t) => [t.id, t]));

/** @param {string} id @returns {Task|undefined} */
export const getTask = (id) => byId.get(id);
