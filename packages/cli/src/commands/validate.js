import chalk from 'chalk';
import { assertProject } from '../utils/assert-project.js';
import { detectPm, runScript } from '../utils/detect-pm.js';
import { run } from '../utils/run.js';

export async function validateCommand() {
  assertProject();

  const pm = detectPm();
  const { cmd, args } = runScript(pm, 'lint-content');

  console.log(chalk.bold.cyan('DevDocify') + chalk.dim(' › ') + chalk.bold('validate'));
  console.log(chalk.dim(`  Running content validation with ${pm}…`));
  console.log();

  try {
    await run(cmd, args);
    console.log();
    console.log(chalk.green('✔ Content validation passed.'));
  } catch (err) {
    console.error(chalk.red(`\n✖ Validation failed: ${err.message}`));
    console.error(chalk.dim('  Fix the issues listed above and run docify validate again.'));
    process.exit(1);
  }
}
