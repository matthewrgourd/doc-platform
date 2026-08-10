"use client";

import { useState } from "react";

const docsets = [
  { id: "devdocify", name: "DevDocify", routes: 14, versioned: false },
  { id: "tfl", name: "Transport for London", routes: 15, versioned: false },
  { id: "petstore", name: "Petstore", routes: 20, versioned: false },
  { id: "platzi", name: "Platzi Fake Store", routes: 11, versioned: false },
];

const initialDomainConfig = {
  primaryDomain: "www.devdocify.com",
  aliases: [{ domain: "devdocify.com", redirectToPrimary: true }],
  legacyRedirects: [
    {
      fromDomain: "old-docs.example.com",
      toDomain: "www.devdocify.com",
      statusCode: 308,
      preservePath: true,
    },
  ],
};

const rbacRoles = [
  {
    principal: "matthewrgourd",
    role: "admin",
    assignedAt: "2026-04-03T09:00:00Z",
  },
  {
    principal: "team:docs-team",
    role: "maintainer",
    assignedAt: "2026-04-03T09:00:00Z",
  },
  {
    principal: "team:engineers",
    role: "contributor",
    assignedAt: "2026-04-03T09:00:00Z",
  },
];

export default function PortalsPage() {
  const [domainConfig, setDomainConfig] = useState(initialDomainConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleDomainChange(field: string, value: string) {
    setDomainConfig((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    setSaved(true);
  }

  return (
    <>
      <h1>Portals</h1>

      <section className="section">
        <h2>Docsets</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Routes</th>
              <th>Versioned</th>
            </tr>
          </thead>
          <tbody>
            {docsets.map((ds) => (
              <tr key={ds.id}>
                <td><code>{ds.id}</code></td>
                <td>{ds.name}</td>
                <td>{ds.routes}</td>
                <td>{ds.versioned ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section">
        <h2>Domain configuration</h2>
        <div className="form-group">
          <label htmlFor="primaryDomain">Primary domain</label>
          <input
            id="primaryDomain"
            type="text"
            value={domainConfig.primaryDomain}
            onChange={(e) => handleDomainChange("primaryDomain", e.target.value)}
          />
        </div>

        <h3>Aliases</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Domain</th>
              <th>Redirect to primary</th>
            </tr>
          </thead>
          <tbody>
            {domainConfig.aliases.map((alias) => (
              <tr key={alias.domain}>
                <td>{alias.domain}</td>
                <td>{alias.redirectToPrimary ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Legacy redirects</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Preserve path</th>
            </tr>
          </thead>
          <tbody>
            {domainConfig.legacyRedirects.map((r) => (
              <tr key={r.fromDomain}>
                <td>{r.fromDomain}</td>
                <td>{r.toDomain}</td>
                <td>{r.statusCode}</td>
                <td>{r.preservePath ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section">
        <h2>RBAC assignments</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Principal</th>
              <th>Role</th>
              <th>Assigned</th>
            </tr>
          </thead>
          <tbody>
            {rbacRoles.map((r) => (
              <tr key={r.principal}>
                <td>{r.principal}</td>
                <td><span className={`badge badge-${r.role}`}>{r.role}</span></td>
                <td>{new Date(r.assignedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="form-actions">
        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
        {saved && <span className="save-success">Saved</span>}
      </div>
    </>
  );
}
