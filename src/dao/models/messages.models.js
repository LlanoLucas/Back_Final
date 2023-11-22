import mongoose from "mongoose";

const messagesCollection = "messages";

const messageSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const MessageModel = mongoose.model(messagesCollection, messageSchema);

export default MessageModel;
