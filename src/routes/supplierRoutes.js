
const express = require('express');
const {
  registerSupplier,
  getSuppliers,
} = require('../controllers/supplierController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getSuppliers);
router.post('/register', authMiddleware, registerSupplier);

module.exports = router;
