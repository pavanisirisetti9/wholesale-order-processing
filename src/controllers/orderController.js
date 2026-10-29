const pool = require('../config/db');

async function createOrder(req, res) {
  let connection;

  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can place orders'
      });
    }

    const { items, shipping_address } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one product in items'
      });
    }

    if (
      typeof shipping_address !== 'string' ||
      !shipping_address.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    const productIds = items.map(item => Number(item.product_id));

    if (
      productIds.some(id => !Number.isInteger(id) || id < 1) ||
      new Set(productIds).size !== productIds.length ||
      items.some(item =>
        item.quantity === undefined ||
        item.quantity === null ||
        item.quantity === '' ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Provide unique product IDs and valid quantities'
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const [products] = await connection.query(
        `SELECT product_id, product_name, price,
                stock_quantity, minimum_order_quantity
         FROM products
         WHERE product_id = ?
         FOR UPDATE`,
        [Number(item.product_id)]
      );

      if (products.length === 0) {
        throw new Error(`Product ${item.product_id} not found`);
      }

      const product = products[0];
      const quantity = Number(item.quantity);

      if (quantity < product.minimum_order_quantity) {
        throw new Error(
          `${product.product_name}: minimum order quantity is ${product.minimum_order_quantity}`
        );
      }

      if (quantity > product.stock_quantity) {
        throw new Error(
          `${product.product_name}: insufficient stock`
        );
      }

      totalAmount += Number(product.price) * quantity;

      orderItems.push({
        product_id: product.product_id,
        quantity,
        unit_price: product.price
      });
    }

    const [orderResult] = await connection.query(
      `INSERT INTO orders
       (buyer_id, total_amount, order_status, shipping_address)
       VALUES (?, ?, 'pending', ?)`,
      [req.user.user_id, totalAmount, shipping_address.trim()]
    );

    const orderId = orderResult.insertId;

    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_items
         (order_id, product_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.quantity,
          item.unit_price
        ]
      );

      await connection.query(
        `UPDATE products
         SET stock_quantity = stock_quantity - ?
         WHERE product_id = ?`,
        [item.quantity, item.product_id]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order_id: orderId,
        buyer_id: req.user.user_id,
        total_amount: Number(totalAmount.toFixed(2)),
        order_status: 'pending',
        shipping_address: shipping_address.trim(),
        items: orderItems
      }
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('Create order error:', error.message);

    const isClientError =
      error.message.includes('not found') ||
      error.message.includes('minimum order quantity') ||
      error.message.includes('insufficient stock');

    return res.status(isClientError ? 400 : 500).json({
      success: false,
      message: isClientError
        ? error.message
        : 'Failed to place order'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function getMyOrders(req, res) {
  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can view their orders'
      });
    }

    const [orders] = await pool.query(
      `SELECT
         o.order_id,
         o.order_date,
         o.total_amount,
         o.order_status,
         o.shipping_address,
         oi.product_id,
         p.product_name,
         oi.quantity,
         oi.unit_price,
         oi.subtotal
       FROM orders o
       LEFT JOIN order_items oi ON o.order_id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.product_id
       WHERE o.buyer_id = ?
       ORDER BY o.order_date DESC, o.order_id DESC`,
      [req.user.user_id]
    );

    return res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
}

async function getSupplierOrders(req, res) {
  try {
    if (req.user.role !== 'supplier') {
      return res.status(403).json({
        success: false,
        message: 'Only suppliers can view their orders'
      });
    }

    const [orders] = await pool.query(
      `SELECT
         o.order_id,
         o.order_date,
         o.order_status,
         o.shipping_address,
         o.total_amount,
         oi.product_id,
         p.product_name,
         oi.quantity,
         oi.unit_price,
         oi.subtotal,
         u.full_name AS buyer_name,
         u.email AS buyer_email
       FROM orders o
       JOIN order_items oi ON o.order_id = oi.order_id
       JOIN products p ON oi.product_id = p.product_id
       JOIN users u ON o.buyer_id = u.user_id
       JOIN suppliers s ON p.supplier_id = s.supplier_id
       WHERE s.user_id = ?
       ORDER BY o.order_date DESC, o.order_id DESC`,
      [req.user.user_id]
    );

    return res.status(200).json({
      success: true,
      message: 'Supplier orders fetched successfully',
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get supplier orders error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier orders'
    });
  }
}

async function updateSupplierOrderStatus(req, res) {
  try {
    if (req.user.role !== 'supplier') {
      return res.status(403).json({
        success: false,
        message: 'Only suppliers can update order status'
      });
    }

    const orderId = Number(req.params.orderId);
    const { order_status } = req.body;

    const allowedStatuses = [
      'confirmed',
      'shipped',
      'delivered'
    ];

    if (!Number.isInteger(orderId) || orderId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid order ID is required'
      });
    }

    if (!allowedStatuses.includes(order_status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be confirmed, shipped, or delivered'
      });
    }

    const [supplierOrders] = await pool.query(
      `SELECT DISTINCT o.order_id, o.order_status
       FROM orders o
       JOIN order_items oi ON o.order_id = oi.order_id
       JOIN products p ON oi.product_id = p.product_id
       JOIN suppliers s ON p.supplier_id = s.supplier_id
       WHERE o.order_id = ?
         AND s.user_id = ?`,
      [orderId, req.user.user_id]
    );

    if (supplierOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found for this supplier'
      });
    }

    const currentStatus = supplierOrders[0].order_status;

    const allowedTransitions = {
      pending: ['confirmed'],
      confirmed: ['shipped'],
      shipped: ['delivered'],
      delivered: []
    };

    if (!allowedTransitions[currentStatus]?.includes(order_status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from ${currentStatus} to ${order_status}`
      });
    }

    await pool.query(
      `UPDATE orders
       SET order_status = ?
       WHERE order_id = ?`,
      [order_status, orderId]
    );

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        order_id: orderId,
        order_status
      }
    });
  } catch (error) {
    console.error('Update order status error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getSupplierOrders,
  updateSupplierOrderStatus
};