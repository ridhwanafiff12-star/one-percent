/** Shuffle bag: every id appears once per cycle before any repeats. Pure functions. */

/** @param {string[]} ids @param {() => number} rng */
function shuffle(ids, rng) {
  const a = [...ids];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Draw the next id. Draws from the end; refills with a fresh shuffle of allIds when empty.
 * @param {string[]} bag remaining ids this cycle
 * @param {string[]} allIds
 * @param {() => number} rng
 * @param {string} [exclude] id to avoid if any other is available
 * @returns {{id: string, bag: string[]}}
 */
export function draw(bag, allIds, rng, exclude) {
  const pool = bag.length ? [...bag] : shuffle(allIds, rng);
  let idx = pool.length - 1;
  if (pool[idx] === exclude && pool.length > 1) idx--;
  const [id] = pool.splice(idx, 1);
  return { id, bag: pool };
}

/** Drop ids that no longer exist in the library (order preserved). */
export function reconcileBag(bag, allIds) {
  const known = new Set(allIds);
  return bag.filter((id) => known.has(id));
}
