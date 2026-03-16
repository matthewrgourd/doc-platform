import React from 'react';
import Layout from '@theme/Layout';
import ApiReferenceClient from '@site/src/components/ApiReferenceClient';

export default function TflApiReferencePage(): React.JSX.Element {
  return (
    <Layout title="TfL API reference">
      <ApiReferenceClient
        specUrl="/openapi/tfl-playground.json"
        profile="tfl"
        downloadUrl="/openapi/tfl-playground.json"
        specLabel="TfL demo OpenAPI JSON"
      />
    </Layout>
  );
}
