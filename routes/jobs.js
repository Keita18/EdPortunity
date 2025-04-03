const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Job = require('../models/Job');
const Employer = require('../models/Employer');
const Application = require('../models/Application');

// @route    GET api/jobs
// @desc     Get all jobs
// @access   Public
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('employer', ['companyName', 'logo', 'industry'])
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/jobs/:id
// @desc     Get job by ID
// @access   Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', ['companyName', 'description', 'logo', 'industry', 'locations', 'website', 'socialMedia', 'contact']);

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    res.json(job);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    POST api/jobs
// @desc     Create a job
// @access   Private (Employer)
router.post(
  '/',
  [
    protect,
    authorize('employer'),
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('responsibilities', 'Responsibilities are required').isArray({ min: 1 }),
      check('requirements.education', 'Education requirement is required').not().isEmpty(),
      check('requirements.experience', 'Experience requirement is required').not().isEmpty(),
      check('requirements.skills', 'Skills are required').isArray({ min: 1 }),
      check('jobType', 'Job type is required').isIn(['CDI', 'CDD', 'Internship', 'Apprenticeship', 'Freelance']),
      check('location.country', 'Country is required').not().isEmpty(),
      check('location.city', 'City is required').not().isEmpty(),
      check('deadline', 'Deadline is required').isISO8601()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const employer = await Employer.findOne({ user: req.user.id });

      if (!employer) {
        return res.status(400).json({ msg: 'Employer profile not found' });
      }

      const {
        title,
        description,
        responsibilities,
        requirements,
        jobType,
        location,
        salary,
        deadline
      } = req.body;

      const newJob = new Job({
        employer: employer._id,
        title,
        description,
        responsibilities,
        requirements,
        jobType,
        location,
        salary,
        deadline
      });

      const job = await newJob.save();
      res.json(job);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    PUT api/jobs/:id
// @desc     Update a job
// @access   Private (Employer)
router.put('/:id', [protect, authorize('employer')], async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check if job belongs to employer
    const employer = await Employer.findOne({ user: req.user.id });
    if (job.employer.toString() !== employer._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedJob);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/jobs/:id
// @desc     Delete a job
// @access   Private (Employer)
router.delete('/:id', [protect, authorize('employer')], async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check if job belongs to employer
    const employer = await Employer.findOne({ user: req.user.id });
    if (job.employer.toString() !== employer._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized to delete this job' });
    }

    await job.remove();
    res.json({ msg: 'Job removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    POST api/jobs/:id/apply
// @desc     Apply to a job
// @access   Private (Student)
router.post(
  '/:id/apply',
  [
    protect,
    authorize('student'),
    [
      check('documents', 'Documents are required').isArray({ min: 1 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const job = await Job.findById(req.params.id);
      if (!job) {
        return res.status(404).json({ msg: 'Job not found' });
      }

      const student = await Student.findOne({ user: req.user.id });
      if (!student) {
        return res.status(400).json({ msg: 'Student profile not found' });
      }

      // Check if already applied
      const existingApplication = await Application.findOne({
        student: student._id,
        job: job._id
      });

      if (existingApplication) {
        return res.status(400).json({ msg: 'Already applied to this job' });
      }

      const { documents, coverLetter } = req.body;

      const newApplication = new Application({
        student: student._id,
        job: job._id,
        documents,
        coverLetter
      });

      const application = await newApplication.save();
      res.json(application);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Job not found' });
      }
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;