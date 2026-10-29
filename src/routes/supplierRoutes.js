
const express = require('express');

const { registerSupplier } = require('../controllers/supplierController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authMiddleware, registerSupplier);

module.exports = router;
