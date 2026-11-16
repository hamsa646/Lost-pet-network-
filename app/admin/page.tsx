import { query } from '@/lib/db';

async function getAdminData() {
  try {
    const auditLogs: any = await query(`
      SELECT log_id, pet_id, old_status, new_status, changed_at
      FROM pet_audit_log
      ORDER BY changed_at DESC
      LIMIT 10
    `);

    const users: any = await query(`
      SELECT user_id, email, CONCAT(first_name, ' ', last_name) AS full_name, role, city, created_at
      FROM users
      ORDER BY user_id ASC
    `);

    const shelterCapacity: any = await query(`
      SELECT shelter_id, name, capacity, current_occupancy, occupancy_percentage, remaining_capacity
      FROM vw_shelter_capacity
    `);

    return { auditLogs: auditLogs || [], users: users || [], shelterCapacity: shelterCapacity || [] };
  } catch (e) {
    return { auditLogs: [], users: [], shelterCapacity: [] };
  }
}

export default async function AdminPage() {
  const data = await getAdminData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">System Administration &amp; Audit Trail</h1>
        <p className="text-xs text-slate-400 mt-1">
          Internal views of MySQL Trigger Audit Logs (<code>pet_audit_log</code>), Shelter Views, and Role Access
        </p>
      </div>

      {/* Trigger Audit Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="font-bold text-white text-base">🛡️ Database Trigger Audit Trail (trg_audit_pet_status_change)</h2>
          <p className="text-xs text-slate-400">Captures all automated state transitions fired by database engine triggers</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Audit Log ID</th>
                <th className="px-6 py-3">Pet ID</th>
                <th className="px-6 py-3">Old Status</th>
                <th className="px-6 py-3">New Status</th>
                <th className="px-6 py-3">Transition Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 text-xs">
              {data.auditLogs.map((log: any) => (
                <tr key={log.log_id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-3 font-mono text-slate-500">#{log.log_id}</td>
                  <td className="px-6 py-3 font-bold text-amber-300">Pet #{log.pet_id}</td>
                  <td className="px-6 py-3 text-slate-400">{log.old_status}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300 border border-emerald-500/20 font-semibold">
                      {log.new_status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-400 font-mono">{new Date(log.changed_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shelter Capacity View */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="font-bold text-white text-base">🏠 Shelter Capacity View (vw_shelter_capacity)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Shelter</th>
                <th className="px-6 py-3">Capacity</th>
                <th className="px-6 py-3">Current Occupancy</th>
                <th className="px-6 py-3">Occupancy %</th>
                <th className="px-6 py-3">Available Kennels</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 text-xs">
              {data.shelterCapacity.map((s: any) => (
                <tr key={s.shelter_id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-3 font-bold text-white">{s.name}</td>
                  <td className="px-6 py-3">{s.capacity}</td>
                  <td className="px-6 py-3">{s.current_occupancy}</td>
                  <td className="px-6 py-3 font-semibold text-amber-400">{s.occupancy_percentage}%</td>
                  <td className="px-6 py-3 font-bold text-emerald-400">{s.remaining_capacity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registered Users */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="font-bold text-white text-base">👥 System Users &amp; Roles</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">User ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">City</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 text-xs">
              {data.users.map((u: any) => (
                <tr key={u.user_id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-3 font-mono text-slate-500">#{u.user_id}</td>
                  <td className="px-6 py-3 font-semibold text-white">{u.full_name}</td>
                  <td className="px-6 py-3 text-slate-400">{u.email}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 text-xs font-semibold">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-400">{u.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}