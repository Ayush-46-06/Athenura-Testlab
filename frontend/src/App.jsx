import {useState} from 'react';
import Sidebar from './components/Sidebar';
import RequestBuilder from './components/RequestBuilder';
import {Collections,Security,Monitoring,History} from './components/Pages';
import {X, Menu} from 'lucide-react';

export default function App() {
  const [active,setActive]=useState('collections');
  const [activeWorkspace,setActiveWorkspace]=useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const [tabs, setTabs] = useState([{ id: 'default', request: null }]);
  const [activeTabId, setActiveTabId] = useState('default');

  function openRequest(req) {
    if (!req) {
      const newTab = { id: Date.now().toString(), request: null };
      setTabs([...tabs, newTab]);
      setActiveTabId(newTab.id);
      setActive('request');
      return;
    }
    const existing = tabs.find(t => t.request?._id === req._id);
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const newTab = { id: Date.now().toString(), request: req };
      setTabs([...tabs, newTab]);
      setActiveTabId(newTab.id);
    }
    setActive('request');
    setIsMobileOpen(false);
  }

  function handleNavChange(id) {
    setActive(id);
    setIsMobileOpen(false);
  }

  function closeTab(e, id) {
    e.stopPropagation();
    const newTabs = tabs.filter(t => t.id !== id);
    if (newTabs.length === 0) {
      const freshTab = { id: Date.now().toString(), request: null };
      setTabs([freshTab]);
      setActiveTabId(freshTab.id);
    } else if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
    setTabs(newTabs);
  }

  return (
    <div className="h-screen flex bg-main text-textMain overflow-hidden font-sans selection:bg-accent/20">
      
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed top-[26px] right-4 z-50 p-2.5 bg-white text-textMain hover:text-accent rounded-[12px] shadow-sm border border-line/40 transition-colors" 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20}/> : <Menu size={20}/>}
      </button>

      {/* Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-textMain/20 backdrop-blur-sm z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar active={active} setActive={handleNavChange} activeWorkspace={activeWorkspace} setActiveRequest={openRequest} />
      </div>

      <main className="flex-1 min-w-0 h-full relative flex flex-col">
        {/* Tab Bar */}
        {active === 'request' && (
          <div className="h-12 bg-white/50 border-b border-line/50 flex overflow-x-auto shrink-0 items-end px-2 pt-2 gap-1 backdrop-blur-md z-20">
            {tabs.map(t => (
              <div 
                key={t.id}
                onClick={() => setActiveTabId(t.id)}
                className={`group flex items-center gap-3 px-4 py-2 rounded-t-[12px] min-w-[140px] max-w-[200px] cursor-pointer transition-all border-t border-x ${
                  activeTabId === t.id ? 'bg-main border-line/50 text-accent font-semibold shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)] relative z-10' : 'bg-transparent border-transparent text-textMuted hover:bg-white hover:text-textMain'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${t.request ? 'bg-accentOrange' : 'bg-line'}`}></div>
                <span className="truncate text-sm flex-1 select-none">{t.request ? t.request.name || 'Untitled' : 'New Request'}</span>
                <button onClick={(e) => closeTab(e, t.id)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-line/50 rounded-md transition-all">
                  <X size={14}/>
                </button>
                {activeTabId === t.id && <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-main"></div>}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex-1 min-h-0 relative">
          {active==='request' && tabs.map(t => (
            <div key={t.id} className="absolute inset-0" style={{ display: activeTabId === t.id ? 'block' : 'none' }}>
              <RequestBuilder 
                activeWorkspace={activeWorkspace} 
                activeRequest={t.request} 
                setActiveRequest={(updatedReq) => {
                  setTabs(tabs.map(tab => tab.id === t.id ? { ...tab, request: updatedReq } : tab));
                }} 
              />
            </div>
          ))}
          {active==='collections' && <Collections setActive={setActive} activeWorkspace={activeWorkspace} setActiveWorkspace={setActiveWorkspace} setActiveRequest={openRequest} />}
          {active==='history' && <History setActiveRequest={openRequest} />}
          {active==='security' && <Security/>}
          {active==='monitoring' && <Monitoring/>}
        </div>
      </main>
    </div>
  );
}
