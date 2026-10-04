import express from 'express';
import Workspace from '../models/Workspace.js';
const router=express.Router();
router.get('/',async(_req,res)=>res.json(await Workspace.find().sort({createdAt:-1})));
router.post('/',async(req,res)=>res.status(201).json(await Workspace.create({name:req.body.name||'New Workspace',description:req.body.description||'',environments:req.body.environments||[]})));
router.get('/:id',async(req,res)=>res.json(await Workspace.findById(req.params.id)));
router.put('/:id',async(req,res)=>res.json(await Workspace.findByIdAndUpdate(req.params.id,req.body,{new:true})));
router.delete('/:id',async(req,res)=>{await Workspace.findByIdAndDelete(req.params.id);res.status(204).end()});
export default router;
