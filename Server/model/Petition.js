const mongoose = require('mongoose');

const petitionSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: Number,
    // required: true
  },
  emailAddress: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    // required: true
  },
  userCity: {
    type: String,
    required: true
  },
  branchOfficeId: {
    type: Number,
    required: true
  },
  departmentId: {
    type: Number,
    required: true
  },
  datePetition: {
    type: Date,
  },
  timePetition: {
    type: String,
  }
});

const Petition = mongoose.model('petitions', petitionSchema);

module.exports = Petition;
