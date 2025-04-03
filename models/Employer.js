const mongoose = require('mongoose');
const User = require('./User');

const EmployerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: [true, 'Please add the company name']
  },
  description: {
    type: String,
    required: [true, 'Please add a company description']
  },
  logo: {
    type: String
  },
  industry: {
    type: [String],
    required: true
  },
  locations: [
    {
      country: String,
      city: String,
      address: String
    }
  ],
  jobTypes: {
    type: [String],
    enum: ['CDI', 'CDD', 'Internship', 'Apprenticeship', 'Freelance'],
    required: true
  },
  website: {
    type: String
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    linkedin: String
  },
  contact: {
    name: {
      type: String,
      required: true
    },
    position: {
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

// Cascade delete jobs when employer is deleted
EmployerSchema.pre('remove', async function(next) {
  await this.model('Job').deleteMany({ employer: this._id });
  next();
});

module.exports = mongoose.model('Employer', EmployerSchema);