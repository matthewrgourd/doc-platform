import chalk from 'chalk';
import ora from 'ora';
import { assertProject } from '../utils/assert-project.js';
import { detectPm, runScript } from '../utils/detect-pm.js';
import { capture } from '../utils/run.js';

export async function brokenLinksCommand() {
  assertProject();

  const pm = detectPm();
  const { cmd, args } = runScript(pm, 'build');

  console.log(chalk.bold.cyan('DevDocify') + chalk.dim(' › ') + chalk.bold('broken-links'));
  console.log();

  const spinner = ora('Building site to check for broken links…').start();

  let output = '';
  try {
    const result = await capture(cmd, args);
    output = result.stdout + result.stderr;
    spinner.succeed('Build complete.');
  } catch (err) {
    spinner.fail('Build finished with errors.');
    output = (err.stdout ?? '') + (err.stderr ?? '');
  }

  // Parse broken link errors from Docusaurus build output.
  // Docusaurus reports broken links with lines like:
  //   - Broken link on source page path = /some/page:
  //        -> linking to /target (resolved as: /target)
  const brokenLinkPattern = /Broken link on source page path\s*=\s*(.+?):\s*\n\s*->\s*linking to (.+?)(?:\s+\(|$)/gm;
  const found = [];
  let match;

  while ((match = brokenLinkPattern.exec(output)) !== null) {
    found.push({ source: match[1].trim(), target: match[2].trim() });
  }

  // Also catch the simpler single-line pattern some versions emit.
  const singleLinePattern = /Broken link.*?:\s*(.+?)\s*->\s*(.+)/g;
  while ((match = singleLinePattern.exec(output)) !== null) {
    // Avoid duplicates
    if (!found.some((f) => f.source === match[1].trim() && f.target === match[2].trim())) {
      found.push({ source: match[1].trim(), target: match[2].trim() });
    }
  }

  console.log();

  if (found.length === 0) {
    console.log(chalk.green('✔ No broken links found.'));
    return;
  }

  console.log(chalk.red.bold(`✖ ${found.length} broken link${found.length === 1 ? '' : 's'} found:\n`));

  for (const { source, target } of found) {
    console.log(chalk.bold('  Source:') + ' ' + chalk.underline(source));
    console.log(chalk.bold('  Target:') + ' ' + chalk.red(target));
    console.log();
  }

  process.exit(1);
}
