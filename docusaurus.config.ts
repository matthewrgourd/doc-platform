import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'API documentation',
  tagline: 'API documentation for Petstore and TfL',
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
          id: 'devdocify',
          path: 'docs/devdocify',
          routeBasePath: 'docs',
          sidebarPath: './sidebarsDevdocify.ts',
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
      '@docusaurus/plugin-content-docs',
      {
        id: 'tfl',
        path: 'docs/tfl',
        routeBasePath: 'tfl',
        sidebarPath: './sidebarsTfl.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'petstore',
        path: 'docs/petstore',
        routeBasePath: 'petstore',
        sidebarPath: './sidebarsPetstore.ts',
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Devdocify',
      items: [
        {
          to: '/docs',
          label: 'Docs',
          position: 'left',
          activeBasePath: '/docs',
        },
        {
          to: '/tfl/getting-started',
          label: 'TfL',
          position: 'left',
          activeBasePath: '/tfl',
        },
        {
          to: '/petstore/getting-started',
          label: 'Petstore',
          position: 'left',
          activeBasePath: '/petstore',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Petstore',
          items: [
            {label: 'Getting started', to: '/petstore/getting-started'},
            {label: 'API playground', to: '/petstore/api-playground'},
          ],
        },
        {
          title: 'TfL',
          items: [
            {label: 'Getting started', to: '/tfl/getting-started'},
            {label: 'API playground', to: '/tfl/api-playground'},
          ],
        },
        {
          title: 'Resources',
          items: [
            {label: 'Status', to: '/status'},
            {label: 'Support', to: '/support'},
          ],
        },
        {
          title: 'Planned',
          items: [
            {label: 'Customers', to: '/customers'},
            {label: 'Blog', to: '/blog'},
            {label: 'Pricing', to: '/pricing'},
          ],
        },
        {
          title: 'Legal',
          items: [
            {label: 'Privacy', to: '/privacy'},
            {label: 'Terms', to: '/terms'},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Matthew Gourd`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'python', 'java', 'go', 'ruby', 'php', 'csharp'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
