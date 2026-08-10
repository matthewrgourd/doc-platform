import { createClient } from "@/lib/supabase/server";

const productionDeploy = {
  commit: "a87d0c7",
  message: "Merge pull request #54 from matthewrgourd/feature/custom-domains",
  timestamp: "2026-08-08T14:23:00Z",
  status: "ready" as const,
  url: "https://www.devdocify.com",
};

const previewDeploys = [
  {
    pr: 55,
    branch: "feat/helm-chart",
    commit: "54c6634",
    timestamp: "2026-08-09T10:15:00Z",
    status: "ready" as const,
    url: "https://doc-platform-feat-helm-chart.vercel.app",
  },
];

const domainStatus = [
  { domain: "www.devdocify.com", verified: true, ssl: true },
  { domain: "devdocify.com", verified: true, ssl: true },
  { domain: "docs.example.com", verified: false, ssl: false },
];

function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

export default async function DeploymentsPage() {
  const supabase = await createClient();
  await supabase.auth.getUser();

  return (
    <>
      <h1>Deployments</h1>

      <section className="section">
        <h2>Production</h2>
        <div className="deploy-card">
          <div className="deploy-header">
            <StatusBadge status={productionDeploy.status} />
            <code>{productionDeploy.commit}</code>
            <span className="text-muted">
              {new Date(productionDeploy.timestamp).toLocaleString()}
            </span>
          </div>
          <p className="deploy-message">{productionDeploy.message}</p>
          <a
            href={productionDeploy.url}
            target="_blank"
            rel="noopener noreferrer"
            className="deploy-link"
          >
            {productionDeploy.url}
          </a>
        </div>
      </section>

      <section className="section">
        <h2>Preview deployments</h2>
        {previewDeploys.length === 0 ? (
          <p className="text-muted">No active preview deployments.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>PR</th>
                <th>Branch</th>
                <th>Commit</th>
                <th>Status</th>
                <th>Time</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              {previewDeploys.map((d) => (
                <tr key={d.pr}>
                  <td>#{d.pr}</td>
                  <td><code>{d.branch}</code></td>
                  <td><code>{d.commit}</code></td>
                  <td><StatusBadge status={d.status} /></td>
                  <td>{new Date(d.timestamp).toLocaleString()}</td>
                  <td>
                    <a href={d.url} target="_blank" rel="noopener noreferrer">
                      Preview
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="section">
        <h2>Domain verification</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Domain</th>
              <th>Verified</th>
              <th>SSL</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {domainStatus.map((d) => (
              <tr key={d.domain}>
                <td>{d.domain}</td>
                <td>
                  <StatusBadge status={d.verified ? "ready" : "pending"} />
                </td>
                <td>
                  <StatusBadge status={d.ssl ? "ready" : "pending"} />
                </td>
                <td>
                  {!d.verified && (
                    <span className="dns-hint">
                      Add CNAME record pointing to <code>cname.vercel-dns.com</code>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
