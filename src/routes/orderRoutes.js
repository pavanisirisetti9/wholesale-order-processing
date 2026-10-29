
const express = require('express');

const {
  createOrder,
  getMyOrders,
  getSupplierOrders,
  updateSupplierOrderStatus
} = require('../controllers/orderController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Buyer places an order
router.post('/', authMiddleware, createOrder);

// Buyer views their orders
router.get('/my-orders', authMiddleware, getMyOrders);

// Supplier views orders for their products
router.get('/supplier-orders', authMiddleware, getSupplierOrders);

// Supplier updates order status
router.patch(
  '/:orderId/status',
  authMiddleware,
  updateSupplierOrderStatus
);

module.exports = router;
