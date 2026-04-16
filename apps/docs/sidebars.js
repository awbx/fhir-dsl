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
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/streaming',
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
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
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
