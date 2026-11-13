import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import ApiReferenceClient from '@site/src/components/ApiReferenceClient';

export default function PlatziApiPlaygroundPage(): React.JSX.Element {
  return (
    <Layout title="Platzi API playground">
      <section className="container padding-top--md">
        <h1>Platzi API playground</h1>
        <p>
          Send requests to the Platzi Fake Store API: products, categories, users, and locations. Only the profile endpoint needs a sign-in token.{' '}
          Read the{' '}
          <Link to="/platzi/getting-started/playground">Platzi playground guide</Link> for scope and caveats.
        </p>
      </section>
      <ApiReferenceClient
        specUrl="/openapi/platzi-playground.json"
        profile="platzi"
        downloadUrl="/openapi/platzi-playground.json"
        specLabel="Platzi demo OpenAPI JSON"
      />
    </Layout>
  );
}
