import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Helix Developer Docs',
  tagline: 'Everything you need to integrate Helix into your application',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://docs.helix.dev',
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

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
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@scalar/docusaurus',
      {
        label: 'API Reference',
        route: '/api-reference',
        configuration: {
          spec: {
            url: '/openapi.yaml',
          },
          hideModels: false,
        },
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Helix',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'gettingStartedSidebar',
          position: 'left',
          label: 'Getting Started',
        },
        {
          type: 'docSidebar',
          sidebarId: 'paymentsSidebar',
          position: 'left',
          label: 'Payments',
        },
        {
          type: 'docSidebar',
          sidebarId: 'connectSidebar',
          position: 'left',
          label: 'Connect',
        },
        {
          to: '/api-reference',
          label: 'API Reference',
          position: 'left',
        },
        {
          href: 'https://github.com',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {label: 'Getting Started', to: '/getting-started'},
            {label: 'Payments', to: '/payments'},
            {label: 'Connect', to: '/connect'},
            {label: 'API Reference', to: '/api-reference'},
          ],
        },
        {
          title: 'Resources',
          items: [
            {label: 'Changelog', to: '/changelog'},
            {label: 'Status', href: 'https://status.example.com'},
            {label: 'Support', href: 'mailto:support@example.com'},
          ],
        },
        {
          title: 'Legal',
          items: [
            {label: 'Privacy', href: '#'},
            {label: 'Terms', href: '#'},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Helix, Inc.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'python', 'java', 'go', 'ruby', 'php', 'csharp'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
