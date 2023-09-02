import mongoose, { Schema } from "mongoose";

const deanSchema = new mongoose.Schema(
  {
    universityId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: {type: String, required:true},
    token: String,
    sessions: [{
        type: Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    }]
  }
);

const Dean = mongoose.model("Dean", deanSchema);
export default Dean;
