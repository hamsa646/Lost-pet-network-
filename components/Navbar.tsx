'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    // Check local session
    const stored = localStorage.getItem('pet_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('pet_user');
    setUser(null);
    window.location.href = '/login';
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/pets', label: 'My Pets' },
    { href: '/reports', label: 'Lost & Found' },
    { href: '/sightings', label: 'Sightings (Geo)' },
    { href: '/matches', label: 'Matches' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-amber-400">
            <span>🐾</span>
            <span>LostPet Network</span>
          </Link>

          <div className="hidden md:flex space-x-4">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    active ? 'bg-amber-500 text-slate-900 font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full text-slate-300">
                  {user.name} <strong className="text-amber-400">({user.role})</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-1.5 rounded text-sm font-semibold transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}