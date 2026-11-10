const API_BASE = 'http://localhost:5001/api/groups';

export const getExpenses = async (groupId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/${groupId}/expenses`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch expenses');
  }

  return response.json();
};

export const createExpense = async (groupId, { description, amount, payerId, splitUserIds }) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/${groupId}/expenses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description,
      amount: parseFloat(amount),
      payerId: Number(payerId),
      splitUserIds: splitUserIds.map(Number),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add expense');
  }

  return response.json();
};