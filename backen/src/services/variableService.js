export function interpolate(input='', variables={}) { return String(input).replace(/\{\{\s*([^}]+?)\s*\}\}/g,(_,k)=> variables[k] ?? `{{${k}}}`); }
export function interpolateObject(obj={},variables={}) { return Object.fromEntries(Object.entries(obj).map(([k,v])=>[interpolate(k,variables),interpolate(v,variables)])); }
