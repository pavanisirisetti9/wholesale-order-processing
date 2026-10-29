
const pool = require('../config/db');

async function registerSupplier(req, res) {
  try {
    const { company_name, phone, address } = req.body;
    const user_id = req.user.user_id;

    if (
      typeof company_name !== 'string' ||
      !company_name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required',
      });
    }

    const [existingSupplier] = await pool.query(
      'SELECT supplier_id FROM suppliers WHERE user_id = ?',
      [user_id]
    );

    if (existingSupplier.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Supplier profile already exists',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO suppliers
       (user_id, company_name, phone, address)
       VALUES (?, ?, ?, ?)`,
      [
        user_id,
        company_name.trim(),
        phone || null,
        address || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Supplier profile created successfully',
      data: {
        supplier_id: result.insertId,
        user_id,
        company_name: company_name.trim(),
        phone: phone || null,
        address: address || null,
        verification_status: 'pending',
      },
    });
  } catch (error) {
    console.error('Register supplier error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to create supplier profile',
    });
  }
}

module.exports = { registerSupplier };
