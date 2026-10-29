
const express = require('express');

const {
  getProducts,
  searchProducts,
  addProduct,
} = require('../controllers/productController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/search', searchProducts);
router.post('/', authMiddleware, addProduct);
router.get('/', getProducts);

module.exports = router;
