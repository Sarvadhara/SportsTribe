"use client";

export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="px-6 md:px-8 lg:px-10 py-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-st-text/60">SportsTribe Admin</h2>
            <p className="text-st-white text-lg font-semibold leading-tight">Manage tournaments, communities, players, and news with confidence.</p>
            <p className="text-sm text-st-text/60">All updates sync instantly with the public experience.</p>
          </div>

          <div className="flex flex-col gap-3 text-sm text-st-text/60 md:text-right">
            <span className="font-medium text-st-white">Need help?</span>
            <a href="mailto:support@sportstribe.com" className="text-st-white/80 hover:text-white transition-colors">support@sportstribe.com</a>
            <a href="tel:+91XXXXXXXXXX" className="text-st-white/80 hover:text-white transition-colors">+91 XXX XXX XXXX</a>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4 text-xs text-st-text/60 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <span>© {currentYear} SportsTribe • Admin Console</span>
          <span>Privacy • Accountability • Real-time Updates</span>
        </div>
      </div>
    </footer>
  );
}
