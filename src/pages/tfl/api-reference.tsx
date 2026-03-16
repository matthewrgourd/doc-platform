import React from 'react';
import Layout from '@theme/Layout';
import ApiReferenceClient from '@site/src/components/ApiReferenceClient';

export default function TflApiReferencePage(): React.JSX.Element {
  return (
    <Layout title="TfL API reference">
      <ApiReferenceClient specUrl="https://api.tfl.gov.uk/swagger/docs/v1" />
    </Layout>
  );
}
