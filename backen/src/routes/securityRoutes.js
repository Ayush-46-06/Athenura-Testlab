import express from 'express';
import axios from 'axios';
import {passiveScan} from '../services/securityScanner.js';
const router=express.Router();
router.post('/scan',async(req,res)=>{const url=req.body.url;if(!url)return res.status(400).json({message:'url is required'});try{const r=await axios.get(url,{timeout:10000,validateStatus:()=>true,maxRedirects:3});res.json(passiveScan(url,r));}catch(e){res.status(502).json({message:e.message,findings:[{severity:'high',code:'TARGET_UNREACHABLE',title:'Target could not be reached',detail:'Verify the URL and network access before scanning.'}]})}});
export default router;
