import {useEffect,useState} from 'react';
import {api} from '../lib/api';
import {Plus,Folder,ShieldCheck,Activity,Play,Search,MoreVertical,Box,ChevronLeft,Clock} from 'lucide-react';

export function Collections({ setActive, activeWorkspace, setActiveWorkspace, setActiveRequest }){
  const [items,setItems]=useState([]);
  
  useEffect(()=>{
    if (!activeWorkspace) {
      api.get('/workspaces').then(r=>setItems(r.data)).catch(()=>{})
    }
  },[activeWorkspace]);
  
  async function create(){
    const r=await api.post('/workspaces',{name:'New Workspace'});
    setItems([r.data,...items])
  }

  if (activeWorkspace) {
    return <WorkspaceDetail 
             workspace={activeWorkspace} 
             goBack={() => setActiveWorkspace(null)} 
             openRequest={(req) => { setActiveRequest(req); setActive('request'); }} 
             createNew={() => { setActiveRequest(null); setActive('request'); }}
           />;
  }

  return (
    <div className="h-full bg-main overflow-auto text-textMain">
      <div className="pt-6 pb-4 md:py-0 md:h-[88px] px-4 md:px-10 md:pr-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-auto mt-2 md:mt-0">
          <div className="text-[11px] text-textMuted font-medium tracking-widest uppercase mb-1.5 flex justify-center md:justify-start items-center gap-2">
            <span>API DEVELOPMENT</span> 
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-textMain flex justify-center md:justify-start items-center gap-3">
            <span className="inline-block w-3 h-3 rounded-full bg-accent shadow-[0_0_10px_rgba(13,118,95,0.5)] shrink-0"></span>
            Collections & Workspaces
          </h1>
        </div>
        <button onClick={create} className="w-full md:w-auto justify-center px-6 py-3 bg-white hover:bg-panelHover rounded-[16px] text-[15px] font-semibold flex items-center gap-2 text-accent shadow-soft border border-line/40 transition-all">
          <Plus size={18}/> New workspace
        </button>
      </div>
      <div className="px-10 pb-10">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {items.map(x=>(
            <div key={x._id} onClick={() => setActiveWorkspace(x)} className="bg-white rounded-[24px] p-8 shadow-soft group cursor-pointer relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start mb-5">
                <div className="w-14 h-14 rounded-[16px] bg-main/50 flex items-center justify-center group-hover:bg-accent/5 transition-colors">
                  <Folder className="text-accent" size={26}/>
                </div>
                <button className="text-textMuted hover:text-textMain p-2 bg-main/30 rounded-full" onClick={(e)=>e.stopPropagation()}>
                  <MoreVertical size={18}/>
                </button>
              </div>
              <h3 className="font-bold text-xl text-textMain mb-2 group-hover:text-accent transition-colors">{x.name}</h3>
              <p className="text-[15px] text-textMuted mb-8 line-clamp-2 leading-relaxed">{x.description||'API workspace for managing endpoints, environments, and team collaboration.'}</p>
              <div className="flex items-center gap-3 text-[13px] font-semibold text-textMuted">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-main rounded-[8px]"><Box size={14}/> Open Workspace</span>
                <span className="px-3 py-1.5 bg-main rounded-[8px]">{new Date(x.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {!items.length&&
            <div className="border-2 border-dashed border-line rounded-[24px] p-12 flex flex-col items-center justify-center text-center col-span-full bg-white/50">
              <div className="w-20 h-20 rounded-[20px] bg-white shadow-soft flex items-center justify-center mb-5">
                <Folder size={32} className="text-accent/50"/>
              </div>
              <h3 className="text-xl font-bold text-textMain mb-3">No workspaces yet</h3>
              <p className="text-textMuted text-[15px] max-w-md mb-8 leading-relaxed">Create your first API workspace to start organizing your requests and environments.</p>
              <button onClick={create} className="px-6 py-3 bg-accent hover:bg-accentHover rounded-[16px] text-[15px] font-semibold flex items-center gap-2 text-white shadow-soft shadow-accent/20 transition-all">
                <Plus size={18}/> Create Workspace
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  );
}

function WorkspaceDetail({ workspace, goBack, openRequest, createNew }) {
  const [requests, setRequests] = useState([]);
  
  useEffect(() => {
    api.get(`/requests?workspaceId=${workspace._id}`).then(r => setRequests(r.data)).catch(()=>{});
  }, [workspace]);

  const methodColors = {
    GET: 'text-accent', POST: 'text-blue-600', PUT: 'text-accentOrange', PATCH: 'text-accentOrange', DELETE: 'text-rose-600'
  };

  return (
    <div className="h-full bg-main overflow-auto text-textMain">
      <div className="pt-4 pb-4 md:py-0 md:h-[88px] px-4 md:px-10 pr-16 md:pr-10 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-line/40 bg-white/50 backdrop-blur-md sticky top-0 z-10 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button onClick={goBack} className="w-10 h-10 rounded-[12px] bg-white shadow-sm flex items-center justify-center text-textMuted hover:text-textMain hover:shadow-soft transition-all shrink-0">
            <ChevronLeft size={20}/>
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-textMuted font-medium tracking-widest uppercase mb-1 flex items-center gap-2">
              <span>Workspace</span> 
            </div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-textMain flex items-center gap-3 truncate">
              {workspace.name}
            </h1>
          </div>
        </div>
        <button onClick={createNew} className="w-full md:w-auto justify-center px-6 py-3 bg-accent hover:bg-accentHover rounded-[16px] text-[15px] font-semibold flex items-center gap-2 text-white shadow-soft shadow-accent/20 transition-all">
          <Plus size={18}/> Create Request
        </button>
      </div>

      <div className="p-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Saved Requests</h2>
          <span className="px-3 py-1 bg-white shadow-sm rounded-full text-xs font-bold text-textMuted">{requests.length} total</span>
        </div>

        <div className="space-y-4">
          {requests.map(req => (
            <div key={req._id} onClick={() => openRequest(req)} className="bg-white rounded-[20px] p-5 shadow-sm hover:shadow-soft flex items-center gap-6 cursor-pointer transition-all border border-transparent hover:border-line group">
              <div className={`w-20 font-black text-[15px] ${methodColors[req.method] || 'text-textMuted'} tracking-widest`}>
                {req.method}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[16px] text-textMain mb-1 truncate">{req.name || 'Untitled Request'}</h3>
                <div className="font-mono text-[13px] text-textMuted truncate">{req.url}</div>
              </div>
              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[12px] font-medium text-textMuted flex items-center gap-1.5"><Clock size={14}/> {new Date(req.updatedAt).toLocaleDateString()}</span>
                <button className="w-10 h-10 rounded-full bg-main flex items-center justify-center text-accent hover:bg-accent/10">
                  <Play size={16} className="ml-1"/>
                </button>
              </div>
            </div>
          ))}

          {!requests.length && (
            <div className="border-2 border-dashed border-line rounded-[24px] p-12 flex flex-col items-center justify-center text-center bg-white/50">
              <div className="w-20 h-20 rounded-[20px] bg-white shadow-soft flex items-center justify-center mb-5">
                <Box size={32} className="text-accent/50"/>
              </div>
              <h3 className="text-xl font-bold text-textMain mb-3">Workspace is empty</h3>
              <p className="text-textMuted text-[15px] max-w-md mb-8 leading-relaxed">You haven't saved any API requests to this workspace yet.</p>
              <button onClick={createNew} className="px-6 py-3 bg-white hover:bg-panelHover rounded-[16px] text-[15px] font-semibold flex items-center gap-2 text-textMain shadow-sm border border-line transition-all">
                <Plus size={18}/> Build first request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export function History({ setActiveRequest }) {
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem('apiHistory') || '[]'));
    } catch(e) {}
  }, []);
  
  const methodColors = {
    GET: 'text-accent', POST: 'text-blue-600', PUT: 'text-accentOrange', PATCH: 'text-accentOrange', DELETE: 'text-rose-600'
  };

  return (
    <div className="h-full bg-main overflow-auto text-textMain">
      <div className="pt-6 pb-4 md:py-0 md:h-[88px] px-4 md:px-10 md:pr-10 flex flex-col md:flex-row items-center justify-between border-b border-line/40 bg-white/50 backdrop-blur-md sticky top-0 z-10 gap-4">
        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-auto mt-2 md:mt-0">
          <div className="text-[11px] text-textMuted font-medium tracking-widest uppercase mb-1 flex justify-center md:justify-start items-center gap-2">
            <span>AUTOMATIC LOG</span> 
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-textMain flex justify-center md:justify-start items-center gap-3">
            <Clock className="text-accent shrink-0" size={24}/>
            Request History
          </h1>
        </div>
        <button onClick={() => { localStorage.removeItem('apiHistory'); setHistory([]); }} className="w-full md:w-auto justify-center px-6 py-3 bg-white hover:bg-rose-50 rounded-[16px] text-[15px] font-semibold flex items-center gap-2 text-rose-500 shadow-sm border border-transparent hover:border-rose-200 transition-all">
          Clear History
        </button>
      </div>

      <div className="p-10 max-w-5xl mx-auto">
        <div className="space-y-4">
          {history.map(item => (
            <div key={item.id} onClick={() => setActiveRequest({ ...item.reqPayload, name: 'Restored Request' })} className="bg-white rounded-[20px] p-5 shadow-sm hover:shadow-soft flex items-center gap-6 cursor-pointer transition-all border border-transparent hover:border-line group">
              <div className={`w-20 font-black text-[15px] ${methodColors[item.method] || 'text-textMuted'} tracking-widest`}>
                {item.method}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[14px] text-textMain truncate font-semibold mb-1">{item.url}</div>
                <div className="flex items-center gap-4 text-[12px] font-medium">
                  <span className={`${item.status < 400 ? 'text-emerald-600' : 'text-rose-600'}`}>{item.status}</span>
                  <span className="text-textMuted">{item.duration}ms</span>
                  <span className="text-textMuted text-opacity-70">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-10 h-10 rounded-full bg-main flex items-center justify-center text-accent hover:bg-accent/10">
                  <Play size={16} className="ml-1"/>
                </button>
              </div>
            </div>
          ))}
          {!history.length && (
            <div className="border-2 border-dashed border-line rounded-[24px] p-12 flex flex-col items-center justify-center text-center bg-white/50">
              <div className="w-20 h-20 rounded-[20px] bg-white shadow-soft flex items-center justify-center mb-5">
                <Clock size={32} className="text-accent/50"/>
              </div>
              <h3 className="text-xl font-bold text-textMain mb-3">No history yet</h3>
              <p className="text-textMuted text-[15px] max-w-md mb-8 leading-relaxed">Requests you send will automatically appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Monitoring(){
  return (
    <div className="h-full bg-main overflow-auto text-textMain">
      <div className="pt-6 pb-4 md:py-0 md:h-[88px] px-4 md:px-10 md:pr-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-auto mt-2 md:mt-0">
          <div className="text-[11px] text-textMuted font-medium tracking-widest uppercase mb-1.5 flex justify-center md:justify-start items-center gap-2">
            <span>OBSERVABILITY</span> 
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-textMain flex justify-center md:justify-start items-center gap-3">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] shrink-0"></span>
            Production Monitoring
          </h1>
        </div>
      </div>
      <div className="px-10 pb-10">
        <p className="text-textMuted text-[15px] mb-10 max-w-2xl leading-relaxed">Synthetic checks and uptime monitoring foundation for your critical API endpoints. Ensure your services are always available.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            ['Global Uptime', '99.98%', 'text-emerald-600', '+0.01%'],
            ['Avg Latency', '182ms', 'text-accentOrange', '-12ms'],
            ['Total Checks', '1,248', 'text-blue-600', 'today']
          ].map(([a,b,color,trend])=>(
            <div className="bg-white rounded-[24px] p-8 shadow-soft relative overflow-hidden group" key={a}>
              <div className="absolute top-0 left-0 w-full h-1 bg-main opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="text-[13px] font-bold text-textMuted tracking-widest uppercase mb-4">{a}</div>
              <div className="flex items-baseline gap-4">
                <div className={`text-5xl font-black ${color} tracking-tight`}>{b}</div>
                <div className="text-[14px] font-bold text-textMuted px-2 py-1 bg-main rounded-[8px]">{trend}</div>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <Activity size={120} />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 rounded-[24px] bg-white shadow-soft overflow-hidden border border-white">
          <div className="px-8 py-5 border-b border-line/50 bg-main/10">
            <h3 className="font-bold text-[16px] text-textMain">Recent Alerts</h3>
          </div>
          <div className="p-12 flex flex-col items-center justify-center text-textMuted">
            <div className="w-20 h-20 bg-main rounded-[20px] flex items-center justify-center mb-5">
              <Activity size={32} className="text-emerald-500/50"/>
            </div>
            <p className="font-medium text-[15px]">No recent alerts. All systems are operational.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Security(){
  return (
    <div className="h-full bg-main overflow-auto text-textMain">
      <div className="pt-6 pb-4 md:py-0 md:h-[88px] px-4 md:px-10 md:pr-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-auto mt-2 md:mt-0">
          <div className="text-[11px] text-textMuted font-medium tracking-widest uppercase mb-1.5 flex justify-center md:justify-start items-center gap-2">
            <span>SECURITY</span> 
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-textMain flex justify-center md:justify-start items-center gap-3">
            <span className="inline-block w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] shrink-0"></span>
            Security Scanner
          </h1>
        </div>
      </div>
      <div className="px-10 pb-10 max-w-6xl">
        <p className="text-textMuted text-[15px] mb-10 max-w-3xl leading-relaxed">
          Passive, non-destructive checks for APIs you own or are authorized to test. Review your configuration and identify potential vulnerabilities before they reach production.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-[24px] p-8 shadow-soft">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-[16px] bg-main flex items-center justify-center">
                  <ShieldCheck className="text-accent" size={24}/>
                </div>
                <h2 className="text-xl font-bold text-textMain">Inspection Rules</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  {title:'HTTPS Configuration', desc:'Verifies secure transport'},
                  {title:'Security Headers', desc:'HSTS, X-Frame-Options, etc.'},
                  {title:'CORS Exposure', desc:'Checks for wildcard origins'},
                  {title:'Information Leakage', desc:'Stack traces in error responses'},
                  {title:'Cookie Flags', desc:'Secure and HttpOnly attributes'},
                  {title:'Target Reachability', desc:'Basic endpoint availability'}
                ].map(x=>(
                  <div key={x.title} className="bg-main/50 rounded-[16px] p-5 hover:bg-main hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></div>
                      <span className="text-[15px] font-bold text-textMain">{x.title}</span>
                    </div>
                    <div className="text-[14px] text-textMuted ml-5">{x.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="bg-orange-50 rounded-[24px] p-8 shadow-sm border border-orange-100">
              <div className="w-12 h-12 rounded-[16px] bg-orange-100 text-orange-500 flex items-center justify-center mb-5">
                <ShieldCheck size={24}/>
              </div>
              <h3 className="text-orange-700 font-bold text-lg mb-3">
                Scope Limitation
              </h3>
              <p className="text-orange-800/70 text-[14px] leading-relaxed font-medium">
                Active exploit, fuzz testing, and penetration testing are intentionally not enabled in this developer platform starter. Scanning only performs passive heuristic analysis on returned responses and headers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
