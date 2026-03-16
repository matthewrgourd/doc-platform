import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {ApiReferenceReact} from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import '@scalar/docusaurus/dist/theme.css';

type ApiReferenceClientProps = {
  specUrl: string;
};

export default function ApiReferenceClient({specUrl}: ApiReferenceClientProps): React.JSX.Element {
  return (
    <BrowserOnly>
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
