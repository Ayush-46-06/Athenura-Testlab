import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';
import requestRoutes from './routes/requestRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import securityRoutes from './routes/securityRoutes.js';

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit:'2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req,res)=>res.json({ok:true,service:'api-forge',time:new Date().toISOString()}));
app.use('/api/requests', requestRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/security', securityRoutes);

app.use((err,_req,res,_next)=>{ console.error(err); res.status(500).json({message:err.message || 'Internal server error'}); });

const port=process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/api_forge')
    .then(()=>app.listen(port,()=>console.log(`API Forge backend running on ${port}`)))
    .catch(err=>{ console.error('MongoDB connection failed:',err.message); app.listen(port,()=>console.log(`API Forge backend running without DB on ${port}`)); });
} else {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/api_forge')
    .catch(err=>console.error('MongoDB connection failed:',err.message));
}

export default app;
