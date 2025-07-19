const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { checkAdmin } = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

router.get('/dashboard', verifyToken, checkAdmin, adminController.getDashboard);

module.exports = router;
