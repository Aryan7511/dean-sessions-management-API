import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
  universityId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  token: String,
  userType: { type: String, enum: ["Dean", "Student"], required: true },
  sessions: [
    {
      // for student userId will be deanId and UserName will be deanName
      // for dean userId will be studentId and UserName will be StudentName
      userId: { type: String, required: true },
      userName: { type: String, required: true },
      slot: {
        type: Schema.Types.ObjectId,
        ref: "Slot",
        required: true,
      },
    },
  ],
});

const User = mongoose.model("User", userSchema);
export default User;
