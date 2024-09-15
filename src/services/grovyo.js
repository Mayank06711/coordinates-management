import User from "../model/user.model.js";
import Conversation from "../model/conversation.model.js";
import Message from "../model/message.model.js";
const otpFromGrovyo = async (req, res) => {
  try {
    const { id } = req.params;
    const grovyoId = "65a666a3e953a4573e6c7ecf";
    const user = await User.findById(id);
    const grovyo = await User.findById(grovyoId);

    const convs = await Conversation.findOne({
      members: { $all: [user?._id, grovyo._id] },
    });

    const mesId = msgid();
    const otp = generateOtp();

    if (convs) {
      let data = {
        conversationId: convs._id,
        sender: grovyo._id,
        text: `Hi ${user.fullname},Your Otp is ${otp}.`,
        mesId,
      };
      const m = new Message(data);
      await m.save();
    } else {
      const conv = new Conversation({
        members: [grovyo._id, user._id],
      });
      const savedconv = await conv.save();
      let data = {
        conversationId: conv._id,
        sender: grovyo._id,
        text: `Hi ${user.fullname},Your Otp is ${otp}.`,
        mesId,
      };
      await User.updateOne(
        { _id: grovyo._id },
        {
          $addToSet: {
            conversations: savedconv?._id,
          },
        }
      );
      await User.updateOne(
        { _id: user._id },
        {
          $addToSet: {
            conversations: savedconv?._id,
          },
        }
      );

      const m = new Message(data);
      await m.save();
    }
  } catch (error) {
    console.log(error);
  }
};

function msgid() {
  return Math.floor(100000 + Math.random() * 900000);
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000);
}
