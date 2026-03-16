import React from 'react';
import Layout from '@theme/Layout';
import ApiReferenceClient from '@site/src/components/ApiReferenceClient';

export default function PetstoreApiPlaygroundPage(): React.JSX.Element {
  return (
    <Layout title="Petstore API playground">
      <ApiReferenceClient
        specUrl="/openapi/petstore-playground.json"
        profile="petstore"
        downloadUrl="/openapi/petstore-playground.json"
        specLabel="Petstore demo OpenAPI JSON"
      />
    </Layout>
  );
}
