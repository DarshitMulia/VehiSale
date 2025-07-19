const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const productController = require('../controllers/productController');

router.post('/add', verifyToken, upload.single('image'), productController.addProduct);
router.get('/pending', verifyToken, productController.getAllPending);
router.put('/pending/approve-reject/:id', verifyToken, productController.approveOrReject);
router.get('/rejected', verifyToken, productController.getAllRejected);
router.get('/user/approved', verifyToken, productController.getUserApproved);
router.get('/user/rejected', verifyToken, productController.getUserRejected);
router.get('/user/pending', verifyToken, productController.getUserPending);
router.get('/', verifyToken, productController.getAll);
router.get('/:id', verifyToken, productController.getById);
router.delete('/:id', verifyToken, productController.delete);
router.put('/:id', verifyToken, productController.update);
router.get('/search/:key', verifyToken, productController.search);

module.exports = router;
