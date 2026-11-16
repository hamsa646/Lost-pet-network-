'use client';

import { useState, useEffect } from 'react';

export default function PetsPage() {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    species: 'DOG',
    breed: '',
    color: '',
    distinctive_features: '',
    microchip_id: '',
  });

  const fetchPets = async () => {
    try {
      const res = await fetch('/api/pets');
      const data = await res.json();
      setPets(data.pets || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', species: 'DOG', breed: '', color: '', distinctive_features: '', microchip_id: '' });
        fetchPets();
      }
    } catch (e) {
      alert('Failed to register pet');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Registered Pets Registry</h1>
          <p className="text-xs text-slate-400">Relational schema representation (Table: <code>pets</code>)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-sm transition"
        >
          + Register New Pet
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-sm">
            <h2 className="text-lg font-bold text-white mb-4">Register Companion Animal</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Pet Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Species</label>
                  <select
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                  >
                    <option value="DOG">Dog</option>
                    <option value="CAT">Cat</option>
                    <option value="BIRD">Bird</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Breed</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Golden Retriever"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Color</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Golden / Cream"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Microchip ID (RFID)</label>
                  <input
                    type="text"
                    placeholder="981098102938471"
                    value={formData.microchip_id}
                    onChange={(e) => setFormData({ ...formData, microchip_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Distinctive Features</label>
                <textarea
                  placeholder="White patch on chest, clipped left ear, blue collar..."
                  value={formData.distinctive_features}
                  onChange={(e) => setFormData({ ...formData, distinctive_features: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                  rows={2}
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
                  Save Pet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pet Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading pet registry from MySQL...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Pet ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Species / Breed</th>
                <th className="px-6 py-3">Color</th>
                <th className="px-6 py-3">Microchip ID</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 text-xs">
              {pets.map((p) => (
                <tr key={p.pet_id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-3 font-mono text-slate-500">#{p.pet_id}</td>
                  <td className="px-6 py-3 font-bold text-white">{p.name}</td>
                  <td className="px-6 py-3">{p.species} • {p.breed}</td>
                  <td className="px-6 py-3 text-slate-400">{p.color}</td>
                  <td className="px-6 py-3 font-mono text-xs text-amber-300">{p.microchip_id || 'None'}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        p.status === 'HOME'
                          ? 'bg-blue-900/60 text-blue-300 border border-blue-500/30'
                          : p.status === 'LOST'
                          ? 'bg-red-900/60 text-red-300 border border-red-500/30'
                          : 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}