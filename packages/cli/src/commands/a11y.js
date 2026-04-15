import chalk from 'chalk';

export function a11yCommand() {
  console.log(chalk.bold.cyan('DevDocify') + chalk.dim(' › ') + chalk.bold('a11y'));
  console.log();
  console.log(chalk.bold('Accessibility testing with axe-core'));
  console.log();
  console.log('  DevDocify recommends ' + chalk.cyan('axe-cli') + ' for automated accessibility audits.');
  console.log('  Run it against any page of your local or deployed site:');
  console.log();
  console.log('  ' + chalk.cyan('npx axe-cli http://localhost:3000'));
  console.log('  ' + chalk.cyan('npx axe-cli https://your-deployed-site.example.com'));
  console.log();
  console.log(chalk.dim('  axe-cli checks for WCAG 2.1 AA violations including:'));
  console.log(chalk.dim('  - Missing alt text on images'));
  console.log(chalk.dim('  - Insufficient colour contrast'));
  console.log(chalk.dim('  - Missing form labels'));
  console.log(chalk.dim('  - Keyboard navigation issues'));
  console.log(chalk.dim('  - Missing landmark regions'));
  console.log();
  console.log(chalk.dim('  For CI integration, use the @axe-core/cli package in your workflow.'));
  console.log(chalk.dim('  See: https://github.com/dequelabs/axe-core-npm/tree/develop/packages/cli'));
}
