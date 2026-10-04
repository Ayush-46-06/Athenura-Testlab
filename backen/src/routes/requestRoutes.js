import express from 'express';
import axios from 'axios';
import Request from '../models/Request.js';
import {interpolate,interpolateObject} from '../services/variableService.js';
const router=express.Router();

router.get('/',async(req,res)=>{const q=req.query.workspaceId?{workspaceId:req.query.workspaceId}:{};res.json(await Request.find(q).sort({updatedAt:-1}));});
router.post('/',async(req,res)=>res.status(201).json(await Request.create(req.body)));
router.put('/:id',async(req,res)=>res.json(await Request.findByIdAndUpdate(req.params.id,req.body,{new:true,upsert:true})));
router.delete('/:id',async(req,res)=>{await Request.findByIdAndDelete(req.params.id);res.status(204).end()});

router.post('/send',async(req,res)=>{
  const started=Date.now(); const r=req.body; const vars=r.variables||{};
  const url=interpolate(r.url,vars); const headers=interpolateObject(r.headers||{},vars); const params=interpolateObject(r.query||{},vars);
  if(r.auth?.type==='bearer' && r.auth.token) headers.Authorization=`Bearer ${interpolate(r.auth.token,vars)}`;
  if(r.auth?.type==='basic') headers.Authorization='Basic '+Buffer.from(`${r.auth.username||''}:${r.auth.password||''}`).toString('base64');
  if(r.auth?.type==='apiKey' && r.auth.key) headers[r.auth.name||'X-API-Key']=interpolate(r.auth.key,vars);
  let data=r.body;
  if(typeof data==='string' && data.trim()){try{data=JSON.parse(interpolate(data,vars))}catch{data=interpolate(data,vars)}}
  try {
    const response=await axios({url,method:(r.method||'GET').toLowerCase(),headers,params,data,timeout:Number(r.timeout)||30000,validateStatus:()=>true,maxRedirects:5});
    const duration=Date.now()-started;
    res.json({ok:true,status:response.status,statusText:response.statusText,headers:response.headers,data:response.data,duration,size:Buffer.byteLength(JSON.stringify(response.data??''),'utf8'),url});
  } catch(e){res.status(502).json({ok:false,message:e.message,code:e.code,duration:Date.now()-started});}
});
export default router;
