import fs from 'fs';
import path from 'path';
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

type NavDocNode = {
  type: 'doc';
  id: string;
  label?: string;
};

type NavLinkNode = {
  type: 'link';
  label: string;
  href: string;
};

type NavCategoryNode = {
  type: 'category';
  label: string;
  collapsible?: boolean;
  items: NavNode[];
};

type NavNode = NavDocNode | NavLinkNode | NavCategoryNode;

type LoadNavigationSidebarInput = {
  filePath: string;
  sidebarId: string;
};

function contractError(filePath: string, location: string, message: string): never {
  throw new Error(`[nav-contract] ${filePath} ${location}: ${message}`);
}

function assertObject(value: unknown, filePath: string, location: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    contractError(filePath, location, 'expected object');
  }
  return value as Record<string, unknown>;
}

function parseNode(raw: unknown, filePath: string, location: string): NavNode {
  const obj = assertObject(raw, filePath, location);
  const nodeType = obj.type;
  if (typeof nodeType !== 'string') {
    contractError(filePath, location, 'missing required field "type"');
  }

  if (nodeType === 'doc') {
    if (typeof obj.id !== 'string' || !obj.id.trim()) {
      contractError(filePath, location, 'doc node requires non-empty "id"');
    }
    if (obj.label !== undefined && typeof obj.label !== 'string') {
      contractError(filePath, location, '"label" must be a string when provided');
    }
    return {
      type: 'doc',
      id: obj.id,
      label: obj.label as string | undefined,
    };
  }

  if (nodeType === 'link') {
    if (typeof obj.label !== 'string' || !obj.label.trim()) {
      contractError(filePath, location, 'link node requires non-empty "label"');
    }
    if (typeof obj.href !== 'string' || !obj.href.trim()) {
      contractError(filePath, location, 'link node requires non-empty "href"');
    }
    return {
      type: 'link',
      label: obj.label,
      href: obj.href,
    };
  }

  if (nodeType === 'category') {
    if (typeof obj.label !== 'string' || !obj.label.trim()) {
      contractError(filePath, location, 'category node requires non-empty "label"');
    }
    if (!Array.isArray(obj.items) || obj.items.length === 0) {
      contractError(filePath, location, 'category node requires non-empty "items" array');
    }
    if (obj.collapsible !== undefined && typeof obj.collapsible !== 'boolean') {
      contractError(filePath, location, '"collapsible" must be boolean when provided');
    }

    const items = obj.items.map((item, index) =>
      parseNode(item, filePath, `${location}.items[${index}]`)
    );

    return {
      type: 'category',
      label: obj.label,
      collapsible: obj.collapsible as boolean | undefined,
      items,
    };
  }

  contractError(
    filePath,
    location,
    `unsupported node type "${nodeType}" (expected "doc", "link", or "category")`
  );
}

function computeDepth(nodes: NavNode[], currentDepth = 1): number {
  let maxDepth = currentDepth;
  for (const node of nodes) {
    if (node.type === 'category') {
      const childDepth = computeDepth(node.items, currentDepth + 1);
      if (childDepth > maxDepth) {
        maxDepth = childDepth;
      }
    }
  }
  return maxDepth;
}

export function loadNavigationSidebar(input: LoadNavigationSidebarInput): SidebarsConfig {
  const resolvedPath = path.resolve(process.cwd(), input.filePath);
  if (!fs.existsSync(resolvedPath)) {
    contractError(input.filePath, '', 'navigation file does not exist');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
  } catch (error) {
    contractError(input.filePath, '', `invalid JSON: ${String(error)}`);
  }

  if (!Array.isArray(parsed)) {
    contractError(input.filePath, '', 'root must be an array of navigation nodes');
  }

  const nodes = parsed.map((node, index) => parseNode(node, input.filePath, `[${index}]`));
  const maxDepth = computeDepth(nodes);

  // Explicitly validate deep nesting support expectations in contract checks.
  if (maxDepth < 1) {
    contractError(input.filePath, '', 'navigation tree depth calculation failed');
  }

  return {
    [input.sidebarId]: nodes,
  };
}
