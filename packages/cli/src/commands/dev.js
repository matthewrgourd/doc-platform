import chalk from 'chalk';
import { assertProject } from '../utils/assert-project.js';
import { detectPm, runScript } from '../utils/detect-pm.js';
import { run } from '../utils/run.js';

export async function devCommand() {
  assertProject();

  const pm = detectPm();
  const { cmd, args } = runScript(pm, 'start');

  console.log(chalk.bold.cyan('DevDocify') + chalk.dim(' › ') + chalk.bold('dev'));
  console.log(chalk.dim(`  Starting local dev server with ${pm}…`));
  console.log();

  try {
    await run(cmd, args);
  } catch (err) {
    console.error(chalk.red(`\n✖ Dev server exited unexpectedly: ${err.message}`));
    process.exit(1);
  }
}
