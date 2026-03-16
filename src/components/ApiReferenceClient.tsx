import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {ApiReferenceReact} from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import '@scalar/docusaurus/dist/theme.css';

type ApiReferenceClientProps = {
  specUrl: string;
  profile: 'petstore' | 'tfl';
  downloadUrl: string;
  specLabel: string;
};

type JsonObject = Record<string, any>;

function setParamDefault(parameter: JsonObject, value: any): void {
  if (!parameter || typeof parameter !== 'object') {
    return;
  }
  parameter.example = parameter.example ?? value;
  if (parameter.schema && typeof parameter.schema === 'object') {
    parameter.schema.default = parameter.schema.default ?? value;
    parameter.schema.example = parameter.schema.example ?? value;
  } else {
    parameter.default = parameter.default ?? value;
  }
}

function applyPetstorePlaygroundDefaults(spec: JsonObject): JsonObject {
  const paths = spec.paths ?? {};

  const byStatus = paths['/pet/findByStatus']?.get?.parameters;
  if (Array.isArray(byStatus)) {
    const status = byStatus.find((p: JsonObject) => p.name === 'status');
    if (status) setParamDefault(status, 'available');
  }

  const userLogin = paths['/user/login']?.get?.parameters;
  if (Array.isArray(userLogin)) {
    const username = userLogin.find((p: JsonObject) => p.name === 'username');
    const password = userLogin.find((p: JsonObject) => p.name === 'password');
    if (username) setParamDefault(username, 'theUser');
    if (password) setParamDefault(password, '12345');
  }

  return spec;
}

function applyTflPlaygroundDefaults(spec: JsonObject): JsonObject {
  const paths = spec.paths ?? {};

  const lineStatus = paths['/Line/Mode/{modes}/Status']?.get?.parameters;
  if (Array.isArray(lineStatus)) {
    const modes = lineStatus.find((p: JsonObject) => p.name === 'modes');
    const detail = lineStatus.find((p: JsonObject) => p.name === 'detail');
    if (modes) setParamDefault(modes, 'tube');
    if (detail) setParamDefault(detail, false);
  }

  const stopSearch = paths['/StopPoint/Search/{query}']?.get?.parameters;
  if (Array.isArray(stopSearch)) {
    const query = stopSearch.find((p: JsonObject) => p.name === 'query');
    if (query) setParamDefault(query, 'waterloo');
  }

  return spec;
}

function applyPlaygroundDefaults(spec: JsonObject, profile: 'petstore' | 'tfl'): JsonObject {
  if (profile === 'petstore') {
    return applyPetstorePlaygroundDefaults(spec);
  }
  return applyTflPlaygroundDefaults(spec);
}

function ApiReferenceRenderer({
  specUrl,
  profile,
  downloadUrl,
  specLabel,
}: ApiReferenceClientProps): React.JSX.Element {
  const [spec, setSpec] = React.useState<JsonObject | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    async function loadSpec(): Promise<void> {
      try {
        const res = await fetch(specUrl);
        if (!res.ok) {
          throw new Error(`Spec request failed with status ${res.status}`);
        }
        const raw = (await res.json()) as JsonObject;
        const patched = applyPlaygroundDefaults(raw, profile);
        if (active) {
          setSpec(patched);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load API spec');
        }
      }
    }

    loadSpec();
    return () => {
      active = false;
    };
  }, [profile, specUrl]);

  if (error) {
    return (
      <section className="container padding-vert--lg">
        <h2>Playground unavailable</h2>
        <p>We could not load the API specification.</p>
        <p>{error}</p>
      </section>
    );
  }

  if (!spec) {
    return (
      <section className="container padding-vert--lg">
        <h2>Loading API playground</h2>
        <p>The interactive reference is loading. This can take a few seconds on first load.</p>
        <p>
          If loading fails, use the header link or download the spec directly:{' '}
          <a href={downloadUrl}>{specLabel}</a>.
        </p>
      </section>
    );
  }

  return (
    <ApiReferenceReact
      configuration={{
        _integration: 'docusaurus',
        content: spec,
        hideModels: false,
      }}
    />
  );
}

export default function ApiReferenceClient(props: ApiReferenceClientProps): React.JSX.Element {
  return <BrowserOnly>{() => <ApiReferenceRenderer {...props} />}</BrowserOnly>;
}
