import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import ApiReferenceClient from '@site/src/components/ApiReferenceClient';

export default function PetstoreApiPlaygroundPage(): React.JSX.Element {
  return (
    <Layout title="Petstore API playground">
      <section className="container padding-top--md">
        <p>
          Curated no-auth demo playground. For intent, limits, and expected outcomes, read the{' '}
          <Link to="/docs/how-to/petstore-playground">Petstore playground guide</Link>.
        </p>
      </section>
      <ApiReferenceClient
        specUrl="/openapi/petstore-playground.json"
        profile="petstore"
        downloadUrl="/openapi/petstore-playground.json"
        specLabel="Petstore demo OpenAPI JSON"
      />
    </Layout>
  );
}
