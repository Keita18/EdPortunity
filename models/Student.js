const mongoose = require('mongoose');
const User = require('./User');

const StudentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: {
    type: String,
    required: [true, 'Please add a first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name']
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  country: {
    type: String,
    required: [true, 'Please add a country']
  },
  nationality: {
    type: String,
    required: [true, 'Please add a nationality']
  },
  education: [
    {
      degree: {
        type: String,
        required: true
      },
      institution: {
        type: String,
        required: true
      },
      year: {
        type: Number,
        required: true
      }
    }
  ],
  interests: {
    type: [String],
    required: true
  },
  cv: {
    type: String
  },
  languages: {
    type: [String],
    required: true
  },
  availability: {
    type: String,
    enum: ['immediate', 'future'],
    required: true
  }
});

// Cascade delete applications when student is deleted
StudentSchema.pre('remove', async function(next) {
  await this.model('Application').deleteMany({ student: this._id });
  next();
});

module.exports = mongoose.model('Student', StudentSchema);