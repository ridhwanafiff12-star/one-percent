/** Validates the bundled task library. Returns a list of error messages (empty = valid). */

const PREFIX = { health: 'h', ibadah: 'i', knowledge: 'k', finance: 'f' };
const nonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;

export function validateLibrary(lib) {
  const errors = [];
  const seen = new Set();
  for (const [category, tasks] of Object.entries(lib)) {
    const prefix = PREFIX[category];
    if (!prefix) { errors.push(`unknown category ${category}`); continue; }
    for (const t of tasks) {
      const where = `${category}/${t.id}`;
      if (seen.has(t.id)) errors.push(`${where}: duplicate id`);
      seen.add(t.id);
      if (!new RegExp(`^${prefix}\\d{2}$`).test(t.id)) errors.push(`${where}: bad id`);
      if (t.category !== category) errors.push(`${where}: category mismatch`);
      if (!Number.isInteger(t.minutes) || t.minutes < 2 || t.minutes > 10) errors.push(`${where}: minutes out of range`);
      if (!nonEmpty(t.title)) errors.push(`${where}: empty title`);
      else if (t.title.length > 80) errors.push(`${where}: title too long`);
      if (!nonEmpty(t.why)) errors.push(`${where}: empty why`);
      if (!t.source || !nonEmpty(t.source.label)) errors.push(`${where}: empty source label`);
      else if (t.source.url !== undefined && !String(t.source.url).startsWith('https://')) errors.push(`${where}: url must be https`);
    }
  }
  return errors;
}
