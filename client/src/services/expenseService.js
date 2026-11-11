const API_BASE = 'http://localhost:5001/api/groups';

export const getExpenses = async (groupId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/${groupId}/expenses`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch expenses');
  }

  return response.json();
};

export const createExpense = async (groupIdOrPayload, optionalPayload) => {
  const token = localStorage.getItem('token');
  const isObj = typeof groupIdOrPayload === 'object';
  const groupId = isObj ? groupIdOrPayload.groupId : groupIdOrPayload;
  const data = isObj ? groupIdOrPayload : optionalPayload;

  const response = await fetch(`${API_BASE}/${groupId}/expenses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: data.description,
      amount: parseFloat(data.amount),
      category: data.category || 'General',
      payerId: Number(data.payerId || data.paidById),
      splitUserIds: Array.isArray(data.splitUserIds) ? data.splitUserIds.map(Number) : [],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add expense');
  }

  return response.json();
};
