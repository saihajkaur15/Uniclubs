const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, default: 'General' }
}, { _id: false });

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stream: { type: String, default: 'General' },
  year: { type: String, default: '1st Year' },
  icon: { type: String, default: '👥' },
  members: [memberSchema]
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
