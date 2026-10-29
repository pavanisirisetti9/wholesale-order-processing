import { useEffect, useState } from 'react'
import { getProducts } from './services/productService'
import { logoutUser } from './services/authService'
import Login from './pages/Login'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Suppliers from './pages/Suppliers'
import SupplierOrders from './pages/SupplierOrders'
import './App.css'

const orders = [
  {
    id: '#ORD-1001',
    buyer: 'Ravi Enterprises',
    date: '29 Oct 2026',
    amount: 4500,
    status: 'Processing',
  },
  {
    id: '#ORD-1002',
    buyer: 'Sri Lakshmi Stores',
    date: '28 Oct 2026',
    amount: 2750,
    status: 'Pending',
  },
  {
    id: '#ORD-1003',
    buyer: 'Vijaya Traders',
    date: '27 Oct 2026',
    amount: 6200,
    status: 'Completed',
  },
  {
    id: '#ORD-1004',
    buyer: 'Sai Distributors',
    date: '26 Oct 2026',
    amount: 1800,
    status: 'Pending',
  },
]

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')

    try {
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      return null
    }
  })

  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productError, setProductError] = useState('')

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (error) {
        setProductError(error.message || 'Failed to load products')
      } finally {
        setLoadingProducts(false)
      }
    }

    loadProducts()
  }, [])

  const pendingOrders = orders.filter(
    (order) => order.status === 'Pending',
  ).length

  const pageTitles = {
    dashboard: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    suppliers: 'Suppliers',
    supplierOrders: 'Supplier Orders',
  }

  function navigateTo(page) {
    setActivePage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleLogout() {
    logoutUser()
    setUser(null)
    setActivePage('dashboard')
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">W</div>
          <div>
            <h2>
              Wholesale<span>Hub</span>
            </h2>
            <p>BUSINESS PORTAL</p>
          </div>
        </div>

        <p className="menu-label">MAIN MENU</p>

        <nav className="navigation">
          <a
            href="#dashboard"
            className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={(event) => {
              event.preventDefault()
              navigateTo('dashboard')
            }}
          >
            <span>▦</span> Dashboard
          </a>

          <a
            href="#products"
            className={`nav-link ${activePage === 'products' ? 'active' : ''}`}
            onClick={(event) => {
              event.preventDefault()
              navigateTo('products')
            }}
          >
            <span>▣</span> Products
          </a>

          <a
            href="#orders"
            className={`nav-link ${activePage === 'orders' ? 'active' : ''}`}
            onClick={(event) => {
              event.preventDefault()
              navigateTo('orders')
            }}
          >
            <span>▤</span> Orders
          </a>

          <a
            href="#suppliers"
            className={`nav-link ${activePage === 'suppliers' ? 'active' : ''}`}
            onClick={(event) => {
              event.preventDefault()
              navigateTo('suppliers')
            }}
          >
            <span>♧</span> Suppliers
          </a>

          {user.role === 'supplier' && (
            <a
              href="#supplier-orders"
              className={`nav-link ${activePage === 'supplierOrders' ? 'active' : ''}`}
              onClick={(event) => {
                event.preventDefault()
                navigateTo('supplierOrders')
              }}
            >
              <span>▤</span> Supplier Orders
            </a>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">?</div>
            <strong>Need help?</strong>
            <p>Contact support for assistance.</p>
            <a href="mailto:support@example.com">
              Contact Support →
            </a>
          </div>

          <div className="user-profile">
            <div className="avatar">
              {(user.full_name || user.email || 'U')
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="user-info">
              <strong>{user.full_name || user.email}</strong>
              <span>{user.role || 'User'}</span>
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> {pageTitles[activePage]}
          </div>

          <div className="topbar-right">
            <span className="online-dot"></span>
            <span className="system-status">System online</span>

            <div className="notification" aria-label="Notifications">
              ♧
            </div>

            <div className="avatar top-avatar">
              {(user.full_name || user.email || 'U')
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </header>

        {activePage === 'dashboard' && (
          <div className="page-content">
            <section className="welcome-row">
              <div>
                <p className="eyebrow">OVERVIEW</p>
                <h1>
                  Good morning, {user.full_name || 'User'} <span>✦</span>
                </h1>
                <p className="subtitle">
                  Here's what's happening with your wholesale
                  business today.
                </p>
              </div>

              <div className="date-label">
                ▦ &nbsp; Thursday, October 29, 2026
              </div>
            </section>

            <section className="stats-grid">
              <article className="stat-card">
                <div className="stat-top">
                  <span>Total Products</span>
                  <span className="stat-icon purple">▣</span>
                </div>
                <h2>
                  {loadingProducts
                    ? '...'
                    : products.length.toString().padStart(2, '0')}
                </h2>
                <p>
                  <span className="stat-note">Product catalog</span>
                </p>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>Total Orders</span>
                  <span className="stat-icon blue">▤</span>
                </div>
                <h2>{orders.length.toString().padStart(2, '0')}</h2>
                <p>
                  <span className="stat-note">Sample orders</span>
                </p>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>Pending Orders</span>
                  <span className="stat-icon orange">◷</span>
                </div>
                <h2>{pendingOrders.toString().padStart(2, '0')}</h2>
                <p>
                  <span className="pending-note">Needs attention</span>
                </p>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>Active Suppliers</span>
                  <span className="stat-icon green">♧</span>
                </div>
                <h2>—</h2>
                <p>
                  <span className="stat-note">
                    Supplier API not connected
                  </span>
                </p>
              </article>
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Recent Orders</h2>
                  <p>Track and manage your latest orders.</p>
                </div>

                <button
                  type="button"
                  className="view-all"
                  onClick={() => navigateTo('orders')}
                >
                  View all orders →
                </button>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ORDER ID</th>
                      <th>BUYER</th>
                      <th>ORDER DATE</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="order-id">{order.id}</td>
                        <td>{order.buyer}</td>
                        <td className="muted">{order.date}</td>
                        <td className="amount">
                          ₹{order.amount.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span
                            className={`status ${order.status.toLowerCase()}`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                Showing {orders.length} sample orders
              </div>
            </section>

            <section className="content-card products-card">
              <div className="section-heading">
                <div>
                  <h2>Product Catalog</h2>
                  <p>Products loaded from your wholesale database.</p>
                </div>

                <button
                  type="button"
                  className="view-all"
                  onClick={() => navigateTo('products')}
                >
                  {loadingProducts
                    ? 'Loading...'
                    : `${products.length} products →`}
                </button>
              </div>

              {loadingProducts ? (
                <p>Loading products...</p>
              ) : productError ? (
                <p role="alert">
                  Unable to load products: {productError}
                </p>
              ) : products.length === 0 ? (
                <p>No products available.</p>
              ) : (
                <div className="product-grid">
                  {products.map((product, index) => (
                    <article
                      className="product-card"
                      key={product.product_id}
                    >
                      <div className={`product-art art-${(index % 4) + 1}`}>
                        {['🖱️', '⌨️', '📚', '🎧'][index % 4]}
                      </div>

                      <div className="product-details">
                        <span className="product-category">
                          {product.category || 'General'}
                        </span>

                        <h3>{product.product_name}</h3>

                        <p className="product-id">
                          Product ID: {product.product_id}
                        </p>

                        <p className="product-id">
                          Minimum order: {product.minimum_order_quantity}
                        </p>

                        <div className="product-bottom">
                          <strong>
                            ₹{Number(product.price).toLocaleString('en-IN')}
                          </strong>
                          <span>{product.stock_quantity} in stock</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="supplier-banner">
              <div className="supplier-symbol">♧</div>
              <div>
                <h2>Supplier Management</h2>
                <p>
                  Manage supplier profiles and keep your business network
                  organized.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('suppliers')}
              >
                Explore suppliers →
              </button>
            </section>

            <footer className="footer">
              <span>© 2026 WholesaleHub. All rights reserved.</span>
              <span>
                Wholesale Order Processing &amp; Supplier Portal
              </span>
            </footer>
          </div>
        )}

        {activePage === 'products' && <Products />}

        {activePage === 'orders' && <Orders />}

        {activePage === 'suppliers' && <Suppliers />}

        {activePage === 'supplierOrders' && <SupplierOrders />}
      </main>
    </div>
  )
}

export default App
