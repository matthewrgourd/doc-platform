import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';

const CONFIG_DIR = join(homedir(), '.docify');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

function readConfig() {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeConfig(data) {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export function configCommand(key, value, options) {
  if (options?.reset) {
    writeConfig({});
    console.log(chalk.green('✔ Config reset.'));
    return;
  }

  const config = readConfig();

  if (!key) {
    // List current config.
    const entries = Object.entries(config);

    console.log(chalk.bold.cyan('DevDocify') + chalk.dim(' › ') + chalk.bold('config'));
    console.log(chalk.dim(`  Config file: ${CONFIG_FILE}`));
    console.log();

    if (entries.length === 0) {
      console.log(chalk.dim('  No configuration set.'));
    } else {
      for (const [k, v] of entries) {
        console.log(`  ${chalk.bold(k)}: ${v}`);
      }
    }
    return;
  }

  if (key && value === undefined) {
    // Read a single key.
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      console.log(config[key]);
    } else {
      console.log(chalk.dim(`(no value set for "${key}")`));
    }
    return;
  }

  // Set key = value.
  config[key] = value;
  writeConfig(config);
  console.log(chalk.green(`✔ Set ${chalk.bold(key)} = ${value}`));
}
