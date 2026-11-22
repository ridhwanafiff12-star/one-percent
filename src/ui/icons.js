/** Category icons: single-weight ink line drawings, 24×24, drawn with the category colour. */
import { svg } from './dom.js';

const PATHS = {
  // Heart with a pulse line.
  health: [
    'M12 20s-7.5-4.6-7.5-10.2A4.1 4.1 0 0 1 12 7.3a4.1 4.1 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z',
    'M7.2 11.6h2.3l1.3-2.3 2.1 4.4 1.4-2.1h2.5',
  ],
  // Crescent and star.
  ibadah: [
    'M14.5 3.6a8.5 8.5 0 1 0 5.9 14.2 7 7 0 0 1-5.9-14.2z',
    'M18.6 5.2l.6 1.3 1.4.2-1 1 .2 1.4-1.2-.7-1.3.7.3-1.4-1-1 1.4-.2z',
  ],
  // Open book.
  knowledge: [
    'M3.5 6.2c2.9-1.4 5.7-1.4 8.5 0v12.6c-2.8-1.4-5.6-1.4-8.5 0z',
    'M20.5 6.2c-2.9-1.4-5.7-1.4-8.5 0v12.6c2.8-1.4 5.6-1.4 8.5 0z',
  ],
  // Stack of coins.
  finance: [
    'M6 7.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5S15.3 5 12 5 6 6.1 6 7.5z',
    'M6 7.5v4.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V7.5',
    'M6 12v4.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V12',
  ],
};

/** @param {import('../library/index.js').Category} cat */
export function categoryIcon(cat) {
  return svg('svg', { class: 'cat-icon', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false', 'data-icon': cat },
    ...PATHS[cat].map((d) => svg('path', { d })));
}
