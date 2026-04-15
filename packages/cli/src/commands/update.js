import chalk from 'chalk';
import ora from 'ora';
import { run } from '../utils/run.js';

export async function updateCommand() {
  console.log(chalk.bold.cyan('DevDocify') + chalk.dim(' › ') + chalk.bold('update'));
  console.log();

  const spinner = ora('Updating @devdocify/cli to the latest version…').start();

  try {
    spinner.stop();
    await run('npm', ['install', '-g', '@devdocify/cli@latest']);
    console.log();
    console.log(chalk.green('✔ @devdocify/cli updated successfully.'));
  } catch (err) {
    console.error(chalk.red(`\n✖ Update failed: ${err.message}`));
    console.error(chalk.dim('  Try running: npm install -g @devdocify/cli@latest'));
    process.exit(1);
  }
}
