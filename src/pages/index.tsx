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
            <h1>API documentation</h1>
            <p className="hero__subtitle">
              This site demonstrates the <strong>Docusaurus</strong>, <strong>Scalar</strong>, and{' '}
              <strong>Vercel</strong> tech stack for building modern API documentation. It serves as a
              reference implementation showing how a multi-product documentation site can be
              structured.
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

            <h2>Products</h2>
            <p>
              Each product has its own docs and API playground. Use the navbar or buttons below to switch between
              them.
            </p>
            <div className="margin-top--lg" style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
              <Link
                className="button button--primary button--lg"
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
