import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {ApiReferenceReact} from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import '@scalar/docusaurus/dist/theme.css';

type ApiProfile = 'petstore' | 'tfl' | 'platzi';

type ApiReferenceClientProps = {
  specUrl: string;
  profile: ApiProfile;
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

function setRequestBodyExample(
  operation: JsonObject | undefined,
  value: JsonObject,
  contentType = 'application/json'
): void {
  if (!operation || typeof operation !== 'object') {
    return;
  }
  const mediaType = operation.requestBody?.content?.[contentType];
  if (!mediaType || typeof mediaType !== 'object') {
    return;
  }
  mediaType.example = mediaType.example ?? value;
  if (mediaType.schema && typeof mediaType.schema === 'object') {
    mediaType.schema.example = mediaType.schema.example ?? value;
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

function applyPlatziPlaygroundDefaults(spec: JsonObject): JsonObject {
  const paths = spec.paths ?? {};

  const products = paths['/products']?.get?.parameters;
  if (Array.isArray(products)) {
    const offset = products.find((p: JsonObject) => p.name === 'offset');
    const limit = products.find((p: JsonObject) => p.name === 'limit');
    if (offset) setParamDefault(offset, 0);
    if (limit) setParamDefault(limit, 10);
  }

  const users = paths['/users']?.get?.parameters;
  if (Array.isArray(users)) {
    const offset = users.find((p: JsonObject) => p.name === 'offset');
    const limit = users.find((p: JsonObject) => p.name === 'limit');
    if (offset) setParamDefault(offset, 0);
    if (limit) setParamDefault(limit, 10);
  }

  const locations = paths['/locations']?.get?.parameters;
  if (Array.isArray(locations)) {
    const size = locations.find((p: JsonObject) => p.name === 'size');
    if (size) setParamDefault(size, 5);
  }

  setRequestBodyExample(paths['/users/is-available']?.post, {
    email: 'john@mail.com',
  });

  setRequestBodyExample(paths['/auth/login']?.post, {
    email: 'john@mail.com',
    password: 'changeme',
  });

  setRequestBodyExample(paths['/auth/refresh-token']?.post, {
    refreshToken: '<refresh_token>',
  });

  return spec;
}

function applyPlaygroundDefaults(spec: JsonObject, profile: ApiProfile): JsonObject {
  if (profile === 'petstore') {
    return applyPetstorePlaygroundDefaults(spec);
  }
  if (profile === 'platzi') {
    return applyPlatziPlaygroundDefaults(spec);
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
