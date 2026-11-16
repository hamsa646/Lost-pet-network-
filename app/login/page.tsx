'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: 'harshitha@example.com',
    password: 'password123',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CITIZEN',
    address: 'Indiranagar, Bengaluru',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isRegister ? 'register' : 'login',
          ...formData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store in localStorage for client state
      localStorage.setItem('pet_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
      <div className="text-center mb-6">
        <span className="text-4xl">🐾</span>
        <h2 className="text-2xl font-bold text-white mt-2">
          {isRegister ? 'Create an Account' : 'Sign in to LostPet Network'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {isRegister ? 'Join Bengaluru pet recovery community' : 'Access your pet records and recovery alerts'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-500/50 rounded text-red-200 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {isRegister && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Role in Network</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
              >
                <option value="CITIZEN">Pet Owner / Citizen</option>
                <option value="SHELTER_STAFF">Shelter Staff</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
              <input
                type="text"
                required
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
        >
          {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-800 text-center">
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-xs text-amber-400 hover:underline font-medium"
        >
          {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register here"}
        </button>
      </div>

      <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded text-xs text-slate-400">
        <p className="font-semibold text-slate-300 mb-1">Demo Credentials for Evaluator:</p>
        <p>• Admin: <code>admin@lostpet.org</code> / <code>admin123</code></p>
        <p>• Citizen: <code>harshitha@example.com</code> / <code>password123</code></p>
      </div>
    </div>
  );
}