import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

const demos = [
  {
    name: 'TfL',
    to: '/tfl/getting-started',
    summary: 'Transport for London: line status, stops, bike points, journeys',
    meta: '5 endpoints · No auth needed',
  },
  {
    name: 'Petstore',
    to: '/petstore/getting-started',
    summary: 'The classic OpenAPI sample: pets, orders, users',
    meta: '6 endpoints · No auth needed',
  },
  {
    name: 'Platzi',
    to: '/platzi/getting-started',
    summary: 'Fake retail store: products, categories, users, locations',
    meta: '8 endpoints · Auth on 1',
  },
];

export default function Home(): React.JSX.Element {
  return (
    <Layout
      title="Multi-docset developer documentation platform"
      description="DevDocify gives every product you ship its own docset in one portal, with search, an AI assistant, live API playgrounds and CI quality gates. Deploy it to Vercel in minutes."
    >
      <main className="home-shell">
        <section className="home-hero">
          <div className="container">
            <div className="home-hero-grid">
              <div>
                <p className="home-eyebrow">For teams that ship more than one API</p>
                <h1>Developer docs for every product you ship</h1>
                <p className="home-subtitle">
                  One portal, a separate docset for each product, and search, an AI assistant and
                  live API playgrounds built in. Deploy it to Vercel in minutes.
                </p>

                <div className="home-actions">
                  <Link className="button button--primary button--lg" to="/tfl/api-playground">
                    Try a live API playground
                  </Link>
                  <Link className="button button--secondary button--lg" to="/docs/tutorials/quick-start">
                    Deploy your own
                  </Link>
                </div>
                <p className="home-tertiary">
                  Or <Link to="/docs">read the platform docs</Link> to see everything that's included.
                </p>
              </div>

              <figure className="home-showcase">
                <div className="home-showcase-bar">
                  <span className="home-showcase-method">GET</span>
                  <code>/Line/Mode/tube/Status</code>
                  <span className="home-showcase-status">200 OK</span>
                </div>
                <pre className="home-showcase-body">
                  <code>{`[
  {
    "id": "bakerloo",
    "name": "Bakerloo",
    "modeName": "tube",
    "lineStatuses": [
      {
        "statusSeverity": 10,
        "statusSeverityDescription": "Good Service"
      }
    ]
  },
  ...
]`}</code>
                </pre>
                <figcaption>
                  A sample TfL playground response.{' '}
                  <Link to="/tfl/api-playground">Run the request live</Link>
                </figcaption>
              </figure>
            </div>

            <div className="home-proof-grid">
              <div className="home-proof-card">
                <h2>Docs readers can find their way around</h2>
                <p>
                  Tutorials, how-to guides, reference and explanation are kept apart, so every
                  reader lands on the right kind of page.
                </p>
              </div>
              <div className="home-proof-card">
                <h2>Live API playgrounds</h2>
                <p>Readers send real requests from the page, with sample values already filled in.</p>
              </div>
              <div className="home-proof-card">
                <h2>Nothing ships broken</h2>
                <p>
                  Link checks, content linting and Lighthouse run on every pull request before a
                  release goes out.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="home-routes container padding-vert--xl">
          <h2>See it with real APIs</h2>
          <p className="home-routes-intro">
            Each demo is a full docset with guides and its own playground, running on the same
            platform you'd deploy.
          </p>
          <div className="home-route-grid">
            {demos.map((demo) => (
              <Link className="home-route-card" to={demo.to} key={demo.name}>
                <strong>{demo.name} demo</strong>
                <span>{demo.summary}</span>
                <span className="home-route-meta">{demo.meta}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
