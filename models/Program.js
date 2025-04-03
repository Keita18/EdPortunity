const mongoose = require('mongoose');

const ProgramSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.ObjectId,
    ref: 'School',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a program title']
  },
  description: {
    type: String,
    required: [true, 'Please add a program description']
  },
  degreeType: {
    type: String,
    enum: ['Bachelor', 'Master', 'PhD', 'Certificate', 'Diploma'],
    required: true
  },
  fieldOfStudy: {
    type: String,
    required: true
  },
  duration: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['months', 'years'],
      required: true
    }
  },
  studyMode: {
    type: String,
    enum: ['On-campus', 'Online', 'Hybrid'],
    required: true
  },
  tuition: {
    amount: Number,
    currency: String,
    notes: String
  },
  scholarships: {
    available: {
      type: Boolean,
      default: false
    },
    description: String
  },
  requirements: {
    academic: [String],
    language: [String],
    documents: [String]
  },
  deadline: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Cascade delete applications when program is deleted
ProgramSchema.pre('remove', async function(next) {
  await this.model('Application').deleteMany({ program: this._id });
  next();
});

module.exports = mongoose.model('Program', ProgramSchema);