/** Tiny DOM builder. Text is always set via textContent — never parsed as HTML. */

/**
 * @param {string} tag
 * @param {{class?: string, text?: string, attrs?: Record<string, string|boolean|undefined>, on?: Record<string, EventListener>}} [props]
 * @param {...(Node|string|null|false|undefined)} children
 */
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  if (props.class) node.className = props.class;
  if (props.text !== undefined) node.textContent = props.text;
  for (const [k, v] of Object.entries(props.attrs ?? {})) {
    if (v === false || v === undefined) continue;
    node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const [ev, fn] of Object.entries(props.on ?? {})) node.addEventListener(ev, fn);
  for (const c of children) {
    if (c === null || c === false || c === undefined) continue;
    node.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
/** @param {string} tag @param {Record<string, string|number>} attrs */
export function svg(tag, attrs = {}, ...children) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  for (const c of children) if (c) node.append(c);
  return node;
}
