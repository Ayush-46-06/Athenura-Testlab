export function passiveScan(targetUrl,response){
 const findings=[]; const h=Object.fromEntries(Object.entries(response.headers||{}).map(([k,v])=>[k.toLowerCase(),String(v)]));
 if(!/^https:/.test(targetUrl)) findings.push({severity:'medium',code:'HTTPS_NOT_USED',title:'Target is not using HTTPS',detail:'Use HTTPS for production APIs.'});
 if(!h['strict-transport-security']) findings.push({severity:'low',code:'MISSING_HSTS',title:'HSTS header is missing',detail:'Consider Strict-Transport-Security for HTTPS production endpoints.'});
 if(!h['x-content-type-options']) findings.push({severity:'low',code:'MISSING_NOSNIFF',title:'X-Content-Type-Options is missing',detail:'Consider X-Content-Type-Options: nosniff.'});
 if(h['access-control-allow-origin']==='*') findings.push({severity:'medium',code:'WILDCARD_CORS',title:'Wildcard CORS',detail:'Review whether every origin should be allowed.'});
 if(/(stack trace|exception|mongodb|sql syntax|node_modules)/i.test(JSON.stringify(response.data||''))) findings.push({severity:'medium',code:'ERROR_DISCLOSURE',title:'Possible internal error information',detail:'Response appears to expose implementation details.'});
 if(/set-cookie/i.test(JSON.stringify(response.headers||{})) && !/httponly/i.test(JSON.stringify(response.headers||{}))) findings.push({severity:'medium',code:'COOKIE_FLAGS',title:'Cookie may lack HttpOnly',detail:'Review session cookie security flags.'});
 return {targetUrl,score:Math.max(0,100-findings.reduce((s,f)=>s+({critical:35,high:20,medium:10,low:4}[f.severity]||2),0)),findings,mode:'passive'};
}
