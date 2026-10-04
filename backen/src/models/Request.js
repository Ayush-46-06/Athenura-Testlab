import mongoose from 'mongoose';
const RequestSchema=new mongoose.Schema({workspaceId:{type:mongoose.Schema.Types.ObjectId,ref:'Workspace'},collection:String,name:String,method:String,url:String,headers:{type:Object,default:{}},query:{type:Object,default:{}},body:String,auth:{type:Object,default:{}},tests:{type:Array,default:[]}}, {timestamps:true});
export default mongoose.model('Request',RequestSchema);
