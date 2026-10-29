
import { useEffect, useState } from 'react'

function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          setError('Suppliers choodataniki login avvali.')
          return
        }

        const response = await fetch(
          'http://127.0.0.1:5000/api/suppliers',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Suppliers load failed')
        }

        setSuppliers(result.data)
      } catch (err) {
        setError(err.message || 'Suppliers load cheyyalekapoyamu.')
      } finally {
        setLoading(false)
      }
    }

    loadSuppliers()
  }, [])

  return (
    <section className="page-content">
      <div className="section-heading">
        <div>
          <h2>Suppliers</h2>
          <p>Manage your supplier directory</p>
        </div>
        <span>{suppliers.length} suppliers</span>
      </div>

      {loading && <p>Loading suppliers...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && suppliers.length === 0 && (
        <p>No suppliers available.</p>
      )}

      {!loading && !error && suppliers.length > 0 && (
        <div className="supplier-list">
          {suppliers.map((supplier) => (
            <article
              className="supplier-card"
              key={supplier.supplier_id}
            >
              <div className="supplier-avatar">
                {supplier.company_name.charAt(0).toUpperCase()}
              </div>

              <div className="supplier-info">
                <h3>{supplier.company_name}</h3>
                <p>Supplier ID: {supplier.supplier_id}</p>
                <p>{supplier.phone || 'Phone not provided'}</p>
                <p>{supplier.address || 'Address not provided'}</p>

                <span className="status-badge completed">
                  {supplier.verification_status}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Suppliers
