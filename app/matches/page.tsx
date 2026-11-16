'use client';

import { useState, useEffect } from 'react';

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleConfirmRecovery = async (matchId: number) => {
    if (!confirm('Confirm pet recovery? This executes stored procedure sp_confirm_recovery inside an atomic ACID transaction.')) {
      return;
    }
    setActionLoading(matchId);
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_id: matchId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('🎉 Recovery confirmed! Pet status set to REUNITED, lost report resolved, and shelter capacity updated.');
        fetchMatches();
      } else {
        alert(data.error || 'Failed to confirm recovery');
      }
    } catch (e) {
      alert('Transaction error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">Automated Match Engine &amp; Recovery Workflow</h1>
          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs font-bold">
            ACID Transaction • sp_confirm_recovery
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Automated feature correlation scoring. Confirming a recovery executes <code>sp_confirm_recovery</code> with <code>SAVEPOINT</code> and <code>ROLLBACK</code> protection.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-8 text-center text-slate-400 text-xs">Evaluating candidate matches from MySQL...</div>
        ) : matches.length === 0 ? (
          <div className="col-span-2 p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
            No pending candidate matches found.
          </div>
        ) : (
          matches.map((m) => {
            const isConfirmed = m.status === 'CONFIRMED';
            return (
              <div key={m.match_id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono text-slate-500">Match Pair #{m.match_id}</span>
                    <h3 className="font-bold text-white text-base">
                      {m.lost_pet_name} ↔ Found Stray #{m.found_report_id}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-amber-400">{m.match_score}%</span>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Similarity Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Missing Pet:</span>
                    <strong className="text-slate-200">{m.lost_pet_name} ({m.species})</strong>
                    <p className="text-slate-400 mt-0.5">Breed: {m.breed}</p>
                    <p className="text-slate-400">Lost At: {m.last_seen_address}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Rescued Stray:</span>
                    <strong className="text-slate-200">{m.found_species} ({m.found_breed})</strong>
                    <p className="text-slate-400 mt-0.5">Color: {m.found_color}</p>
                    <p className="text-slate-400">Found At: {m.found_address}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">
                    Status: <strong className={isConfirmed ? 'text-emerald-400' : 'text-amber-400'}>{m.status}</strong>
                  </span>
                  {!isConfirmed && (
                    <button
                      onClick={() => handleConfirmRecovery(m.match_id)}
                      disabled={actionLoading === m.match_id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded transition disabled:opacity-50"
                    >
                      {actionLoading === m.match_id ? 'Executing Procedure...' : '✅ Confirm Recovery (ACID)'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}