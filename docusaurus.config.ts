import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'API Documentation',
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
          id: 'petstore',
          path: 'docs/petstore',
          routeBasePath: 'petstore',
          sidebarPath: './sidebarsPetstore.ts',
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
      '@scalar/docusaurus',
      {
        id: 'petstore-api',
        label: 'API reference',
        route: '/petstore/api-reference',
        showNavLink: false,
        configuration: {
          url: 'https://petstore3.swagger.io/api/v3/openapi.json',
          hideModels: false,
        },
      },
    ],
    [
      '@scalar/docusaurus',
      {
        id: 'tfl-api',
        label: 'API reference',
        route: '/tfl/api-reference',
        showNavLink: false,
        configuration: {
          url: 'https://api.tfl.gov.uk/swagger/docs/v1',
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
      title: 'API Docs',
      items: [
        {
          to: '/petstore/getting-started',
          label: 'Petstore',
          activeBasePath: '/petstore',
          position: 'left',
        },
        {
          to: '/tfl/getting-started',
          label: 'TfL',
          activeBasePath: '/tfl',
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
          title: 'Petstore',
          items: [
            {label: 'Getting started', to: '/petstore/getting-started'},
            {label: 'API reference', to: '/petstore/api-reference'},
          ],
        },
        {
          title: 'TfL',
          items: [
            {label: 'Getting started', to: '/tfl/getting-started'},
            {label: 'API reference', to: '/tfl/api-reference'},
          ],
        },
        {
          title: 'Resources',
          items: [
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
