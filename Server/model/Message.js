const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  id: {
    unique: true,
    type: Number,
  },
  sender: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  label: {
    type: String,
  },
  content: {
    type: String,
    required: true
  },
  options: {
    type: [String],
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('messages', messageSchema);

module.exports = Message;
