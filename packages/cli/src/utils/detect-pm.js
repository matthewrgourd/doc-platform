import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Detects the package manager in use by checking for lock files in the cwd.
 * Defaults to npm if no lock file is found.
 * @returns {'pnpm' | 'yarn' | 'bun' | 'npm'}
 */
export function detectPm() {
  const cwd = process.cwd();
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(cwd, 'bun.lockb'))) return 'bun';
  if (existsSync(join(cwd, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

/**
 * Returns the run-script invocation for the detected package manager.
 * @param {string} pm
 * @param {string} script
 * @returns {{ cmd: string, args: string[] }}
 */
export function runScript(pm, script) {
  switch (pm) {
    case 'pnpm':
      return { cmd: 'pnpm', args: ['run', script] };
    case 'yarn':
      return { cmd: 'yarn', args: [script] };
    case 'bun':
      return { cmd: 'bun', args: ['run', script] };
    default:
      return { cmd: 'npm', args: ['run', script] };
  }
}
