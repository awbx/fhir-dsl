import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

function Hero() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6rem 2rem',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontSize: '3.5rem',
        fontWeight: 800,
        letterSpacing: '-0.02em',
        marginBottom: '0.5rem',
      }}>
        {siteConfig.title}
      </h1>
      <p style={{
        fontSize: '1.35rem',
        color: 'var(--ifm-color-emphasis-700)',
        maxWidth: '640px',
        marginBottom: '2.5rem',
        lineHeight: 1.6,
      }}>
        {siteConfig.tagline}
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          className="button button--primary button--lg"
          to="/docs/getting-started/quick-start"
        >
          Get Started
        </Link>
        <Link
          className="button button--outline button--lg"
          to="/docs"
        >
          Documentation
        </Link>
        <Link
          className="button button--outline button--lg"
          href="https://github.com/awbx/fhir-dsl"
        >
          GitHub
        </Link>
      </div>
    </div>
  );
}

function Features() {
  const features = [
    {
      title: 'Type-Safe Queries',
      description: 'Every resource type, search parameter, and operator is validated at compile time. No more runtime surprises from malformed FHIR queries.',
    },
    {
      title: 'Code Generation',
      description: 'Generate TypeScript interfaces directly from official FHIR StructureDefinitions. Supports R4, R4B, R5, R6, and any published Implementation Guide.',
    },
    {
      title: 'Profile-Aware',
      description: 'Query against US Core or custom IG profiles with automatic type narrowing. Profile constraints are enforced by the type system.',
    },
    {
      title: 'Immutable Builders',
      description: 'Every query method returns a new builder instance. Safe to store, fork, and compose without hidden mutation.',
    },
    {
      title: 'Zero Runtime Overhead',
      description: 'The core DSL has no runtime dependencies beyond @fhir-dsl/types. Type safety compiles away to simple objects.',
    },
    {
      title: 'Kysely-Inspired',
      description: 'If you know Kysely, you already know fhir-dsl. The same fluent, chainable API pattern adapted for FHIR REST queries.',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '2rem',
      padding: '4rem 2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      {features.map(({ title, description }) => (
        <div key={title} style={{
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--ifm-color-emphasis-200)',
        }}>
          <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
          <p style={{ color: 'var(--ifm-color-emphasis-700)', margin: 0, lineHeight: 1.6 }}>
            {description}
          </p>
        </div>
      ))}
    </div>
  );
}

function CodePreview() {
  return (
    <div style={{
      maxWidth: '720px',
      margin: '0 auto',
      padding: '0 2rem 4rem',
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>What it looks like</h2>
      <pre style={{
        padding: '1.5rem',
        borderRadius: '8px',
        fontSize: '0.9rem',
        lineHeight: 1.7,
        overflow: 'auto',
      }}>
        <code>{`const result = await fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .where("birthdate", "ge", "1990-01-01")
  .include("general-practitioner")
  .sort("birthdate", "desc")
  .count(10)
  .execute();

// result.data is Patient[] — fully typed`}</code>
      </pre>
    </div>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main>
        <Hero />
        <Features />
        <CodePreview />
      </main>
    </Layout>
  );
}
