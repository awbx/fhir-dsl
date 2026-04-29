/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: [
        'core-concepts/overview',
        'core-concepts/resources',
        'core-concepts/dsl-syntax',
        'core-concepts/types-and-generics',
        'core-concepts/immutability',
        'core-concepts/async-pattern',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/core',
        'api/runtime',
        'api/fhirpath',
        'api/cli',
        'api/generator',
        'api/smart',
        'api/terminology',
        'api/types',
        'api/utils',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/streaming',
        'guides/transform',
        'guides/extending',
        'guides/terminology',
        'guides/validation',
        'guides/smart',
        'guides/mcp',
        'guides/fhirpath-and-queries',
      ],
    },
    {
      type: 'category',
      label: 'FHIRPath',
      items: [
        'fhirpath/overview',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/patient',
        'examples/queries',
        'examples/complete-workflow',
      ],
    },
    {
      type: 'category',
      label: 'Recipes',
      items: [
        'recipes/patient-timeline',
        'recipes/flat-rows-export',
        'recipes/bulk-export-async',
        'recipes/us-core-compliance',
        'recipes/pagination-cursor',
        'recipes/parallel-fetch-references',
        'recipes/validation-pipeline',
        'recipes/smart-refresh-rotation',
        'recipes/terminology-expand-validate',
        'recipes/conditional-transaction',
      ],
    },
    'edge-cases',
    'llm-usage',
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/spec-catalog',
      ],
    },
    {
      type: 'category',
      label: 'Monorepo',
      items: [
        'monorepo/setup',
      ],
    },
    {
      type: 'category',
      label: 'CLI',
      items: [
        'cli/usage',
      ],
    },
    'contributing',
    'roadmap',
    'changelog',
  ],
};

module.exports = sidebars;
