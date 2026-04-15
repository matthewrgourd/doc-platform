import https from 'https';
import http from 'http';
import chalk from 'chalk';
import ora from 'ora';

/**
 * Fetches a URL and returns the response body as a string.
 * @param {string} url
 * @returns {Promise<string>}
 */
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, { headers: { 'User-Agent': 'docify-score-bot/0.1' } }, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve(body));
      })
      .on('error', reject);
  });
}

/**
 * Fetches url with HEAD to see if it returns 2xx.
 * @param {string} url
 * @returns {Promise<boolean>}
 */
function headExists(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD', headers: { 'User-Agent': 'docify-score-bot/0.1' } }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 300);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

const CHECKS = [
  {
    label: 'Title tag',
    test: (html) => /<title>[^<]+<\/title>/i.test(html),
  },
  {
    label: 'Meta description',
    test: (html) => /<meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i.test(html),
  },
  {
    label: 'Canonical link',
    test: (html) => /<link[^>]+rel=["']canonical["'][^>]+href=["'][^"']+["']/i.test(html),
  },
  {
    label: 'og:title',
    test: (html) => /<meta[^>]+property=["']og:title["'][^>]+content=["'][^"']+["']/i.test(html),
  },
  {
    label: 'og:description or og:image',
    test: (html) =>
      /<meta[^>]+property=["']og:description["'][^>]+content=["'][^"']+["']/i.test(html) ||
      /<meta[^>]+property=["']og:image["'][^>]+content=["'][^"']+["']/i.test(html),
  },
  {
    label: 'Robots meta or sitemap.xml',
    testAsync: async (html, url) => {
      const hasRobots = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']+["']/i.test(html);
      if (hasRobots) return true;
      const base = new URL(url).origin;
      return headExists(`${base}/sitemap.xml`);
    },
  },
];

export async function scoreCommand(url) {
  // Normalise the URL.
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  console.log(chalk.bold.cyan('DevDocify') + chalk.dim(' › ') + chalk.bold('score'));
  console.log(chalk.dim(`  Checking: ${url}`));
  console.log();

  const spinner = ora('Fetching page…').start();
  let html;
  try {
    html = await fetchPage(url);
    spinner.succeed('Page fetched.');
  } catch (err) {
    spinner.fail(`Could not fetch ${url}: ${err.message}`);
    process.exit(1);
  }

  console.log();

  let passed = 0;
  for (const check of CHECKS) {
    let ok;
    if (check.testAsync) {
      ok = await check.testAsync(html, url);
    } else {
      ok = check.test(html);
    }

    if (ok) {
      passed++;
      console.log(chalk.green('✔') + ' ' + check.label);
    } else {
      console.log(chalk.red('✖') + ' ' + chalk.dim(check.label));
    }
  }

  const total = CHECKS.length;
  console.log();

  const scoreText = `${passed}/${total}`;
  const color = passed === total ? chalk.green : passed >= total / 2 ? chalk.yellow : chalk.red;

  console.log(chalk.bold('SEO score: ') + color.bold(scoreText));

  if (passed < total) {
    console.log();
    console.log(chalk.dim('  Add the missing tags to improve search engine discoverability.'));
  }
}
