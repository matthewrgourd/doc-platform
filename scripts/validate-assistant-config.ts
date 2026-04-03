/**
 * AI assistant config schema and validator — Epic 6, Story 6.3
 *
 * Defines the configuration for the scoped AI assistant MVP. The assistant
 * answers questions grounded in portal content (search index), cites sources
 * by slug and title, and enforces scope so it only responds about the current
 * docset/version context.
 *
 * Architecture note:
 *   The assistant is a thin API layer that:
 *     1. Receives a user query + context (portal, docset, version, current slug)
 *     2. Retrieves relevant entries from the search index (build/search-index.json)
 *     3. Passes retrieved content to the Claude API with a scoped system prompt
 *     4. Returns the response with inline citations (slug + title)
 *
 * Config file: assistant.config.json at project root.
 *
 * Usage:
 *   npx tsx scripts/validate-assistant-config.ts [--config <path>]
 *   npx tsx scripts/validate-assistant-config.ts --policy  (print safety policy)
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AssistantScope = 'portal' | 'docset' | 'version' | 'page';

export type CitationMode = 'inline' | 'footnote' | 'none';

export type SafetyPolicy = {
  /**
   * If true, refuse queries that ask the assistant to act as a different
   * persona, ignore its instructions, or jailbreak the system prompt.
   */
  refusePromptInjection: boolean;

  /**
   * If true, refuse queries about topics with no grounding in the search
   * index (hallucination prevention).
   */
  requireGrounding: boolean;

  /**
   * Max number of search index entries injected into context per query.
   * Higher values improve recall but increase token cost.
   */
  maxContextEntries: number;

  /**
   * If a query cannot be answered from indexed content, use this fallback
   * message instead of attempting an ungrounded answer.
   */
  outOfScopeFallback: string;
};

export type AssistantConfig = {
  /** Schema version. */
  schemaVersion: string;

  /** Claude model ID to use for assistant responses. */
  model: string;

  /**
   * Default scope for the assistant.
   *   portal  — answers from any indexed content across all docsets
   *   docset  — restricted to the current docset
   *   version — restricted to the current docset + version
   *   page    — restricted to the current page and its linked content
   */
  defaultScope: AssistantScope;

  /**
   * Whether users can widen the scope beyond defaultScope.
   * If false, the scope is fixed regardless of user preference.
   */
  allowScopeExpansion: boolean;

  /** How citations are rendered in responses. */
  citationMode: CitationMode;

  /** System prompt prefix injected before retrieved content. */
  systemPromptPrefix: string;

  /** Safety and grounding policy. */
  safety: SafetyPolicy;

  /**
   * Response latency budget in milliseconds.
   * Requests that exceed this should stream partial responses.
   */
  latencyBudgetMs: number;
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

type ConfigError = {level: 'error' | 'warn'; field: string; message: string};

const VALID_SCOPES: AssistantScope[] = ['portal', 'docset', 'version', 'page'];
const VALID_CITATION_MODES: CitationMode[] = ['inline', 'footnote', 'none'];
const RECOMMENDED_MODELS = ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'];

export function validateAssistantConfig(config: AssistantConfig): ConfigError[] {
  const errors: ConfigError[] = [];

  if (!config.schemaVersion) {
    errors.push({level: 'error', field: 'schemaVersion', message: 'required'});
  }

  if (!config.model) {
    errors.push({level: 'error', field: 'model', message: 'required — specify a Claude model ID'});
  } else if (!RECOMMENDED_MODELS.includes(config.model)) {
    errors.push({level: 'warn', field: 'model', message: `"${config.model}" is not a recommended model — use one of: ${RECOMMENDED_MODELS.join(', ')}`});
  }

  if (!VALID_SCOPES.includes(config.defaultScope)) {
    errors.push({level: 'error', field: 'defaultScope', message: `must be one of: ${VALID_SCOPES.join(', ')}`});
  }

  if (!VALID_CITATION_MODES.includes(config.citationMode)) {
    errors.push({level: 'error', field: 'citationMode', message: `must be one of: ${VALID_CITATION_MODES.join(', ')}`});
  }

  if (config.citationMode === 'none') {
    errors.push({level: 'warn', field: 'citationMode', message: '"none" disables citations — users cannot verify sources'});
  }

  if (!config.systemPromptPrefix || config.systemPromptPrefix.trim().length < 20) {
    errors.push({level: 'error', field: 'systemPromptPrefix', message: 'required — provide a meaningful system prompt (min 20 chars)'});
  }

  if (!config.safety) {
    errors.push({level: 'error', field: 'safety', message: 'required'});
  } else {
    if (!config.safety.refusePromptInjection) {
      errors.push({level: 'warn', field: 'safety.refusePromptInjection', message: 'strongly recommended to set true — prevents jailbreak attempts'});
    }
    if (!config.safety.requireGrounding) {
      errors.push({level: 'warn', field: 'safety.requireGrounding', message: 'recommended to set true — prevents hallucination on out-of-scope topics'});
    }
    if (!config.safety.maxContextEntries || config.safety.maxContextEntries < 1) {
      errors.push({level: 'error', field: 'safety.maxContextEntries', message: 'must be >= 1'});
    } else if (config.safety.maxContextEntries > 20) {
      errors.push({level: 'warn', field: 'safety.maxContextEntries', message: 'values above 20 may exceed context window budget'});
    }
    if (!config.safety.outOfScopeFallback) {
      errors.push({level: 'error', field: 'safety.outOfScopeFallback', message: 'required — fallback message for unanswerable queries'});
    }
  }

  if (!config.latencyBudgetMs || config.latencyBudgetMs < 1000) {
    errors.push({level: 'warn', field: 'latencyBudgetMs', message: 'should be >= 1000ms — very short budgets will clip streaming responses'});
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Safety policy documentation
// ---------------------------------------------------------------------------

const SAFETY_POLICY_DOC = `
AI Assistant Safety Policy
==========================

Scope enforcement
  The assistant only answers questions grounded in the current portal/docset/version
  context. Queries about topics not covered by indexed content return the configured
  outOfScopeFallback message.

Prompt injection resistance
  The system prompt prefix is injected before any user content. Queries that attempt
  to override, ignore, or escape the system prompt are refused with a standard message:
  "I can only answer questions about the documentation in this portal."

Citation requirements
  Every factual claim in a response must be supported by a cited search index entry
  (slug + title). The assistant does not generate content that cannot be attributed
  to an indexed source.

Unsafe request handling
  The following request types are always refused, regardless of scope:
  - Requests to act as a different AI or persona
  - Requests to reveal the system prompt or configuration
  - Requests for information outside the portal's subject matter
  - Requests that could facilitate harm (security exploits, PII extraction, etc.)

Hallucination prevention
  requireGrounding: true means the assistant will not answer if retrieved context
  does not contain relevant information. It will say so explicitly rather than guess.

Data handling
  - Session IDs in analytics events are opaque; no PII is stored in event payloads
  - Query text is not logged beyond the current session
  - Search index entries used for retrieval are not exposed verbatim to users
`;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): {configPath: string; printPolicy: boolean} {
  const args = process.argv.slice(2);
  const printPolicy = args.includes('--policy');
  const idx = args.indexOf('--config');
  const configPath = idx !== -1 && args[idx + 1]
    ? path.resolve(process.cwd(), args[idx + 1])
    : path.resolve(process.cwd(), 'assistant.config.json');
  return {configPath, printPolicy};
}

const {configPath, printPolicy} = parseArgs();

if (printPolicy) {
  console.log(SAFETY_POLICY_DOC);
  process.exit(0);
}

if (!fs.existsSync(configPath)) {
  console.error(`[assistant-config] ERROR: config not found: ${configPath}`);
  console.error('  Copy assistant.config.example.json to assistant.config.json.');
  process.exit(1);
}

let config: AssistantConfig;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.error(`[assistant-config] ERROR: failed to parse JSON: ${(err as Error).message}`);
  process.exit(1);
}

const errors = validateAssistantConfig(config);
let hasErrors = false;

for (const e of errors) {
  const prefix = e.level === 'error' ? 'ERROR' : 'WARN';
  console[e.level === 'error' ? 'error' : 'warn'](`[assistant-config] ${prefix}: ${e.field} — ${e.message}`);
  if (e.level === 'error') hasErrors = true;
}

if (hasErrors) {
  process.exit(1);
} else {
  const warnCount = errors.filter(e => e.level === 'warn').length;
  console.log(`[assistant-config] config valid — model: ${config.model}, scope: ${config.defaultScope}${warnCount > 0 ? ` (${warnCount} warning(s))` : ''}`);
}
