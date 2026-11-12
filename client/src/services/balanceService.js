const API_BASE = (import.meta.env.VITE_API_URL || '/api') + '/groups';

export const getGroupBalances = async (groupId) => {
  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const [balRes, debtsRes] = await Promise.all([
    fetch(`${API_BASE}/${groupId}/balances`, { headers }),
    fetch(`${API_BASE}/${groupId}/simplified-debts`, { headers }),
  ]);

  if (!balRes.ok) {
    const err = await balRes.json();
    throw new Error(err.error || 'Failed to fetch balances');
  }

  const balData = await balRes.json();
  const debtsData = debtsRes.ok ? await debtsRes.json() : { suggestedTransactions: [] };

  // Convert balances array into an id-indexed map for direct lookup
  const balancesMap = {};
  if (Array.isArray(balData.balances)) {
    balData.balances.forEach((b) => {
      balancesMap[b.userId] = b.netBalance;
    });
  }

  return {
    balances: balancesMap,
    settlements: debtsData.suggestedTransactions || [],
  };
};

export const settlePayment = async (groupId, { toUserId, amount }) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/${groupId}/settlements`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      toUserId: Number(toUserId),
      amount: parseFloat(amount),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to record settlement');
  }

  return response.json();
};
export const getSettlementHistory = async (groupId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/${groupId}/settlements`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch settlement history');
  }

  return response.json();
};