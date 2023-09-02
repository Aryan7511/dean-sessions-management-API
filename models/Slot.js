  import mongoose, { Schema } from "mongoose";

  const slotSchema = new mongoose.Schema(
    {
      slot: {
          type: Date,
          required: true
      },
      booked: {
          type: [{
              type: Schema.Types.ObjectId,
              ref: 'Dean',
              required: true
          }],
          required: true        
      }
    }
  );

  const Slot = mongoose.model("Slot", slotSchema);
  export default Slot;
