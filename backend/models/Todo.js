import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    description:{
      type:String,
      trim:true,
      required:true,
    },
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true 
    },
    done:{
      type:Boolean,
      default:false
    }
  },
  {
    timestamps:true
  }
)

const Todo = mongoose.model("Todo",todoSchema)

export default Todo