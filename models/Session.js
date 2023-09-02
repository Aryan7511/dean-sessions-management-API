import mongoose, { Schema } from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    deanId: { type: String, required: true },
    deanName: { type: String, required: true },
    studentId: { type: String, required: true },
    studentName: {type: String, required: true},
    slot: {
        type: Schema.Types.ObjectId,
        ref: 'Slot',
        required: true
    }
  }
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
