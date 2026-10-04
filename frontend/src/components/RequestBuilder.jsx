import {useState, useEffect} from 'react'; 
import {Send,Plus,Trash2,Copy,Clock,ShieldCheck,ChevronDown,Box,Activity,CheckCircle2,XCircle} from 'lucide-react'; 
import {api} from '../lib/api';

const METHODS=['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'];

export default function RequestBuilder({ activeWorkspace, activeRequest, setActiveRequest }){
  const [method,setMethod]=useState(activeRequest?.method || 'GET');
  const [url,setUrl]=useState(activeRequest?.url || 'https://dummyjson.com/auth/me');
  
  // Convert backend headers object back to array
  const initialHeaders = activeRequest?.headers 
    ? Object.entries(activeRequest.headers).map(([k,v]) => ({k,v})) 
    : [{k:'Accept',v:'application/json'}];
    
  const [headers,setHeaders]=useState(initialHeaders);
  const [body,setBody]=useState(typeof activeRequest?.body === 'string' ? activeRequest.body : (activeRequest?.body ? JSON.stringify(activeRequest.body,null,2) : ''));
  const [tab,setTab]=useState('Auth');
  const [response,setResponse]=useState(null);
  const [loading,setLoading]=useState(false);
  const [auth,setAuth]=useState(activeRequest?.auth || {type:'none'});
  const [scan,setScan]=useState(null);
  
  // Update state if activeRequest prop changes
  useEffect(() => {
    if (activeRequest) {
      setMethod(activeRequest.method || 'GET');
      setUrl(activeRequest.url || '');
      setHeaders(activeRequest.headers ? Object.entries(activeRequest.headers).map(([k,v]) => ({k,v})) : [{k:'',v:''}]);
      setBody(typeof activeRequest.body === 'string' ? activeRequest.body : (activeRequest.body ? JSON.stringify(activeRequest.body,null,2) : ''));
      setAuth(activeRequest.auth || {type:'none'});
    } else {
      setMethod('GET');
      setUrl('');
      setHeaders([{k:'Accept',v:'application/json'}]);
      setBody('');
      setAuth({type:'none'});
    }
  }, [activeRequest]);

  const [tests,setTests]=useState([
    { id: 1, target: 'status', expected: '200' },
    { id: 2, target: 'time', expected: '1000' }
  ]);
  
  const add=()=>setHeaders([...headers,{k:'',v:''}]); 
  const update=(i,key,val)=>setHeaders(headers.map((h,n)=>n===i?{...h,[key]:val}:h));
  
  // Params syncing
  let baseUrl = url;
  let queryStr = '';
  if (url.includes('?')) {
    const parts = url.split('?');
    baseUrl = parts[0];
    queryStr = parts.slice(1).join('?');
  }
  
  const queryObj = new URLSearchParams(queryStr);
  const params = [];
  queryObj.forEach((val, key) => params.push({ k: key, v: val }));
  
  function updateParam(i, key, val) {
    const p = [...params];
    if (key !== undefined) p[i].k = key;
    if (val !== undefined) p[i].v = val;
    const newQuery = new URLSearchParams();
    p.forEach(x => {
      if (x.k) newQuery.append(x.k, x.v || '');
    });
    const qs = newQuery.toString();
    setUrl(qs ? `${baseUrl}?${qs}` : baseUrl);
  }
  
  function addParam() {
    const newQuery = new URLSearchParams(queryStr);
    newQuery.append('', '');
    setUrl(`${baseUrl}?${newQuery.toString()}`);
  }
  
  function removeParam(i) {
    const p = [...params];
    p.splice(i, 1);
    const newQuery = new URLSearchParams();
    p.forEach(x => {
      if (x.k) newQuery.append(x.k, x.v || '');
    });
    const qs = newQuery.toString();
    setUrl(qs ? `${baseUrl}?${qs}` : baseUrl);
  }
  
  async function saveRequest() {
    if (!activeWorkspace) return alert("Please open a Workspace first to save requests.");
    
    const h=Object.fromEntries(headers.filter(x=>x.k).map(x=>[x.k,x.v]));
    const payload = {
      workspaceId: activeWorkspace._id,
      name: url.split('/').pop() || 'New Request',
      method,
      url,
      headers: h,
      auth,
      body: (method !== 'GET' && method !== 'HEAD') ? body : undefined
    };
    
    try {
      if (activeRequest?._id) {
        const r = await api.put(`/requests/${activeRequest._id}`, payload);
        setActiveRequest(r.data);
      } else {
        const r = await api.post('/requests', payload);
        setActiveRequest(r.data);
      }
      alert('Request saved to workspace!');
    } catch (e) {
      alert('Failed to save: ' + e.message);
    }
  }

  async function send(){
    setLoading(true);
    setResponse(null);
    try{
      const h=Object.fromEntries(headers.filter(x=>x.k).map(x=>[x.k,x.v]));
      const payload = {method,url,headers:h,auth};
      if (method !== 'GET' && method !== 'HEAD') {
        payload.body = body;
      }
      const r=await api.post('/requests/send', payload);
      setResponse(r.data);
      
      // Save to local history
      try {
        const hist = JSON.parse(localStorage.getItem('apiHistory') || '[]');
        hist.unshift({ id: Date.now(), method, url, status: r.data.status, duration: r.data.duration, timestamp: Date.now(), reqPayload: payload });
        if (hist.length > 50) hist.pop();
        localStorage.setItem('apiHistory', JSON.stringify(hist));
      } catch(err) {}
      
    } catch(e) {
      setResponse(e.response?.data||{message:e.message});
    } finally {
      setLoading(false);
    }
  }
  
  async function runScan(){
    if(!response?.url)return;
    try{
      const r=await api.post('/security/scan',{url:response.url});
      setScan(r.data);
    } catch(e) {
      setScan({message:e.response?.data?.message||e.message});
    }
  }

  const methodColors = {
    GET: 'text-accent',
    POST: 'text-blue-600',
    PUT: 'text-accentOrange',
    PATCH: 'text-accentOrange',
    DELETE: 'text-rose-600'
  };

  // Evaluate tests
  const testResults = response ? tests.map(t => {
    let passed = false;
    let actual = '';
    if (t.target === 'status') {
      actual = response.status?.toString();
      passed = actual === t.expected;
    } else if (t.target === 'time') {
      actual = `${response.duration}ms`;
      passed = response.duration <= Number(t.expected);
    }
    return { ...t, passed, actual };
  }) : [];
  
  const passCount = testResults.filter(t => t.passed).length;
  
  return (
    <div className="h-full flex flex-col bg-main text-textMain text-sm">
      {/* Header */}
      <div className="md:h-[88px] py-4 px-4 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="pr-12 md:pr-0">
          <div className="text-[11px] text-textMuted font-medium tracking-widest uppercase mb-1.5 flex items-center gap-2">
            <span>Workspace</span> 
            <span className="text-line">/</span> 
            <span>Collection</span>
            <span className="text-line">/</span> 
            <span className="text-accent font-semibold">Request</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-textMain flex items-center gap-3">
            <span className="inline-block w-3 h-3 rounded-full bg-accentOrange shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
            <span className="truncate max-w-[200px] md:max-w-[400px]">{activeRequest ? activeRequest.name || 'Untitled Request' : 'New Request'}</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={saveRequest} className="px-5 py-3 bg-white hover:bg-panelHover rounded-[16px] text-[15px] font-semibold flex items-center justify-center gap-2 transition-all shadow-soft border border-white text-textMain flex-1 md:flex-none">
            Save
          </button>
          <button onClick={runScan} disabled={!response} className="px-5 py-3 bg-white hover:bg-panelHover rounded-[16px] text-[15px] font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-soft border border-white flex-1 md:flex-none">
            <ShieldCheck size={18} className={response ? "text-accent" : "text-textMuted"}/> 
            <span className="text-textMain hidden sm:inline">Scan</span>
          </button>
          <button onClick={send} disabled={loading} className="px-6 py-3 bg-accent hover:bg-accentHover rounded-[16px] text-[15px] font-semibold flex items-center justify-center gap-2 text-white shadow-soft shadow-accent/20 transition-all disabled:opacity-70 border border-transparent flex-1 md:flex-none">
            <Send size={16}/>
            <span className="hidden sm:inline">{loading?'Sending…':'Send'}</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto px-4 md:px-8 pb-8 space-y-6">
        
        {/* URL Bar */}
        <div className="flex rounded-[20px] bg-white shadow-soft transition-all h-[56px] md:h-[64px] items-center px-2 shrink-0">
          <div className="relative flex items-center h-full">
            <select value={method} onChange={e=>setMethod(e.target.value)} className={`bg-transparent pl-3 md:pl-5 pr-7 md:pr-8 py-2 outline-none font-bold text-[13px] md:text-[15px] appearance-none cursor-pointer ${methodColors[method] || 'text-textMuted'}`}>
              {METHODS.map(m=><option key={m} className="bg-white text-textMain">{m}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 md:right-3 text-textMuted pointer-events-none"/>
          </div>
          <div className="w-[1px] h-6 md:h-8 bg-line mx-1 md:mx-2"></div>
          <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://api.example.com/v1/users" className="flex-1 min-w-0 bg-transparent px-2 md:px-4 py-2 outline-none text-[14px] md:text-[16px] font-mono text-textMain placeholder:text-textMuted/50"/>
        </div>
        
        {/* Request Configuration */}
        <div className="rounded-[24px] bg-white shadow-soft overflow-hidden">
          <div className="flex px-2 pt-2 gap-1 border-b border-line/50 overflow-x-auto no-scrollbar">
            {['Params','Headers','Body','Auth','Tests'].map(t=>(
              <button key={t} onClick={()=>setTab(t)} className={`px-4 md:px-6 py-3.5 text-[14px] md:text-[15px] font-medium transition-all relative rounded-t-[16px] flex items-center gap-2 whitespace-nowrap ${tab===t?'bg-main/50 text-accent':'text-textMuted hover:text-textMain hover:bg-panelHover'}`}>
                {t}
                {t === 'Tests' && testResults.length > 0 && response && (
                  <span className={`px-2 py-0.5 rounded-[6px] text-[11px] font-bold ${passCount === tests.length ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {passCount}/{tests.length}
                  </span>
                )}
                {tab===t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"></div>}
              </button>
            ))}
          </div>
          
          <div className="p-4 md:p-6 min-h-[240px] bg-main/30 overflow-x-auto">
            {tab==='Headers'&&
              <div className="space-y-3 min-w-[500px] md:min-w-0">
                {headers.map((h,i)=>
                  <div className="flex gap-3 items-center group" key={i}>
                    <input placeholder="Key" value={h.k} onChange={e=>update(i,'k',e.target.value)} className="w-1/3 bg-white border-transparent rounded-[12px] px-4 py-3 outline-none focus:ring-2 focus:ring-accent/20 font-mono text-sm transition-all text-textMain placeholder:text-textMuted/50 shadow-sm"/>
                    <input placeholder="Value" value={h.v} onChange={e=>update(i,'v',e.target.value)} className="flex-1 bg-white border-transparent rounded-[12px] px-4 py-3 outline-none focus:ring-2 focus:ring-accent/20 font-mono text-sm transition-all text-textMain placeholder:text-textMuted/50 shadow-sm"/>
                    <button onClick={()=>setHeaders(headers.filter((_,n)=>n!==i))} className="p-3 bg-white shadow-sm rounded-[12px] text-textMuted hover:text-rose-500 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                )}
                <button onClick={add} className="text-accent hover:text-accentHover text-[15px] font-semibold flex gap-2 items-center mt-5 transition-colors bg-white shadow-sm px-4 py-2.5 rounded-[12px]">
                  <Plus size={18}/> Add header
                </button>
              </div>
            }
            {tab==='Body'&&
              <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder={'{\n  "name": "John"\n}'} className="w-full h-[200px] bg-white border-transparent shadow-sm rounded-[16px] p-5 font-mono text-[15px] outline-none focus:ring-2 focus:ring-accent/20 transition-all text-textMain placeholder:text-textMuted/40 resize-none"/>
            }
            {tab==='Auth'&&
              <div className="max-w-2xl bg-white p-6 rounded-[16px] shadow-sm">
                <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-4">Authentication Type</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="relative">
                    <select value={auth.type} onChange={e=>setAuth({...auth,type:e.target.value})} className="w-full bg-main/50 border-transparent rounded-[12px] px-4 py-3 outline-none focus:ring-2 focus:ring-accent/20 appearance-none pr-8 font-medium">
                      <option value="none">No Auth</option>
                      <option value="bearer">Bearer Token</option>
                      <option value="basic">Basic Auth</option>
                      <option value="apiKey">API Key</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-3.5 text-textMuted pointer-events-none"/>
                  </div>
                  
                  {auth.type==='bearer'&&
                    <div className="md:col-span-2">
                      <input value={auth.token || ''} className="w-full bg-main/50 border-transparent rounded-[12px] px-4 py-3 outline-none focus:ring-2 focus:ring-accent/20 font-mono text-sm shadow-inner-soft" placeholder="Token e.g. eyJhbG..." onChange={e=>setAuth({...auth,token:e.target.value})}/>
                    </div>
                  } 
                  {auth.type==='basic'&&
                    <>
                      <input value={auth.username || ''} className="w-full bg-main/50 border-transparent rounded-[12px] px-4 py-3 outline-none focus:ring-2 focus:ring-accent/20 font-mono text-sm shadow-inner-soft" placeholder="Username" onChange={e=>setAuth({...auth,username:e.target.value})}/>
                      <input value={auth.password || ''} className="w-full bg-main/50 border-transparent rounded-[12px] px-4 py-3 outline-none focus:ring-2 focus:ring-accent/20 font-mono text-sm shadow-inner-soft" placeholder="Password" type="password" onChange={e=>setAuth({...auth,password:e.target.value})}/>
                    </>
                  }
                </div>
              </div>
            }
            {tab==='Params'&&
              <div className="space-y-3 min-w-[500px] md:min-w-0">
                {params.map((p,i)=>
                  <div className="flex gap-3 items-center group" key={i}>
                    <input placeholder="Key" value={p.k} onChange={e=>updateParam(i,e.target.value,undefined)} className="w-1/3 bg-white border-transparent rounded-[12px] px-4 py-3 outline-none focus:ring-2 focus:ring-accent/20 font-mono text-sm transition-all text-textMain placeholder:text-textMuted/50 shadow-sm"/>
                    <input placeholder="Value" value={p.v} onChange={e=>updateParam(i,undefined,e.target.value)} className="flex-1 bg-white border-transparent rounded-[12px] px-4 py-3 outline-none focus:ring-2 focus:ring-accent/20 font-mono text-sm transition-all text-textMain placeholder:text-textMuted/50 shadow-sm"/>
                    <button onClick={()=>removeParam(i)} className="p-3 bg-white shadow-sm rounded-[12px] text-textMuted hover:text-rose-500 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                )}
                <button onClick={addParam} className="text-accent hover:text-accentHover text-[15px] font-semibold flex gap-2 items-center mt-5 transition-colors bg-white shadow-sm px-4 py-2.5 rounded-[12px]">
                  <Plus size={18}/> Add parameter
                </button>
                {params.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-[120px] text-textMuted">
                    <p className="text-[15px] font-medium">Add query parameters to the request URL</p>
                  </div>
                )}
              </div>
            }
            {tab==='Tests'&&
              <div className="max-w-3xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-textMuted font-medium text-[15px]">Visual Assertion Builder</p>
                  <button onClick={() => setTests([...tests, { id: Date.now(), target: 'status', expected: '200' }])} className="text-accent hover:text-accentHover font-semibold flex items-center gap-2">
                    <Plus size={16}/> Add Assertion
                  </button>
                </div>
                <div className="space-y-3">
                  {(response ? testResults : tests).map((t, i) => (
                    <div key={t.id} className="flex items-center gap-4 bg-white p-3 rounded-[16px] shadow-sm group border border-transparent">
                      <div className="relative">
                        <select 
                          value={t.target} 
                          onChange={(e) => {
                            const newTests = [...tests];
                            newTests[i].target = e.target.value;
                            setTests(newTests);
                          }}
                          className="bg-main/50 border-transparent rounded-[12px] px-4 py-2.5 outline-none focus:ring-2 focus:ring-accent/20 font-semibold appearance-none pr-8"
                        >
                          <option value="status">Status Code</option>
                          <option value="time">Response Time (ms)</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-3 text-textMuted pointer-events-none"/>
                      </div>
                      <span className="text-textMuted font-medium text-sm">
                        {t.target === 'time' ? 'is less than' : 'equals'}
                      </span>
                      <input 
                        value={t.expected}
                        onChange={(e) => {
                          const newTests = [...tests];
                          newTests[i].expected = e.target.value;
                          setTests(newTests);
                        }}
                        className="w-24 bg-main/50 border-transparent rounded-[12px] px-4 py-2.5 outline-none focus:ring-2 focus:ring-accent/20 font-mono text-center font-bold text-textMain shadow-inner-soft" 
                        placeholder="Value"
                      />
                      
                      {response && (
                        <div className="ml-auto flex items-center gap-3">
                          <span className="text-xs font-mono text-textMuted">Got: {t.actual}</span>
                          {t.passed ? (
                            <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-[10px] font-bold text-xs"><CheckCircle2 size={16}/> PASS</span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-[10px] font-bold text-xs"><XCircle size={16}/> FAIL</span>
                          )}
                        </div>
                      )}

                      {!response && (
                         <button onClick={() => setTests(tests.filter((_, n) => n !== i))} className="ml-auto p-2.5 bg-white shadow-sm rounded-[12px] text-textMuted hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                           <Trash2 size={16}/>
                         </button>
                      )}
                    </div>
                  ))}
                  {tests.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-[16px] shadow-sm text-textMuted border border-dashed border-line">
                      No tests configured for this request.
                    </div>
                  )}
                </div>
              </div>
            }
          </div>
        </div>
        
        {/* Response Area */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          <div className="rounded-[24px] bg-white shadow-soft overflow-hidden flex flex-col h-[420px]">
            <div className="px-6 py-4 border-b border-line/50 flex justify-between items-center bg-white">
              <span className="font-bold text-[14px] tracking-wide text-textMain flex items-center gap-2">
                <Box size={16} className="text-accent"/> RESPONSE
              </span>
              {response&&
                <div className="flex items-center gap-4 text-xs font-mono text-textMuted">
                  <span className={`px-2.5 py-1 rounded-[8px] ${response.status<400?'bg-emerald-50 text-emerald-600':'bg-rose-50 text-rose-600'} font-bold`}>{response.status} {response.statusText}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} className="text-textMuted"/>{response.duration}ms</span>
                  <span>{response.size} B</span>
                </div>
              }
            </div>
            <div className="flex-1 p-0 overflow-hidden relative bg-main/20">
              {!response ? 
                <div className="h-full flex flex-col items-center justify-center text-textMuted space-y-5">
                  <div className="w-20 h-20 bg-white shadow-sm rounded-[20px] flex items-center justify-center">
                    <Send size={32} className="text-accent/30"/>
                  </div>
                  <p className="font-medium">Send a request to inspect the response</p>
                </div>
              :
                <div className="h-full overflow-auto p-6">
                  <pre className="font-mono text-[14px] text-zinc-800 leading-relaxed bg-white p-5 rounded-[16px] shadow-inner-soft">
                    {JSON.stringify(response.data,null,2)}
                  </pre>
                </div>
              }
            </div>
          </div>
          
          <div className="rounded-[24px] bg-accent shadow-soft shadow-accent/20 overflow-hidden flex flex-col h-[420px] text-white">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-accent">
              <span className="font-bold text-[14px] tracking-wide flex items-center gap-2">
                <ShieldCheck size={16} className="text-white/70"/> SECURITY
              </span>
            </div>
            <div className="flex-1 p-6 overflow-auto bg-gradient-to-b from-accent to-accentHover relative">
              <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                <ShieldCheck size={250}/>
              </div>
              
              {!scan ? 
                <div className="h-full flex flex-col items-center justify-center space-y-5 text-center max-w-sm mx-auto relative z-10">
                  <div className="w-20 h-20 rounded-[20px] bg-white/10 backdrop-blur-sm flex items-center justify-center mb-2 shadow-lg">
                    <ShieldCheck size={32} className="text-white"/>
                  </div>
                  <p className="font-medium text-white/80 leading-relaxed">Run a passive security scan after sending a request to analyze headers and configuration.</p>
                </div>
              : scan.message ? 
                <div className="p-5 bg-rose-500/20 backdrop-blur-sm rounded-[16px] text-white font-medium flex items-start gap-3 relative z-10 shadow-lg">
                  <ShieldCheck size={20} className="shrink-0 mt-0.5 text-rose-200"/>
                  <p>{scan.message}</p>
                </div>
              : 
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-[24px] bg-white/10 backdrop-blur-sm shadow-lg flex items-center justify-center flex-col shrink-0 border border-white/20">
                      <span className="text-3xl font-black">{scan.score}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Security Score</h3>
                      <p className="text-[15px] text-white/70 mt-1 font-medium">Based on {scan.findings.length} findings</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    {scan.findings.length ? scan.findings.map(f=>
                      <div key={f.code} className="p-5 rounded-[16px] bg-white/10 backdrop-blur-sm shadow-lg border border-white/10">
                        <div className="flex justify-between items-center mb-3">
                          <b className="text-[15px] font-bold">{f.title}</b>
                          <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-[8px] ${f.severity==='high'?'bg-rose-500/80':f.severity==='medium'?'bg-accentOrange/80':'bg-blue-500/80'} text-white shadow-sm`}>
                            {f.severity}
                          </span>
                        </div>
                        <p className="text-[14px] text-white/80 leading-relaxed font-medium">{f.detail}</p>
                      </div>
                    ) : 
                      <div className="p-5 rounded-[16px] bg-white/10 backdrop-blur-sm shadow-lg border border-white/10 text-white font-medium flex items-center gap-3">
                        <ShieldCheck size={20} className="text-emerald-300"/>
                        <span>No passive findings detected. Your configuration looks secure!</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
