const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Employer',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a job title']
  },
  description: {
    type: String,
    required: [true, 'Please add a job description']
  },
  responsibilities: {
    type: [String],
    required: true
  },
  requirements: {
    education: {
      type: String,
      required: true
    },
    experience: {
      type: String,
      required: true
    },
    skills: {
      type: [String],
      required: true
    }
  },
  jobType: {
    type: String,
    enum: ['CDI', 'CDD', 'Internship', 'Apprenticeship', 'Freelance'],
    required: true
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
    remote: {
      type: Boolean,
      default: false
    }
  },
  salary: {
    min: Number,
    max: Number,
    currency: String
  },
  deadline: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Cascade delete applications when job is deleted
JobSchema.pre('remove', async function(next) {
  await this.model('Application').deleteMany({ job: this._id });
  next();
});

module.exports = mongoose.model('Job', JobSchema);