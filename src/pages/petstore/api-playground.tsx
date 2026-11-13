import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import ApiReferenceClient from '@site/src/components/ApiReferenceClient';

export default function PetstoreApiPlaygroundPage(): React.JSX.Element {
  return (
    <Layout title="Petstore API playground">
      <section className="container padding-top--md">
        <h1>Petstore API playground</h1>
        <p>
          Try six operations from the classic OpenAPI Petstore sample. You don't need an API key. Select an operation, check the sample values, and then select <strong>Send</strong>.{' '}
          Read the{' '}
          <Link to="/petstore/getting-started/playground">Petstore playground guide</Link> for what each operation does and its limits.
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
