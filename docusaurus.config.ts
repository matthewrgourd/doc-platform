import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Petstore API Docs',
  tagline: 'Everything you need to integrate with the Swagger Petstore API',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://petstore3.swagger.io',
  baseUrl: '/',

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
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
        id: 'api-reference',
        label: 'API reference',
        route: '/api-reference',
        showNavLink: false,
        configuration: {
          url: 'https://petstore3.swagger.io/api/v3/openapi.json',
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
      title: 'Petstore',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'gettingStartedSidebar',
          position: 'left',
          label: 'Getting started',
        },
        {
          type: 'docSidebar',
          sidebarId: 'petsSidebar',
          position: 'left',
          label: 'Pets',
        },
        {
          type: 'docSidebar',
          sidebarId: 'storeSidebar',
          position: 'left',
          label: 'Store',
        },
        {
          type: 'docSidebar',
          sidebarId: 'usersSidebar',
          position: 'left',
          label: 'Users',
        },
        {
          to: '/api-reference',
          label: 'API reference',
          position: 'left',
        },
        {
          href: 'https://github.com/swagger-api/swagger-petstore',
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
            {label: 'Getting started', to: '/getting-started'},
            {label: 'Pets', to: '/pets'},
            {label: 'Store', to: '/store'},
            {label: 'Users', to: '/users'},
            {label: 'API reference', to: '/api-reference'},
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
      copyright: `© ${new Date().getFullYear()} Swagger Petstore`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'python', 'java', 'go', 'ruby', 'php', 'csharp'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
