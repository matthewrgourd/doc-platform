import { Command } from 'commander';
import chalk from 'chalk';

import { devCommand } from './commands/dev.js';
import { buildCommand } from './commands/build.js';
import { validateCommand } from './commands/validate.js';
import { brokenLinksCommand } from './commands/broken-links.js';
import { newCommand } from './commands/new.js';
import { updateCommand } from './commands/update.js';
import { scoreCommand } from './commands/score.js';
import { analyticsCommand } from './commands/analytics.js';
import { a11yCommand } from './commands/a11y.js';
import { configCommand } from './commands/config.js';

const program = new Command();

program
  .name('docify')
  .description(
    chalk.bold.cyan('DevDocify CLI') +
    '\n  Preview, validate, and ship documentation'
  )
  .version('0.1.0', '-v, --version', 'Output the current version');

program
  .command('dev')
  .description('Start the local dev server')
  .action(devCommand);

program
  .command('build')
  .description('Build the documentation site')
  .action(buildCommand);

program
  .command('validate')
  .description('Run content validation (lint-content script)')
  .action(validateCommand);

program
  .command('broken-links')
  .description('Build the site and report any broken links')
  .action(brokenLinksCommand);

program
  .command('new <directory>')
  .description('Scaffold a new DevDocify project')
  .action(newCommand);

program
  .command('update')
  .description('Update the CLI to the latest version')
  .action(updateCommand);

program
  .command('score <url>')
  .description('Check SEO signals for a URL and return a score out of 6')
  .action(scoreCommand);

program
  .command('analytics')
  .description('Open guidance for Algolia search analytics')
  .action(analyticsCommand);

program
  .command('a11y')
  .description('Guidance for accessibility testing with axe-core')
  .action(a11yCommand);

program
  .command('config [key] [value]')
  .description('Read or write CLI configuration (~/.docify/config.json)')
  .option('--reset', 'Clear all stored configuration')
  .action((key, value, options) => configCommand(key, value, options));

program.parse(process.argv);
