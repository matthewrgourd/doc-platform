"use client";

import { useState } from "react";

type Role = "admin" | "maintainer" | "contributor" | "viewer";

interface User {
  principal: string;
  role: Role;
  docsetId?: string;
  assignedAt: string;
  assignedBy: string;
}

const initialUsers: User[] = [
  {
    principal: "matthewrgourd",
    role: "admin",
    assignedAt: "2026-04-03T09:00:00Z",
    assignedBy: "matthewrgourd",
  },
  {
    principal: "team:docs-team",
    role: "maintainer",
    assignedAt: "2026-04-03T09:00:00Z",
    assignedBy: "matthewrgourd",
  },
  {
    principal: "team:engineers",
    role: "contributor",
    assignedAt: "2026-04-03T09:00:00Z",
    assignedBy: "matthewrgourd",
  },
  {
    principal: "external-reviewer",
    role: "viewer",
    docsetId: "tfl",
    assignedAt: "2026-04-03T09:00:00Z",
    assignedBy: "matthewrgourd",
  },
];

const auditLog = [
  {
    timestamp: "2026-08-09T10:15:00Z",
    actor: "matthewrgourd",
    action: "role.assigned",
    detail: "Assigned viewer role to external-reviewer (docset: tfl)",
  },
  {
    timestamp: "2026-04-03T09:00:00Z",
    actor: "matthewrgourd",
    action: "role.assigned",
    detail: "Assigned contributor role to team:engineers",
  },
  {
    timestamp: "2026-04-03T09:00:00Z",
    actor: "matthewrgourd",
    action: "role.assigned",
    detail: "Assigned maintainer role to team:docs-team",
  },
];

const roles: Role[] = ["admin", "maintainer", "contributor", "viewer"];

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPrincipal, setNewPrincipal] = useState("");
  const [newRole, setNewRole] = useState<Role>("viewer");

  function handleAddUser() {
    if (!newPrincipal.trim()) return;
    setUsers((prev) => [
      ...prev,
      {
        principal: newPrincipal.trim(),
        role: newRole,
        assignedAt: new Date().toISOString(),
        assignedBy: "matthewrgourd",
      },
    ]);
    setNewPrincipal("");
    setNewRole("viewer");
    setShowAddForm(false);
  }

  function handleRemoveUser(principal: string) {
    setUsers((prev) => prev.filter((u) => u.principal !== principal));
  }

  function handleRoleChange(principal: string, role: Role) {
    setUsers((prev) =>
      prev.map((u) => (u.principal === principal ? { ...u, role } : u))
    );
  }

  return (
    <>
      <h1>Settings</h1>

      <section className="section">
        <div className="section-header">
          <h2>Users and access</h2>
          <button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add user"}
          </button>
        </div>

        {showAddForm && (
          <div className="add-user-form">
            <input
              type="text"
              placeholder="GitHub username or team:name"
              value={newPrincipal}
              onChange={(e) => setNewPrincipal(e.target.value)}
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button onClick={handleAddUser}>Add</button>
          </div>
        )}

        <table className="data-table">
          <thead>
            <tr>
              <th>Principal</th>
              <th>Role</th>
              <th>Scope</th>
              <th>Assigned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.principal}>
                <td>{u.principal}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) =>
                      handleRoleChange(u.principal, e.target.value as Role)
                    }
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td>{u.docsetId || "All"}</td>
                <td>{new Date(u.assignedAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn-danger"
                    onClick={() => handleRemoveUser(u.principal)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section">
        <h2>Audit log</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {auditLog.map((entry, i) => (
              <tr key={i}>
                <td>{new Date(entry.timestamp).toLocaleString()}</td>
                <td>{entry.actor}</td>
                <td><code>{entry.action}</code></td>
                <td>{entry.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
