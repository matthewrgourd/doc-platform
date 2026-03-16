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

  const petById = paths['/pet/{petId}']?.get?.parameters;
  if (Array.isArray(petById)) {
    const petId = petById.find((p: JsonObject) => p.name === 'petId');
    if (petId) setParamDefault(petId, 1);
  }

  const orderById = paths['/store/order/{orderId}']?.get?.parameters;
  if (Array.isArray(orderById)) {
    const orderId = orderById.find((p: JsonObject) => p.name === 'orderId');
    if (orderId) setParamDefault(orderId, 1);
  }

  const userLogin = paths['/user/login']?.get?.parameters;
  if (Array.isArray(userLogin)) {
    const username = userLogin.find((p: JsonObject) => p.name === 'username');
    const password = userLogin.find((p: JsonObject) => p.name === 'password');
    if (username) setParamDefault(username, 'demo-user');
    if (password) setParamDefault(password, 'demo-pass');
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

  const lineRoutes = paths['/Line/Route/{ids}']?.get?.parameters;
  if (Array.isArray(lineRoutes)) {
    const ids = lineRoutes.find((p: JsonObject) => p.name === 'ids');
    if (ids) setParamDefault(ids, 'victoria');
  }

  const stopArrivals = paths['/StopPoint/{id}/Arrivals']?.get?.parameters;
  if (Array.isArray(stopArrivals)) {
    const id = stopArrivals.find((p: JsonObject) => p.name === 'id');
    if (id) setParamDefault(id, '490008660N');
  }

  const stopSearch = paths['/StopPoint/Search/{query}']?.get?.parameters;
  if (Array.isArray(stopSearch)) {
    const query = stopSearch.find((p: JsonObject) => p.name === 'query');
    if (query) setParamDefault(query, 'waterloo');
  }

  const journey = paths['/Journey/JourneyResults/{from}/to/{to}']?.get?.parameters;
  if (Array.isArray(journey)) {
    const from = journey.find((p: JsonObject) => p.name === 'from');
    const to = journey.find((p: JsonObject) => p.name === 'to');
    if (from) setParamDefault(from, '940GZZLUKSX');
    if (to) setParamDefault(to, '940GZZLUOXC');
  }

  return spec;
}

function applyPlaygroundDefaults(spec: JsonObject, profile: 'petstore' | 'tfl'): JsonObject {
  if (profile === 'petstore') {
    return applyPetstorePlaygroundDefaults(spec);
  }
  return applyTflPlaygroundDefaults(spec);
}

function getAuthentication(profile: 'petstore' | 'tfl'): JsonObject | undefined {
  if (profile === 'tfl') {
    return {
      preferredSecurityScheme: ['apiKey', 'appId'],
      securitySchemes: {
        apiKey: {value: 'YOUR_TFL_APP_KEY'},
        appId: {value: 'YOUR_TFL_APP_ID'},
      },
    };
  }
  return undefined;
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
        authentication: getAuthentication(profile),
      }}
    />
  );
}

export default function ApiReferenceClient(props: ApiReferenceClientProps): React.JSX.Element {
  return <BrowserOnly>{() => <ApiReferenceRenderer {...props} />}</BrowserOnly>;
}
