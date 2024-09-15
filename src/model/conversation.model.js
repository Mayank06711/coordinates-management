import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const conversationSchema = new mongoose.Schema(
  {
    members: [{ type: ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
