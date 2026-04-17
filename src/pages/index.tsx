import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home(): React.JSX.Element {
  return (
    <Layout
      title="DevDocify"
      description="DevDocify is a developer documentation platform that separates marketing from technical docs, with multi-docset support, interactive API playgrounds, and Diataxis-structured content."
    >
      <main className="home-shell">
        <section className="home-hero">
          <div className="container">
            <p className="home-eyebrow">Developer documentation platform</p>
            <h1>Build and ship first-class doc experiences</h1>
            <p className="home-subtitle">
              DevDocify separates marketing at root from technical documentation at{' '}
              <strong>/docs</strong>, then proves the model with working multi-docset demos and
              API playground flows.
            </p>

            <div className="home-actions">
              <Link className="button button--primary button--lg" to="/docs">
                Open product docs
              </Link>
              <Link className="button button--secondary button--lg" to="/tfl/getting-started">
                Explore demo APIs
              </Link>
            </div>

            <div className="home-proof-grid">
              <div className="home-proof-card">
                <h2>Diataxis docs at /docs</h2>
                <p>Tutorials, how-to guides, reference, and explanation in one coherent IA.</p>
              </div>
              <div className="home-proof-card">
                <h2>Interactive API demos</h2>
                <p>TfL, Petstore, and Platzi playgrounds are live with explanatory context and defaults.</p>
              </div>
              <div className="home-proof-card">
                <h2>Preview-first delivery</h2>
                <p>Build and quality gates keep documentation releases stable and reviewable.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="home-routes container padding-vert--xl">
          <h2>Explore surfaces</h2>
          <div className="home-route-grid">
            <Link className="home-route-card" to="/docs">
              <strong>Product docs</strong>
              <span>Primary technical documentation surface</span>
            </Link>
            <Link className="home-route-card" to="/tfl/getting-started">
              <strong>TfL demo docs</strong>
              <span>Transport-focused demo docset and playground</span>
            </Link>
            <Link className="home-route-card" to="/petstore/getting-started">
              <strong>Petstore demo docs</strong>
              <span>Sample API docset and playground routes</span>
            </Link>
            <Link className="home-route-card" to="/platzi/getting-started">
              <strong>Platzi demo docs</strong>
              <span>Retail-style fake store API docset and playground</span>
            </Link>
          </div>
        </section>

        <section className="home-planned container padding-bottom--xl">
          <h2>Stub marketing routes</h2>
          <p>
            These pages are placeholders. Technical content and demos live under{' '}
            <strong>/docs</strong>, <strong>/tfl</strong>, <strong>/petstore</strong>, and <strong>/platzi</strong>.
          </p>
          <div className="home-planned-links">
            <Link to="/customers">Customers</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
