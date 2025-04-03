const mongoose = require('mongoose');
const User = require('./User');

const SchoolSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add the school name']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  logo: {
    type: String
  },
  banner: {
    type: String
  },
  location: {
    country: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  programs: {
    type: [String],
    required: true
  },
  scholarships: {
    type: Boolean,
    default: false
  },
  website: {
    type: String
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String
  },
  contact: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  }
});

// Cascade delete programs when school is deleted
SchoolSchema.pre('remove', async function(next) {
  await this.model('Program').deleteMany({ school: this._id });
  next();
});

module.exports = mongoose.model('School', SchoolSchema);