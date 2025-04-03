const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: true
  },
  job: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job'
  },
  program: {
    type: mongoose.Schema.ObjectId,
    ref: 'Program'
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'interview', 'accepted', 'rejected'],
    default: 'submitted'
  },
  documents: [
    {
      name: String,
      url: String
    }
  ],
  coverLetter: {
    type: String
  },
  notes: {
    type: String
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Validate that either job or program is provided
ApplicationSchema.pre('validate', function(next) {
  if (!this.job && !this.program) {
    this.invalidate('application', 'Must apply to either a job or program');
  }
  if (this.job && this.program) {
    this.invalidate('application', 'Cannot apply to both job and program simultaneously');
  }
  next();
});

module.exports = mongoose.model('Application', ApplicationSchema);