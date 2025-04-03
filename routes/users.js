const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const School = require('../models/School');
const Employer = require('../models/Employer');

// @route    GET api/users/me
// @desc     Get current user profile
// @access   Private
router.get('/me', protect, async (req, res) => {
  try {
    let profile;
    switch (req.user.role) {
      case 'student':
        profile = await Student.findOne({ user: req.user.id }).populate('user', ['email', 'role']);
        break;
      case 'school':
        profile = await School.findOne({ user: req.user.id }).populate('user', ['email', 'role']);
        break;
      case 'employer':
        profile = await Employer.findOne({ user: req.user.id }).populate('user', ['email', 'role']);
        break;
    }

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/users/student
// @desc     Create or update student profile
// @access   Private
router.post(
  '/student',
  [
    protect,
    authorize('student'),
    [
      check('firstName', 'First name is required').not().isEmpty(),
      check('lastName', 'Last name is required').not().isEmpty(),
      check('phone', 'Phone is required').not().isEmpty(),
      check('country', 'Country is required').not().isEmpty(),
      check('nationality', 'Nationality is required').not().isEmpty(),
      check('education.*.degree', 'Degree is required').not().isEmpty(),
      check('education.*.institution', 'Institution is required').not().isEmpty(),
      check('education.*.year', 'Year is required').isNumeric(),
      check('interests', 'Interests are required').isArray({ min: 1 }),
      check('languages', 'Languages are required').isArray({ min: 1 }),
      check('availability', 'Availability is required').isIn(['immediate', 'future'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      phone,
      country,
      nationality,
      education,
      interests,
      cv,
      languages,
      availability
    } = req.body;

    // Build profile object
    const profileFields = {
      user: req.user.id,
      firstName,
      lastName,
      phone,
      country,
      nationality,
      education,
      interests,
      languages,
      availability
    };

    if (cv) profileFields.cv = cv;

    try {
      let profile = await Student.findOne({ user: req.user.id });

      if (profile) {
        // Update
        profile = await Student.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      // Create
      profile = new Student(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    POST api/users/school
// @desc     Create or update school profile
// @access   Private
router.post(
  '/school',
  [
    protect,
    authorize('school'),
    [
      check('name', 'School name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('location.country', 'Country is required').not().isEmpty(),
      check('location.city', 'City is required').not().isEmpty(),
      check('location.address', 'Address is required').not().isEmpty(),
      check('programs', 'Programs are required').isArray({ min: 1 }),
      check('contact.name', 'Contact name is required').not().isEmpty(),
      check('contact.email', 'Contact email is required').isEmail(),
      check('contact.phone', 'Contact phone is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      logo,
      banner,
      location,
      programs,
      scholarships,
      website,
      socialMedia,
      contact
    } = req.body;

    // Build profile object
    const profileFields = {
      user: req.user.id,
      name,
      description,
      location,
      programs,
      contact
    };

    if (logo) profileFields.logo = logo;
    if (banner) profileFields.banner = banner;
    if (scholarships) profileFields.scholarships = scholarships;
    if (website) profileFields.website = website;
    if (socialMedia) profileFields.socialMedia = socialMedia;

    try {
      let profile = await School.findOne({ user: req.user.id });

      if (profile) {
        // Update
        profile = await School.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      // Create
      profile = new School(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    POST api/users/employer
// @desc     Create or update employer profile
// @access   Private
router.post(
  '/employer',
  [
    protect,
    authorize('employer'),
    [
      check('companyName', 'Company name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('industry', 'Industry is required').isArray({ min: 1 }),
      check('jobTypes', 'Job types are required').isArray({ min: 1 }),
      check('contact.name', 'Contact name is required').not().isEmpty(),
      check('contact.position', 'Contact position is required').not().isEmpty(),
      check('contact.email', 'Contact email is required').isEmail(),
      check('contact.phone', 'Contact phone is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      companyName,
      description,
      logo,
      industry,
      locations,
      jobTypes,
      website,
      socialMedia,
      contact
    } = req.body;

    // Build profile object
    const profileFields = {
      user: req.user.id,
      companyName,
      description,
      industry,
      jobTypes,
      contact
    };

    if (logo) profileFields.logo = logo;
    if (locations) profileFields.locations = locations;
    if (website) profileFields.website = website;
    if (socialMedia) profileFields.socialMedia = socialMedia;

    try {
      let profile = await Employer.findOne({ user: req.user.id });

      if (profile) {
        // Update
        profile = await Employer.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      // Create
      profile = new Employer(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;