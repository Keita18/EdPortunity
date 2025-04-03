const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Program = require('../models/Program');
const School = require('../models/School');
const Application = require('../models/Application');

// @route    GET api/programs
// @desc     Get all programs
// @access   Public
router.get('/', async (req, res) => {
  try {
    const programs = await Program.find()
      .populate('school', ['name', 'logo', 'location'])
      .sort({ createdAt: -1 });
    res.json(programs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/programs/:id
// @desc     Get program by ID
// @access   Public
router.get('/:id', async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate('school', ['name', 'description', 'logo', 'location', 'website', 'socialMedia', 'contact']);

    if (!program) {
      return res.status(404).json({ msg: 'Program not found' });
    }

    res.json(program);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Program not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    POST api/programs
// @desc     Create a program
// @access   Private (School)
router.post(
  '/',
  [
    protect,
    authorize('school'),
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('degreeType', 'Degree type is required').isIn(['Bachelor', 'Master', 'PhD', 'Certificate', 'Diploma']),
      check('fieldOfStudy', 'Field of study is required').not().isEmpty(),
      check('duration.value', 'Duration value is required').isNumeric(),
      check('duration.unit', 'Duration unit is required').isIn(['months', 'years']),
      check('studyMode', 'Study mode is required').isIn(['On-campus', 'Online', 'Hybrid']),
      check('requirements.academic', 'Academic requirements are required').isArray({ min: 1 }),
      check('requirements.language', 'Language requirements are required').isArray({ min: 1 }),
      check('requirements.documents', 'Document requirements are required').isArray({ min: 1 }),
      check('deadline', 'Deadline is required').isISO8601(),
      check('startDate', 'Start date is required').isISO8601()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const school = await School.findOne({ user: req.user.id });

      if (!school) {
        return res.status(400).json({ msg: 'School profile not found' });
      }

      const {
        title,
        description,
        degreeType,
        fieldOfStudy,
        duration,
        studyMode,
        tuition,
        scholarships,
        requirements,
        deadline,
        startDate
      } = req.body;

      const newProgram = new Program({
        school: school._id,
        title,
        description,
        degreeType,
        fieldOfStudy,
        duration,
        studyMode,
        tuition,
        scholarships,
        requirements,
        deadline,
        startDate
      });

      const program = await newProgram.save();
      res.json(program);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    PUT api/programs/:id
// @desc     Update a program
// @access   Private (School)
router.put('/:id', [protect, authorize('school')], async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ msg: 'Program not found' });
    }

    // Check if program belongs to school
    const school = await School.findOne({ user: req.user.id });
    if (program.school.toString() !== school._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized to update this program' });
    }

    const updatedProgram = await Program.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedProgram);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Program not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/programs/:id
// @desc     Delete a program
// @access   Private (School)
router.delete('/:id', [protect, authorize('school')], async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ msg: 'Program not found' });
    }

    // Check if program belongs to school
    const school = await School.findOne({ user: req.user.id });
    if (program.school.toString() !== school._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized to delete this program' });
    }

    await program.remove();
    res.json({ msg: 'Program removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Program not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    POST api/programs/:id/apply
// @desc     Apply to a program
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
      const program = await Program.findById(req.params.id);
      if (!program) {
        return res.status(404).json({ msg: 'Program not found' });
      }

      const student = await Student.findOne({ user: req.user.id });
      if (!student) {
        return res.status(400).json({ msg: 'Student profile not found' });
      }

      // Check if already applied
      const existingApplication = await Application.findOne({
        student: student._id,
        program: program._id
      });

      if (existingApplication) {
        return res.status(400).json({ msg: 'Already applied to this program' });
      }

      const { documents } = req.body;

      const newApplication = new Application({
        student: student._id,
        program: program._id,
        documents
      });

      const application = await newApplication.save();
      res.json(application);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Program not found' });
      }
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;