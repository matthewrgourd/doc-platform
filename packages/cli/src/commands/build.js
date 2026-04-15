import chalk from 'chalk';
import { assertProject } from '../utils/assert-project.js';
import { detectPm, runScript } from '../utils/detect-pm.js';
import { run } from '../utils/run.js';

export async function buildCommand() {
  assertProject();

  const pm = detectPm();
  const { cmd, args } = runScript(pm, 'build');

  console.log(chalk.bold.cyan('DevDocify') + chalk.dim(' › ') + chalk.bold('build'));
  console.log(chalk.dim(`  Building site with ${pm}…`));
  console.log();

  try {
    await run(cmd, args);
    console.log();
    console.log(chalk.green('✔ Build complete.'));
  } catch (err) {
    console.error(chalk.red(`\n✖ Build failed: ${err.message}`));
    process.exit(1);
  }
}
