import { Link, Outlet, useLocation } from 'react-router-dom';
import { Network, Microchip, GraduationCap } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const navLinks = [
    { name: 'Detector Dashboard', path: '/dashboard', icon: <Microchip size={18} /> },
    { name: 'Educational Hub', path: '/learn', icon: <GraduationCap size={18} /> },
  ];

  return (
    <div className="flex h-screen w-full bg-[var(--bg-dark)] overflow-hidden">
      {/* Sidebar */}
      <nav className="w-[280px] bg-[var(--sidebar-bg)] border-r border-white/10 p-8 flex flex-col shrink-0">
        <div className="font-black text-[var(--accent-primary)] mb-12 text-[1.2rem] tracking-[2px] flex items-center gap-3">
          <Network size={24} /> NEURAL CIPHER
        </div>
        
        <div className="flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`p-4 flex items-center gap-[15px] no-underline rounded-xl cursor-pointer transition-all duration-300 ${
                  isActive 
                    ? 'bg-[var(--glass)] text-white border-l-4 border-[var(--accent-primary)]' 
                    : 'text-[#64748b] hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                <span className={isActive ? 'font-medium' : ''}>{link.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Stage */}
      <main className="flex-1 p-10 overflow-y-auto scroll-smooth animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}