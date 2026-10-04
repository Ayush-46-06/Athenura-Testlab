import mongoose from 'mongoose';
const WorkspaceSchema=new mongoose.Schema({name:{type:String,required:true},description:String,environments:[{name:String,variables:[{key:String,value:String,secret:Boolean}]}]},{timestamps:true});
export default mongoose.model('Workspace',WorkspaceSchema);
