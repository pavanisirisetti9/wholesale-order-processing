
const pool = require('../config/db');

async function getProducts(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );
    const offset = (page - 1) * limit;

    const [products] = await pool.query(
      `SELECT product_id, supplier_id, product_name,
              description, price, stock_quantity,
              minimum_order_quantity, category
       FROM products
       ORDER BY product_id
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [[result]] = await pool.query(
      'SELECT COUNT(*) AS total FROM products'
    );

    return res.json({
      success: true,
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Get products error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
}

async function searchProducts(req, res) {
  try {
    // Supports both ?search= and ?keyword=
    const searchTerm = String(
      req.query.search ?? req.query.keyword ?? ''
    ).trim();

    const category = req.query.category;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );
    const offset = (page - 1) * limit;

    let query = `
      FROM products
      WHERE 1 = 1
    `;

    const values = [];

    if (searchTerm) {
      query += ' AND product_name LIKE ?';
      values.push(`%${searchTerm}%`);
    }

    if (category) {
      query += ' AND category = ?';
      values.push(category);
    }

    const [products] = await pool.query(
      `SELECT product_id, supplier_id, product_name,
              description, price, stock_quantity,
              minimum_order_quantity, category
       ${query}
       ORDER BY product_id
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    const [[result]] = await pool.query(
      `SELECT COUNT(*) AS total ${query}`,
      values
    );

    return res.json({
      success: true,
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Search products error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to search products',
    });
  }
}

async function addProduct(req, res) {
  try {
    if (req.user.role !== 'supplier') {
      return res.status(403).json({
        success: false,
        message: 'Only suppliers can add products',
      });
    }

    const {
      product_name,
      description,
      price,
      stock_quantity,
      minimum_order_quantity,
      category,
    } = req.body;

    if (
      typeof product_name !== 'string' ||
      !product_name.trim() ||
      price === undefined ||
      price === null ||
      price === '' ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0 ||
      stock_quantity === undefined ||
      stock_quantity === null ||
      stock_quantity === '' ||
      !Number.isInteger(Number(stock_quantity)) ||
      Number(stock_quantity) < 0 ||
      minimum_order_quantity === undefined ||
      minimum_order_quantity === null ||
      minimum_order_quantity === '' ||
      !Number.isInteger(Number(minimum_order_quantity)) ||
      Number(minimum_order_quantity) < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Provide valid product name, price, stock, and minimum order quantity',
      });
    }

    const [suppliers] = await pool.query(
      `SELECT supplier_id
       FROM suppliers
       WHERE user_id = ? AND verification_status = 'approved'`,
      [req.user.user_id]
    );

    if (suppliers.length === 0) {
      return res.status(403).json({
        success: false,
        message:
          'Supplier profile must be approved before adding products',
      });
    }

    const supplierId = suppliers[0].supplier_id;

    const [result] = await pool.query(
      `INSERT INTO products
       (supplier_id, product_name, description, price,
        stock_quantity, minimum_order_quantity, category)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        supplierId,
        product_name.trim(),
        description || null,
        Number(price),
        Number(stock_quantity),
        Number(minimum_order_quantity),
        category || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: {
        product_id: result.insertId,
        supplier_id: supplierId,
        product_name: product_name.trim(),
        description: description || null,
        price: Number(price),
        stock_quantity: Number(stock_quantity),
        minimum_order_quantity: Number(minimum_order_quantity),
        category: category || null,
      },
    });
  } catch (error) {
    console.error('Add product error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to add product',
    });
  }
}

module.exports = {
  getProducts,
  searchProducts,
  addProduct,
};
