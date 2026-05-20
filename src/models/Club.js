const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: '🏆' },
  category: { type: String, default: 'General' },
  description: { type: String, default: '' },
  members: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);
