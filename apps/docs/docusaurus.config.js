// @ts-check

const rootPkg = require('../../package.json');

const SITE_URL = 'https://awbx.github.io';
const BASE_URL = '/fhir-dsl/';
const FULL_SITE_URL = `${SITE_URL}${BASE_URL}`;
const SITE_DESCRIPTION =
  'The TypeScript FHIR toolchain — typed query builder, code generator, FHIRPath, validators, SMART-on-FHIR, terminology, and an MCP bridge.';
const SOCIAL_CARD = 'img/social-card.png';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'fhir-dsl',
  tagline: SITE_DESCRIPTION,
  favicon: 'img/favicon.svg',

  url: SITE_URL,
  baseUrl: BASE_URL,

  organizationName: 'awbx',
  projectName: 'fhir-dsl',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  customFields: {
    version: rootPkg.version,
  },

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

  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'google-site-verification',
        content: 'ED4RyWoVl1m4zxyECeRoEyT3SWJwzseJ-AzEP_Nwfl4',
      },
    },
    {
      tagName: 'link',
      attributes: { rel: 'preconnect', href: 'https://github.com' },
    },
    {
      tagName: 'meta',
      attributes: { name: 'theme-color', content: '#0b5fff' },
    },
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        name: 'fhir-dsl',
        description: SITE_DESCRIPTION,
        codeRepository: 'https://github.com/awbx/fhir-dsl',
        programmingLanguage: 'TypeScript',
        license: 'https://github.com/awbx/fhir-dsl/blob/main/LICENSE',
        url: FULL_SITE_URL,
        keywords: [
          'FHIR',
          'TypeScript',
          'HL7',
          'FHIRPath',
          'SMART-on-FHIR',
          'healthcare',
          'interoperability',
          'code generator',
          'query builder',
          'MCP',
        ],
      }),
    },
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'fhir-dsl docs',
        url: FULL_SITE_URL,
        description: SITE_DESCRIPTION,
      }),
    },
  ],

  plugins: [
    './plugins/api-jsonld.mjs',
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      /** @type {import('@easyops-cn/docusaurus-search-local').PluginOptions} */
      ({
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 10,
        searchBarShortcut: true,
        searchBarShortcutHint: true,
        explicitSearchResultPath: true,
      }),
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/awbx/fhir-dsl/tree/main/apps/docs/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.7,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
          // lastmod from each doc's last update (git-tracked or frontmatter).
          // Lets Google prioritize recrawls for recently-changed pages.
          lastmod: 'datetime',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: SOCIAL_CARD,
      metadata: [
        { name: 'description', content: SITE_DESCRIPTION },
        {
          name: 'keywords',
          content:
            'FHIR, TypeScript, FHIRPath, SMART-on-FHIR, HL7, healthcare interoperability, code generator, query builder, MCP, validators, terminology',
        },
        { name: 'author', content: 'Abdelhadi Sabani' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'fhir-dsl — TypeScript FHIR toolchain' },
        { name: 'twitter:description', content: SITE_DESCRIPTION },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'fhir-dsl — TypeScript FHIR toolchain' },
        { property: 'og:description', content: SITE_DESCRIPTION },
        { property: 'og:url', content: FULL_SITE_URL },
        { property: 'og:site_name', content: 'fhir-dsl' },
      ],
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
              { label: 'Changelog', to: '/docs/changelog' },
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
        copyright: `Copyright © ${new Date().getFullYear()} fhir-dsl contributors. Built with Docusaurus.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
        additionalLanguages: ['bash', 'json'],
      },
    }),
};

module.exports = config;
