import { Box, ShieldCheck, Activity, Folder, Settings, Plus, ChevronRight, Clock } from 'lucide-react';
import AthenuraLogo from '../public/AthenuraCircle.png';
export default function Sidebar({ active, setActive, setActiveRequest }) {
  const items = [
    ['request', 'API Client', Box],
    ['collections', 'Collections', Folder],
    ['history', 'History', Clock],
    ['security', 'Security Scan', ShieldCheck],
    ['monitoring', 'Monitoring', Activity]
  ];

  return (
    <aside className="w-[280px] shrink-0 bg-main min-h-screen flex flex-col pt-6 pb-4 px-4 border-r border-line/50">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="h-12 w-12 rounded-[16px] bg-white shadow-soft flex items-center justify-center overflow-hidden">
          <img src={AthenuraLogo} alt="Logo" className="w-full h-full object-cover p-1" />
        </div>
        <div>
          <div className="font-bold text-textMain text-[17px]">Athenura TestLab</div>
          <div className="text-[11px] text-textMuted font-medium uppercase tracking-[0.1em] mt-0.5">Workspace</div>
        </div>
      </div>

      <div className="mb-8">
        <button
          onClick={() => { setActiveRequest && setActiveRequest(null); setActive('request'); }}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-panelHover transition-colors rounded-[16px] py-3.5 text-sm font-semibold text-accent shadow-soft border border-line/40">
          <Plus size={18} /> New Request
        </button>
      </div>

      <div className="px-3 pb-2 text-xs font-semibold text-textMuted uppercase tracking-wider">
        Tools
      </div>
      <nav className="space-y-2">
        {items.map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] text-[15px] font-medium transition-all duration-300 ${active === id
                ? 'bg-accent text-white shadow-soft shadow-accent/20'
                : 'text-textMuted hover:bg-white hover:text-textMain hover:shadow-soft border border-transparent'
              }`}
          >
            <Icon size={20} className={active === id ? 'text-white' : 'text-textMuted'} />
            <span>{label}</span>
            {active === id && <ChevronRight size={16} className="ml-auto text-white/70" />}
          </button>
        ))}
      </nav>

      {/* <div className="mt-auto">
        <button className="w-full flex gap-3 items-center px-4 py-3.5 rounded-[16px] text-textMuted hover:text-textMain hover:bg-white hover:shadow-soft text-[15px] font-medium transition-all border border-transparent">
          <Settings size={20} className="text-textMuted"/> Settings
        </button>
      </div> */}
    </aside>
  );
}
