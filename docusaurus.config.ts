import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkPlantuml from './src/remark/remark-plantuml';

const config: Config = {
  title: 'DevDocify',
  tagline: 'Build and ship first-class developer documentation',
  favicon: 'img/favicon.svg',

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/img/favicon.svg',
      },
    },
  ],

  future: {
    v4: true,
  },

  url: 'https://www.devdocify.com',
  baseUrl: '/',

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
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
          remarkPlugins: [remarkPlantuml],
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
        remarkPlugins: [remarkPlantuml],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'petstore',
        path: 'docs/petstore',
        routeBasePath: 'petstore',
        sidebarPath: './sidebarsPetstore.ts',
        remarkPlugins: [remarkPlantuml],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'platzi',
        path: 'docs/platzi',
        routeBasePath: 'platzi',
        sidebarPath: './sidebarsPlatzi.ts',
        remarkPlugins: [remarkPlantuml],
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        // Add redirect rules here when pages are moved or removed.
        // Example: { from: '/docs/old-path', to: '/docs/new-path' }
        redirects: [],
        // Uncomment to redirect entire path prefixes:
        // createRedirects(existingPath) { ... }
      },
    ],
    // Benchmark mode: inject a synthetic fixture docset when BENCHMARK_SCALE is set.
    // Used by scripts/benchmark-build.ts — never active in normal builds.
    ...(process.env.BENCHMARK_SCALE
      ? [
          [
            '@docusaurus/plugin-content-docs' as const,
            {
              id: `_fixture-${process.env.BENCHMARK_SCALE}`,
              path: `docs/_fixture-${process.env.BENCHMARK_SCALE}`,
              routeBasePath: `_fixture-benchmark`,
              sidebarPath: './sidebarsBenchmark.ts',
            },
          ],
        ]
      : []),
  ],

  themeConfig: {
    metadata: [
      {name: 'og:type', content: 'website'},
      {name: 'og:site_name', content: 'DevDocify'},
      {name: 'twitter:card', content: 'summary'},
      {name: 'twitter:site', content: '@devdocify'},
    ],
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 3,
    },
    navbar: {
      title: 'DevDocify',
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
        {
          to: '/platzi/getting-started',
          label: 'Platzi',
          position: 'left',
          activeBasePath: '/platzi',
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
          title: 'Platzi',
          items: [
            {label: 'Getting started', to: '/platzi/getting-started'},
            {label: 'API playground', to: '/platzi/api-playground'},
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
    algolia: {
      appId: '56LVNO7TSU',
      // Search-only API key — safe to expose in the browser bundle.
      // The admin key for index writes lives in ALGOLIA_ADMIN_API_KEY (CI secret only).
      apiKey: '3f045ef234e7f78945663bb72374ddad',
      indexName: 'devdocify',
      // contextualSearch uses the current docset/version as facet filters so results
      // stay relevant to the page the user is viewing.
      contextualSearch: true,
      searchParameters: {
        // Attributes returned from Algolia — aligned with push-search-index.ts record schema.
        attributesToRetrieve: [
          'type',
          'docset',
          'version',
          'slug',
          'title',
          'summary',
          'excerpt',
          'operationId',
          'method',
          'path',
        ],
      },
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'python', 'java', 'go', 'ruby', 'php', 'csharp'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
