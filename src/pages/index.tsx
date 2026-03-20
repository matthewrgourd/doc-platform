import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home(): React.JSX.Element {
  return (
    <Layout
      title="API documentation"
      description="A reference implementation demonstrating multi-product API documentation with Docusaurus, Scalar, and Vercel"
    >
      <main className="container padding-vert--xl">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <h1>Devdocify</h1>
            <p className="hero__subtitle">
              Marketing site at root, technical product docs at <strong>/docs</strong>. This project
              demonstrates the <strong>Docusaurus</strong>, <strong>Scalar</strong>, and{' '}
              <strong>Vercel</strong> stack in a first-party implementation.
            </p>

            <h2>Tech stack</h2>
            <ul>
              <li>
                <strong>Docusaurus</strong> – Static site generator for documentation, with
                multi-instance docs support for separate product sections
              </li>
              <li>
                <strong>Scalar</strong> – Interactive API playground and reference, embedded per
                product
              </li>
              <li>
                <strong>Vercel</strong> – Deployment and hosting
              </li>
            </ul>

            <h2>Explore</h2>
            <p>
              Start with product documentation, then drill into demo API products and playgrounds.
            </p>
            <div className="margin-top--lg" style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
              <Link
                className="button button--primary button--lg"
                to="/docs"
              >
                Product docs →
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="/tfl/getting-started"
              >
                TfL API →
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="/petstore/getting-started"
              >
                Petstore →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
