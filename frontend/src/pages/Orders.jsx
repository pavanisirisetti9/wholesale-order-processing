
import { useEffect, useState } from 'react'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchOrders() {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          throw new Error('Please log in to view your orders')
        }

        const response = await fetch(
          'http://localhost:5000/api/orders/my-orders',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to fetch orders')
        }

        const groupedOrders = Object.values(
          result.data.reduce((groups, item) => {
            const id = item.order_id

            if (!groups[id]) {
  groups[id] = {
    id,
    date: item.order_date,
    amount: Number(item.total_amount),
    status: item.order_status,
    products: [],
  }
}

if (item.product_name) {
  groups[id].products.push({
    name: item.product_name,
    quantity: Number(item.quantity),
  })
}

            return groups
          }, {})
        )

        setOrders(groupedOrders)
      } catch (err) {
        setError(err.message || 'Unable to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  function formatDate(date) {
    if (!date) return '—'

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  function formatStatus(status) {
    if (!status) return 'Unknown'
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <section className="page-content">
      <div className="section-heading">
        <div>
          <h2>Orders</h2>
          <p>Track and manage wholesale orders</p>
        </div>
        <span>{orders.length} orders</span>
      </div>

      {loading ? (
        <p className="page-note">Loading orders...</p>
      ) : error ? (
        <p className="page-note">{error}</p>
      ) : orders.length === 0 ? (
        <p className="page-note">No orders found yet.</p>
      ) : (
        <div className="orders-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Buyer</th>
                <th>Products</th>
                <th>Order Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>ORD-{order.id}</td>
                  <td>My order</td>
                  <td>
  {order.products.map((product, index) => (
    <div key={`${product.name}-${index}`}>
      {product.name} × {product.quantity}
    </div>
  ))}
</td>
                  <td>{formatDate(order.date)}</td>
                  <td>₹{order.amount.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {formatStatus(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Orders
