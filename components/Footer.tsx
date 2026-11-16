export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 mt-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-200">Lost Pet Identification & Recovery Network</p>
          <p className="text-xs text-slate-400">UE23CS351A – DBMS Project (Level 3 Experiential Learning)</p>
          <p className="text-xs text-slate-500">PES University, Bengaluru | Faculty Guide: Dr. Nagasundari S</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-300">
            Team: Harshitha Vangaveti (<span className="text-amber-400">PES2UG24AM064</span>) &amp; Hamsa M N (<span className="text-amber-400">PES2UG24AM060</span>)
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Hybrid Architecture: MySQL 8.0 (ACID) + MongoDB 7.0 (2dsphere GeoJSON)
          </p>
        </div>
      </div>
    </footer>
  );
}