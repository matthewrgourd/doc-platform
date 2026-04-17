import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import ApiReferenceClient from '@site/src/components/ApiReferenceClient';

export default function PlatziApiPlaygroundPage(): React.JSX.Element {
  return (
    <Layout title="Platzi API playground">
      <section className="container padding-top--md">
        <p>
          Curated demo playground against the Platzi Fake Store API. For scope and caveats, read the{' '}
          <Link to="/platzi/getting-started/playground">Platzi playground guide</Link>.
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
