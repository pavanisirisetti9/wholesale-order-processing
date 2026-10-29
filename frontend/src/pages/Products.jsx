
import { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';
import { createOrder } from '../services/orderService';
import '../App.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError('');

        const data = await getProducts();
        setProducts(data);

        const initialQuantities = {};
        data.forEach((product) => {
          initialQuantities[product.product_id] =
            product.minimum_order_quantity || 1;
        });

        setQuantities(initialQuantities);
      } catch (err) {
        setError(err.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const handlePlaceOrder = async (product) => {
    setMessage('');
    setError('');

    const token = localStorage.getItem('token');

    if (!token) {
      setError('Please login before placing an order.');
      return;
    }

    const quantity = Number(quantities[product.product_id]);
    const minimumQuantity = Number(product.minimum_order_quantity || 1);
    const availableStock = Number(product.stock_quantity);

    if (!shippingAddress.trim()) {
      setError('Please enter your shipping address.');
      return;
    }

    if (!Number.isInteger(quantity) || quantity < minimumQuantity) {
      setError(`Minimum order quantity is ${minimumQuantity}.`);
      return;
    }

    if (quantity > availableStock) {
      setError(`Only ${availableStock} items are available in stock.`);
      return;
    }

    try {
      setPlacingOrder(product.product_id);

      const order = await createOrder({
        items: [
          {
            product_id: product.product_id,
            quantity,
          },
        ],
        shipping_address: shippingAddress.trim(),
      });

      setMessage(
        `Order ORD-${order.order_id} placed successfully!`
      );

      // Clear the selected quantity after successful order placement.
      setQuantities((previous) => ({
        ...previous,
        [product.product_id]: product.minimum_order_quantity || 1,
      }));

      // Refresh products to show the latest stock.
      const updatedProducts = await getProducts();
      setProducts(updatedProducts);
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(null);
    }
  };

  return (
    <section className="page-content">
      <div className="section-heading">
        <h1>Products</h1>
        <p>Browse products and place your order.</p>
      </div>

      {message && (
        <div
          className="success-message"
          role="status"
          style={{
            padding: '14px 16px',
            marginBottom: '20px',
            backgroundColor: '#dcfce7',
            color: '#166534',
            border: '1px solid #86efac',
            borderRadius: '8px',
          }}
        >
          ✓ {message}
        </div>
      )}

      {error && (
        <div
          className="error-message"
          role="alert"
          style={{
            padding: '14px 16px',
            marginBottom: '20px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
          }}
        >
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="shippingAddress">Shipping Address</label>
        <input
          id="shippingAddress"
          type="text"
          value={shippingAddress}
          onChange={(event) => setShippingAddress(event.target.value)}
          placeholder="Enter your complete shipping address"
          required
        />
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.product_id}>
              <div className="product-art">
                <span>📦</span>
              </div>

              <div className="product-details">
                <p>{product.category || 'General'}</p>

                <h3>{product.product_name}</h3>

                <p>Product ID: {product.product_id}</p>

                <p>
                  Minimum order: {product.minimum_order_quantity || 1}
                </p>

                <p>
                  Available stock: {product.stock_quantity}
                </p>

                <p className="product-price">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </p>

                <label htmlFor={`quantity-${product.product_id}`}>
                  Quantity
                </label>

                <input
                  id={`quantity-${product.product_id}`}
                  type="number"
                  min={product.minimum_order_quantity || 1}
                  max={product.stock_quantity}
                  value={quantities[product.product_id] ?? ''}
                  onChange={(event) =>
                    setQuantities((previous) => ({
                      ...previous,
                      [product.product_id]: event.target.value,
                    }))
                  }
                  disabled={placingOrder !== null}
                />

                <button
                  type="button"
                  onClick={() => handlePlaceOrder(product)}
                  disabled={
                    placingOrder !== null ||
                    Number(product.stock_quantity) <= 0
                  }
                >
                  {placingOrder === product.product_id
                    ? 'Placing Order...'
                    : Number(product.stock_quantity) <= 0
                      ? 'Out of Stock'
                      : 'Place Order'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Products;
