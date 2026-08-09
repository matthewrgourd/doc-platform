import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <h1>Dashboard</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
        Welcome back, {user?.email}
      </p>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Portals</div>
          <div className="value">2</div>
        </div>
        <div className="stat-card">
          <div className="label">Deployments (7d)</div>
          <div className="value">12</div>
        </div>
        <div className="stat-card">
          <div className="label">Page views (7d)</div>
          <div className="value">4,218</div>
        </div>
        <div className="stat-card">
          <div className="label">Custom domains</div>
          <div className="value">1</div>
        </div>
      </div>
    </>
  );
}
