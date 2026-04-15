import { existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

/**
 * Exits with a helpful error if the cwd doesn't look like a DevDocify project.
 * Commands that scaffold or update should skip this check.
 */
export function assertProject() {
  const cwd = process.cwd();
  const hasTs = existsSync(join(cwd, 'docusaurus.config.ts'));
  const hasJs = existsSync(join(cwd, 'docusaurus.config.js'));

  if (!hasTs && !hasJs) {
    console.error(
      chalk.red('✖ No docusaurus.config.ts or docusaurus.config.js found in the current directory.')
    );
    console.error(
      chalk.dim(
        '  Run this command from the root of a DevDocify project, or use ' +
        chalk.bold('docify new <directory>') +
        ' to scaffold one.'
      )
    );
    process.exit(1);
  }
}
