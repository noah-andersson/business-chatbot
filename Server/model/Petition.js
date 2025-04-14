const mongoose = require('mongoose');

const petitionSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userCity: {
    type: String,
    required: true
  },
  branchOffice: {
    type: String,
    required: true
  },
  content: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Petition = mongoose.model('petitions', petitionSchema);

module.exports = Petition;
