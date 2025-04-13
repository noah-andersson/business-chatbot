const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  time: {
    type: Date,
    default: Date.now
  },
  sessionId: {
    type: String,
    required: true
  }
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;
