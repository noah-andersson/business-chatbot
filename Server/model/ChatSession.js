const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  }
});

const ChatSession = mongoose.model('chatsessions', chatSessionSchema);

module.exports = ChatSession;
