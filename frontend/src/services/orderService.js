
const API_URL = 'http://127.0.0.1:5000/api/orders';

export async function createOrder(orderData) {
  const token = localStorage.getItem('token');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to place order');
  }

  return result.data;
}
