'use client';

import { useState, useEffect } from 'react';

export default function SightingsPage() {
  const [sightings, setSightings] = useState<any[]>([]);
  const [radius, setRadius] = useState('5000'); // meters
  const [zone, setZone] = useState('Indiranagar');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form for new sighting
  const [form, setForm] = useState({
    lost_report_id: 1,
    description: 'Spotted golden dog roaming near metro station',
    address: 'Indiranagar 100ft Road, Bengaluru',
    confidence_level: 'LIKELY',
  });

  const fetchSightings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sightings?zone=${zone}&radius=${radius}`);
      const data = await res.json();
      setSightings(data.sightings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSightings();
  }, [zone, radius]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sightings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        fetchSightings();
      }
    } catch (e) {
      alert('Failed to log sighting');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Crowdsourced Sightings</h1>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold">
              MongoDB 2dsphere
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sub-second geospatial proximity filtering across Bengaluru via MongoDB <code>$geoNear</code> aggregation pipeline
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-sm transition"
        >
          + Log Sighting (GPS)
        </button>
      </div>

      {/* Geospatial Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center gap-4 text-xs">
        <div>
          <label className="block text-slate-400 font-semibold mb-1">Center Locality (Bengaluru):</label>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white font-medium"
          >
            <option value="Indiranagar">Indiranagar (12.9784, 77.6408)</option>
            <option value="Koramangala">Koramangala (12.9352, 77.6245)</option>
            <option value="Whitefield">Whitefield (12.9698, 77.7499)</option>
            <option value="HSR Layout">HSR Layout (12.9121, 77.6446)</option>
            <option value="Jayanagar">Jayanagar (12.9250, 77.5938)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1">Search Radius: {(Number(radius) / 1000).toFixed(1)} km</label>
          <input
            type="range"
            min="1000"
            max="15000"
            step="1000"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="w-36 accent-emerald-500"
          />
        </div>

        <div className="ml-auto text-slate-400">
          Showing <strong>{sightings.length}</strong> geo-indexed sightings
        </div>
      </div>

      {/* Sighting Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-sm">
            <h2 className="text-lg font-bold text-white mb-4">Log Sighting with GeoJSON Coordinates</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Linked Lost Report ID</label>
                <input
                  type="number"
                  required
                  value={form.lost_report_id}
                  onChange={(e) => setForm({ ...form, lost_report_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Landmark Address</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Confidence Level</label>
                <select
                  value={form.confidence_level}
                  onChange={(e) => setForm({ ...form, confidence_level: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                >
                  <option value="CERTAIN">CERTAIN (100% sure)</option>
                  <option value="LIKELY">LIKELY (Strong resemblance)</option>
                  <option value="UNSURE">UNSURE (Similar appearance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Observation Details</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
                >
                  Save Sighting (MongoDB)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sightings Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-8 text-center text-slate-400 text-xs">Executing MongoDB $geoNear aggregation...</div>
        ) : sightings.length === 0 ? (
          <div className="col-span-2 p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
            No sightings logged within {(Number(radius) / 1000).toFixed(1)} km of {zone}. Try expanding your search radius.
          </div>
        ) : (
          sightings.map((s, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-emerald-400">
                    📍 {s.distance_km ? `${s.distance_km} km away` : 'Near target locality'}
                  </span>
                  <h3 className="font-bold text-white text-base mt-0.5">{s.address}</h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    s.confidence_level === 'CERTAIN'
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-900/60 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {s.confidence_level}
                </span>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800/80">
                &ldquo;{s.description}&rdquo;
              </p>

              <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>Lost Report Ref: <strong>#{s.lost_report_id}</strong></span>
                <span>Coordinates: <code>[{s.location?.coordinates?.[0]}, {s.location?.coordinates?.[1]}]</code></span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}