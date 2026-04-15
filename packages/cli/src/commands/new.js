import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import chalk from 'chalk';
import ora from 'ora';

const GITIGNORE = `# Dependencies
node_modules/

# Docusaurus build outputs
.docusaurus/
build/

# Environment
.env
.env.local
.env.*.local

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp
*.swo
`;

const PACKAGE_JSON = (name) => JSON.stringify(
  {
    name,
    version: '0.1.0',
    private: true,
    scripts: {
      start: 'docusaurus start',
      build: 'docusaurus build',
      serve: 'docusaurus serve',
      'lint-content': 'echo "No linter configured yet"',
    },
    dependencies: {
      '@docusaurus/core': '^3.5.2',
      '@docusaurus/preset-classic': '^3.5.2',
      react: '^18.3.1',
      'react-dom': '^18.3.1',
    },
    devDependencies: {
      '@docusaurus/types': '^3.5.2',
      typescript: '^5.5.4',
    },
    engines: {
      node: '>=20.17.0',
    },
  },
  null,
  2
);

const DOCUSAURUS_CONFIG = (name) => `import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: '${name}',
  tagline: 'Documentation powered by DevDocify',
  favicon: 'img/favicon.ico',

  url: 'https://your-domain.example.com',
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: '${name}',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
`;

const DOCS_INDEX = (name) => `---
sidebar_position: 1
slug: /
title: Welcome
---

# Welcome to ${name}

This documentation was scaffolded by the DevDocify CLI.

## Getting started

Edit this file at \`docs/index.md\` to start writing your documentation.

Run your local dev server:

\`\`\`bash
docify dev
\`\`\`
`;

const CUSTOM_CSS = `/**
 * Custom CSS for this DevDocify project.
 * Add your overrides here.
 */
`;

export async function newCommand(directory) {
  const target = resolve(process.cwd(), directory);
  const name = directory.replace(/\//g, '-');

  if (existsSync(target)) {
    console.error(chalk.red(`✖ Directory already exists: ${target}`));
    process.exit(1);
  }

  const spinner = ora(`Scaffolding new DevDocify project in ${chalk.bold(directory)}…`).start();

  try {
    mkdirSync(target, { recursive: true });
    mkdirSync(join(target, 'docs'), { recursive: true });
    mkdirSync(join(target, 'src', 'css'), { recursive: true });

    writeFileSync(join(target, 'package.json'), PACKAGE_JSON(name));
    writeFileSync(join(target, 'docusaurus.config.ts'), DOCUSAURUS_CONFIG(name));
    writeFileSync(join(target, 'docs', 'index.md'), DOCS_INDEX(name));
    writeFileSync(join(target, 'src', 'css', 'custom.css'), CUSTOM_CSS);
    writeFileSync(join(target, '.gitignore'), GITIGNORE);

    spinner.succeed(`Project created at ${chalk.bold(target)}`);
  } catch (err) {
    spinner.fail('Failed to scaffold project.');
    console.error(chalk.red(err.message));
    process.exit(1);
  }

  console.log();
  console.log(chalk.bold('Next steps:'));
  console.log();
  console.log(`  ${chalk.cyan('cd')} ${directory}`);
  console.log(`  ${chalk.cyan('npm install')}`);
  console.log(`  ${chalk.cyan('docify dev')}`);
  console.log();
}
