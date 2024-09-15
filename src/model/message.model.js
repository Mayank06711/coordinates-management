import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;
const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    sender: {
      type: ObjectId,
      ref: "User",
    },
    text: {
      type: String,
    },
    mesId: { type: Number, required: true, unique: true },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
