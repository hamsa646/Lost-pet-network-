'use client';

import { useState, useEffect } from 'react';

export default function ReportsPage() {
  const [tab, setTab] = useState<'LOST' | 'FOUND'>('LOST');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form fields
  const [petId, setPetId] = useState('1');
  const [species, setSpecies] = useState('DOG');
  const [breed, setBreed] = useState('Golden Retriever');
  const [color, setColor] = useState('Golden');
  const [address, setAddress] = useState('12th Main, Indiranagar, Bengaluru');
  const [zone, setZone] = useState('Indiranagar');
  const [reward, setReward] = useState('5000');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?type=${tab}`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [tab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: tab,
          pet_id: petId,
          species,
          breed,
          color,
          address,
          zone,
          reward_amount: reward,
          lat: 12.9784,
          lng: 77.6408,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        fetchReports();
      }
    } catch (e) {
      alert('Failed to submit report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Lost &amp; Found Incident Portal</h1>
          <p className="text-xs text-slate-400">Relational mapping: <code>lost_reports</code> &amp; <code>found_reports</code></p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-sm transition"
        >
          + File {tab === 'LOST' ? 'Lost Pet Report' : 'Found Animal Report'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-sm font-semibold">
        <button
          onClick={() => setTab('LOST')}
          className={`pb-3 px-2 border-b-2 transition ${
            tab === 'LOST' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          🚨 Missing / Lost Pets
        </button>
        <button
          onClick={() => setTab('FOUND')}
          className={`pb-3 px-2 border-b-2 transition ${
            tab === 'FOUND' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          🛡️ Rescued / Found Animals
        </button>
      </div>

      {/* Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-sm">
            <h2 className="text-lg font-bold text-white mb-4">
              File {tab === 'LOST' ? 'Lost Pet Report' : 'Found Stray / Rescued Pet'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {tab === 'LOST' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Select Registered Pet ID</label>
                  <input
                    type="number"
                    required
                    value={petId}
                    onChange={(e) => setPetId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Species</label>
                    <select
                      value={species}
                      onChange={(e) => setSpecies(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                    >
                      <option value="DOG">Dog</option>
                      <option value="CAT">Cat</option>
                      <option value="BIRD">Bird</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Breed (Estimated)</label>
                    <input
                      type="text"
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Bengaluru Zone</label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                  >
                    <option value="Indiranagar">Indiranagar</option>
                    <option value="Koramangala">Koramangala</option>
                    <option value="Whitefield">Whitefield</option>
                    <option value="HSR Layout">HSR Layout</option>
                    <option value="Jayanagar">Jayanagar</option>
                    <option value="Malleshwaram">Malleshwaram</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Reward (₹)</label>
                  <input
                    type="number"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Landmark Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded font-bold"
                >
                  Submit Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid of Notices */}
      <div className="grid md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-8 text-center text-slate-400 text-xs">Loading incident records...</div>
        ) : (
          reports.map((r) => (
            <div key={r.report_id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-slate-500">Notice #{r.report_id}</span>
                  <h3 className="font-bold text-white text-base mt-0.5">
                    {r.pet_name || `${r.breed} (${r.species})`}
                  </h3>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded text-xs font-bold">
                  {r.bengaluru_zone || 'Bengaluru'}
                </span>
              </div>

              <p className="text-xs text-slate-300">
                📍 <strong>Location:</strong> {r.last_seen_address || r.found_address}
              </p>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">
                  Status: <strong className="text-emerald-400">{r.status || r.custody_status}</strong>
                </span>
                {r.reward_amount && (
                  <span className="font-bold text-amber-400">Reward: ₹{Number(r.reward_amount).toLocaleString('en-IN')}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}