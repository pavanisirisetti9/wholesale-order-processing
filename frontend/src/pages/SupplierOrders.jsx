
import { useEffect, useState } from 'react'

function SupplierOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  async function fetchOrders() {
    try {
      setError('')

      const token = localStorage.getItem('token')

      const response = await fetch(
        'http://127.0.0.1:5000/api/orders/supplier-orders',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch supplier orders')
      }

      setOrders(result.data || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch supplier orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  async function updateStatus(orderId, status) {
    try {
      setUpdatingId(orderId)
      setError('')

      const token = localStorage.getItem('token')

      const response = await fetch(
        `http://127.0.0.1:5000/api/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_status: status,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update order status')
      }

      await fetchOrders()
    } catch (err) {
      setError(err.message || 'Failed to update order status')
    } finally {
      setUpdatingId(null)
    }
  }

  function getAvailableStatuses(status) {
    switch (status?.toLowerCase()) {
      case 'pending':
        return [
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'shipped', label: 'Shipped' },
        ]

      case 'confirmed':
        return [
          { value: 'shipped', label: 'Shipped' },
        ]

      case 'shipped':
        return [
          { value: 'delivered', label: 'Delivered' },
        ]

      default:
        return []
    }
  }

  if (loading) {
    return (
      <section className="page-content">
        <p className="page-note">Loading orders...</p>
      </section>
    )
  }

  return (
    <section className="page-content">
      <div className="section-heading">
        <div>
          <h2>Supplier Orders</h2>
          <p>View orders for your products and update their status.</p>
        </div>

        <span>{orders.length} order items</span>
      </div>

      {error && <p className="page-note">{error}</p>}

      {orders.length === 0 ? (
        <p className="page-note">No supplier orders found.</p>
      ) : (
        <div className="orders-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Buyer</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order, index) => {
                const availableStatuses = getAvailableStatuses(
                  order.order_status
                )

                return (
                  <tr
                    key={`${order.order_id}-${order.product_id}-${index}`}
                  >
                    <td>ORD-{order.order_id}</td>
                    <td>{order.product_name}</td>
                    <td>{order.quantity}</td>
                    <td>{order.buyer_name}</td>

                    <td>
                      {order.order_status.charAt(0).toUpperCase() +
                        order.order_status.slice(1)}
                    </td>

                    <td>
                      {availableStatuses.length > 0 ? (
                        <select
                          key={`${order.order_id}-${order.order_status}`}
                          defaultValue=""
                          disabled={updatingId === order.order_id}
                          onChange={(event) => {
                            const selectedStatus = event.target.value

                            if (selectedStatus) {
                              updateStatus(order.order_id, selectedStatus)
                            }
                          }}
                        >
                          <option value="" disabled>
                            Select status
                          </option>

                          {availableStatuses.map((status) => (
                            <option
                              key={status.value}
                              value={status.value}
                            >
                              {status.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        'Completed'
                      )}

                      {updatingId === order.order_id && (
                        <span> Updating...</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default SupplierOrders
