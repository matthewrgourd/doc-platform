import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import ApiReferenceClient from '@site/src/components/ApiReferenceClient';

export default function TflApiPlaygroundPage(): React.JSX.Element {
  return (
    <Layout title="TfL API playground">
      <section className="container padding-top--md">
        <h1>TfL API playground</h1>
        <p>
          Run live requests against five Transport for London endpoints. No API key needed: each operation has sample values filled in, so pick one and select Send.{' '}
          Read the{' '}
          <Link to="/tfl/getting-started/playground">TfL playground guide</Link> for what each endpoint returns and its limits.
        </p>
      </section>
      <ApiReferenceClient
        specUrl="/openapi/tfl-playground.json"
        profile="tfl"
        downloadUrl="/openapi/tfl-playground.json"
        specLabel="TfL demo OpenAPI JSON"
      />
    </Layout>
  );
}
