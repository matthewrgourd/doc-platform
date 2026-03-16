import React from 'react';
import Layout from '@theme/Layout';
import ApiReferenceClient from '@site/src/components/ApiReferenceClient';

export default function PetstoreApiReferencePage(): React.JSX.Element {
  return (
    <Layout title="Petstore API reference">
      <ApiReferenceClient
        specUrl="https://petstore3.swagger.io/api/v3/openapi.json"
        profile="petstore"
        downloadUrl="https://petstore3.swagger.io/api/v3/openapi.json"
        specLabel="Petstore OpenAPI JSON"
      />
    </Layout>
  );
}
