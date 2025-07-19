const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const testimonialController = require('../controllers/testimonialController');

router.post('/', verifyToken, testimonialController.addTestimonial);
router.get('/', verifyToken, testimonialController.getTestimonials);

module.exports = router;
