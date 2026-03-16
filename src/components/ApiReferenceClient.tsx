import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {ApiReferenceReact} from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import '@scalar/docusaurus/dist/theme.css';

type ApiReferenceClientProps = {
  specUrl: string;
  downloadUrl: string;
  specLabel: string;
};

export default function ApiReferenceClient({
  specUrl,
  downloadUrl,
  specLabel,
}: ApiReferenceClientProps): React.JSX.Element {
  return (
    <BrowserOnly
      fallback={
        <section className="container padding-vert--lg">
          <h2>Loading API playground</h2>
          <p>The interactive reference is loading. This can take a few seconds on first load.</p>
          <p>
            If loading fails, use the header link or download the spec directly:{' '}
            <a href={downloadUrl}>{specLabel}</a>.
          </p>
        </section>
      }>
      {() => (
        <ApiReferenceReact
          configuration={{
            _integration: 'docusaurus',
            url: specUrl,
            hideModels: false,
          }}
        />
      )}
    </BrowserOnly>
  );
}
