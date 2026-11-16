import Link from 'next/link';
import { query } from '@/lib/db';

async function getDashboardData() {
  try {
    const activeLost: any = await query(`
      SELECT lr.report_id, p.name AS pet_name, p.breed, p.species, lr.last_seen_address, lr.bengaluru_zone, lr.reward_amount, lr.last_seen_date
      FROM lost_reports lr
      JOIN pets p ON lr.pet_id = p.pet_id
      WHERE lr.status = 'OPEN'
      ORDER BY lr.last_seen_date DESC
      LIMIT 5
    `);

    const shelterStats: any = await query(`
      SELECT name, current_occupancy, capacity, ROUND((current_occupancy / capacity) * 100, 1) AS occupancy_pct
      FROM shelters
      LIMIT 4
    `);

    const pendingMatches: any = await query(`
      SELECT COUNT(*) AS total FROM potential_matches WHERE status = 'PENDING'
    `);

    return {
      activeLost: activeLost || [],
      shelterStats: shelterStats || [],
      pendingMatchesCount: pendingMatches[0]?.total || 0,
    };
  } catch (e) {
    return { activeLost: [], shelterStats: [], pendingMatchesCount: 0 };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Recovery Operation Dashboard</h1>
          <p className="text-xs text-slate-400">Live feeds from MySQL Views &amp; MongoDB Spatial Indexes</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/reports"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded text-sm transition"
          >
            + File New Report
          </Link>
          <Link
            href="/sightings"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded text-sm transition"
          >
            📍 Log Sighting
          </Link>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-xs text-slate-400 uppercase font-semibold">Active Lost Pet Notices</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-2">{data.activeLost.length} Open Cases</div>
          <p className="text-xs text-slate-500 mt-1">Queried from <code>vw_active_lost_pets</code></p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-xs text-slate-400 uppercase font-semibold">Candidate Matches</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">{data.pendingMatchesCount} Pending Review</div>
          <p className="text-xs text-slate-500 mt-1">Calculated via feature similarity algorithm</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-xs text-slate-400 uppercase font-semibold">Bengaluru Shelter Network</div>
          <div className="text-2xl font-extrabold text-blue-400 mt-2">{data.shelterStats.length} Monitored Facilities</div>
          <p className="text-xs text-slate-500 mt-1">Real-time kennel capacity tracking</p>
        </div>
      </div>

      {/* Recent Lost Pet Notices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-bold text-white text-base">🚨 Priority Missing Pet Broadcasts (Bengaluru)</h2>
          <Link href="/reports" className="text-xs text-amber-400 hover:underline">View All &rarr;</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Pet</th>
                <th className="px-6 py-3">Species / Breed</th>
                <th className="px-6 py-3">Last Seen Location</th>
                <th className="px-6 py-3">Zone</th>
                <th className="px-6 py-3">Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 text-xs">
              {data.activeLost.map((r: any) => (
                <tr key={r.report_id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-3.5 font-bold text-white">{r.pet_name}</td>
                  <td className="px-6 py-3.5">{r.species} • {r.breed}</td>
                  <td className="px-6 py-3.5 text-slate-400">{r.last_seen_address}</td>
                  <td className="px-6 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/20 font-medium">
                      {r.bengaluru_zone}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-emerald-400">
                    ₹{Number(r.reward_amount).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shelter Capacities */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="font-bold text-white text-base mb-4">🏠 Shelter Intake &amp; Capacity Tracker</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {data.shelterStats.map((s: any, idx: number) => (
            <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-200">{s.name}</span>
                <span className="text-slate-400">{s.current_occupancy} / {s.capacity} Kennels ({s.occupancy_pct}%)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${
                    s.occupancy_pct > 80 ? 'bg-red-500' : s.occupancy_pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(s.occupancy_pct, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}