import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <p className="sample-data-notice" role="note">
          <strong>Sample data.</strong> These pages are a demo: the numbers,
          deployments and users are not live, and changes are not saved.
        </p>
        {children}
      </main>
    </div>
  );
}
