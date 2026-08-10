"use client";

import { useState } from "react";

type Period = "7d" | "30d";

const data = {
  "7d": {
    pageViews: 4218,
    searchQueries: 312,
    topPages: [
      { path: "/docs/tutorials/quickstart", views: 842 },
      { path: "/docs/how-to/deploy", views: 631 },
      { path: "/tfl/getting-started/quickstart", views: 524 },
      { path: "/petstore/pets/find-by-status", views: 418 },
      { path: "/docs/reference/route-manifest", views: 389 },
    ],
    byDocset: [
      { docset: "devdocify", views: 1876 },
      { docset: "tfl", views: 1102 },
      { docset: "petstore", views: 834 },
      { docset: "platzi", views: 406 },
    ],
  },
  "30d": {
    pageViews: 16842,
    searchQueries: 1247,
    topPages: [
      { path: "/docs/tutorials/quickstart", views: 3241 },
      { path: "/docs/how-to/deploy", views: 2518 },
      { path: "/tfl/getting-started/quickstart", views: 2103 },
      { path: "/petstore/pets/find-by-status", views: 1672 },
      { path: "/docs/reference/route-manifest", views: 1408 },
    ],
    byDocset: [
      { docset: "devdocify", views: 7504 },
      { docset: "tfl", views: 4408 },
      { docset: "petstore", views: 3336 },
      { docset: "platzi", views: 1594 },
    ],
  },
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("7d");
  const current = data[period];

  return (
    <>
      <h1>Analytics</h1>

      <div className="period-toggle">
        <button
          className={period === "7d" ? "active" : ""}
          onClick={() => setPeriod("7d")}
        >
          Last 7 days
        </button>
        <button
          className={period === "30d" ? "active" : ""}
          onClick={() => setPeriod("30d")}
        >
          Last 30 days
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Page views</div>
          <div className="value">{current.pageViews.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="label">Search queries</div>
          <div className="value">{current.searchQueries.toLocaleString()}</div>
        </div>
      </div>

      <section className="section">
        <h2>Top pages</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Page</th>
              <th>Views</th>
            </tr>
          </thead>
          <tbody>
            {current.topPages.map((p) => (
              <tr key={p.path}>
                <td><code>{p.path}</code></td>
                <td>{p.views.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section">
        <h2>By docset</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Docset</th>
              <th>Views</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {current.byDocset.map((d) => (
              <tr key={d.docset}>
                <td>{d.docset}</td>
                <td>{d.views.toLocaleString()}</td>
                <td>
                  {((d.views / current.pageViews) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
