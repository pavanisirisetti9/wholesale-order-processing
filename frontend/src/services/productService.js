
const API_URL = 'http://localhost:5000/api/products'

export async function getProducts() {
  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }

  const result = await response.json()
  return result.data
}
