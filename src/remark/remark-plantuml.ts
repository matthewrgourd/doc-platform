/**
 * Remark plugin: render PlantUML fenced code blocks as SVG images.
 *
 * Converts:
 *   ```plantuml
 *   @startuml
 *   Alice -> Bob: Hello
 *   @enduml
 *   ```
 *
 * Into an <img> element pointing to the PlantUML.com SVG endpoint, using
 * DEFLATE + PlantUML base64 encoding so the source is self-contained in the URL.
 *
 * Design decision: remote rendering (plantuml.com) rather than build-time Java.
 * Trade-off: no Java dependency in CI; external service required at page-load time.
 * Mitigation: Kroki.io (self-hostable) is a drop-in alternative — change PLANTUML_BASE_URL.
 */

import type {Plugin} from 'unified';
import type {Root, Code, Image} from 'mdast';
import {visit} from 'unist-util-visit';
import {deflateRawSync} from 'zlib';

const PLANTUML_BASE_URL = 'https://www.plantuml.com/plantuml/svg';

// ---------------------------------------------------------------------------
// PlantUML encoding — DEFLATE raw + 6-bit base64 variant
// ---------------------------------------------------------------------------

function encode6bit(b: number): string {
  if (b < 10) return String.fromCharCode(48 + b);       // '0'–'9'
  b -= 10;
  if (b < 26) return String.fromCharCode(65 + b);       // 'A'–'Z'
  b -= 26;
  if (b < 26) return String.fromCharCode(97 + b);       // 'a'–'z'
  b -= 26;
  if (b === 0) return '-';
  if (b === 1) return '_';
  return '?';
}

function encodeBytes(buf: Buffer): string {
  let r = '';
  for (let i = 0; i < buf.length; i += 3) {
    const b1 = buf[i] ?? 0;
    const b2 = buf[i + 1] ?? 0;
    const b3 = buf[i + 2] ?? 0;
    r += encode6bit((b1 >> 2) & 0x3f);
    r += encode6bit(((b1 & 0x3) << 4) | (b2 >> 4));
    r += encode6bit(((b2 & 0xf) << 2) | (b3 >> 6));
    r += encode6bit(b3 & 0x3f);
  }
  return r;
}

function encodePlantUml(source: string): string {
  const compressed = deflateRawSync(Buffer.from(source, 'utf-8'), {level: 9});
  return encodeBytes(compressed);
}

// ---------------------------------------------------------------------------
// Remark plugin
// ---------------------------------------------------------------------------

const remarkPlantuml: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'code', (node: Code, index, parent) => {
    if (node.lang !== 'plantuml') return;

    const encoded = encodePlantUml(node.value);
    const url = `${PLANTUML_BASE_URL}/${encoded}`;
    const alt = (node.meta ?? 'PlantUML diagram').trim();

    const imageNode: Image = {
      type: 'image',
      url,
      alt,
      title: null,
    };

    if (parent && typeof index === 'number') {
      parent.children.splice(index, 1, imageNode);
    }
  });
};

export default remarkPlantuml;
