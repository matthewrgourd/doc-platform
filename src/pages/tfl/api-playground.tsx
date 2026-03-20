import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import ApiReferenceClient from '@site/src/components/ApiReferenceClient';

export default function TflApiPlaygroundPage(): React.JSX.Element {
  return (
    <Layout title="TfL API playground">
      <section className="container padding-top--md">
        <p>
          Curated no-auth demo playground. For intent, limits, and expected outcomes, read the{' '}
          <Link to="/docs/how-to/tfl-playground">TfL playground guide</Link>.
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
