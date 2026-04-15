// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'fhir-dsl',
  tagline: 'Type-safe FHIR query builder and code generator for TypeScript',
  favicon: 'img/favicon.ico',

  url: 'https://awbx.github.io',
  baseUrl: '/fhir-dsl/',

  organizationName: 'awbx',
  projectName: 'fhir-dsl',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/awbx/fhir-dsl/tree/main/apps/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'fhir-dsl',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://github.com/awbx/fhir-dsl',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              { label: 'Introduction', to: '/docs' },
              { label: 'Quick Start', to: '/docs/getting-started/quick-start' },
              { label: 'CLI', to: '/docs/cli/usage' },
            ],
          },
          {
            title: 'More',
            items: [
              { label: 'GitHub', href: 'https://github.com/awbx/fhir-dsl' },
              { label: 'npm', href: 'https://www.npmjs.com/org/fhir-dsl' },
            ],
          },
        ],
        copyright: `Copyright \u00a9 ${new Date().getFullYear()} fhir-dsl contributors. Built with Docusaurus.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
        additionalLanguages: ['bash', 'json'],
      },
    }),
};

module.exports = config;
