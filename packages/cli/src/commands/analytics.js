import chalk from 'chalk';

export function analyticsCommand() {
  console.log(chalk.bold.cyan('DevDocify') + chalk.dim(' › ') + chalk.bold('analytics'));
  console.log();
  console.log(chalk.bold('Search analytics are available in the Algolia dashboard.'));
  console.log();
  console.log('  ' + chalk.underline('https://dashboard.algolia.com'));
  console.log();
  console.log(chalk.dim('  From the dashboard you can view:'));
  console.log(chalk.dim('  - Top search queries and no-results queries'));
  console.log(chalk.dim('  - Click-through rates per search result'));
  console.log(chalk.dim('  - Search volume trends over time'));
  console.log();
  console.log(chalk.dim('  Your Algolia app ID and API key are configured in docusaurus.config.ts'));
  console.log(chalk.dim('  under the themeConfig.algolia section.'));
}
