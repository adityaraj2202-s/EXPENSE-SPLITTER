const API_URL = (import.meta.env.VITE_API_URL || '/api') + '/groups';

export const getGroups = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch groups');
  }

  return response.json();
};

export const createGroup = async (name) => {
  const token = localStorage.getItem('token');
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create group');
  }

  return response.json();
};

export const getGroupMembers = async (groupId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/${groupId}/members`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch group members');
  }

  return response.json();
};

export const addGroupMember = async (groupId, email) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/${groupId}/members`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add member');
  }

  return response.json();
};

export const removeGroupMember = async (groupId, userId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/${groupId}/members/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to remove member');
  }

  return response.json();
};

export const getDashboardSummary = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch('/api/dashboard/summary', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback if server wasn't restarted
  }

  const groupsData = await getGroups();
  const groups = groupsData.groups || [];
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = storedUser.id;

  let totalYouAreOwed = 0;
  let totalYouOwe = 0;
  const allActivities = [];

  const enrichedGroups = await Promise.all(
    groups.map(async (g) => {
      try {
        const balRes = await fetch(`${API_URL}/${g.id}/balances`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const balData = balRes.ok ? await balRes.json() : {};
        const net = balData.balances?.[currentUserId] || 0;
        if (net > 0.009) totalYouAreOwed += net;
        if (net < -0.009) totalYouOwe += Math.abs(net);

        const expRes = await fetch(`${API_URL}/${g.id}/expenses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (expRes.ok) {
          const expData = await expRes.json();
          (expData.expenses || []).forEach((e) => {
            allActivities.push({
              type: 'expense',
              ...e,
              group_name: g.name,
              actor_name: e.payer_name || e.paid_by_name || 'Member',
            });
          });
        }

        const setRes = await fetch(`${API_URL}/${g.id}/settlements`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (setRes.ok) {
          const setData = await setRes.json();
          (setData.settlements || []).forEach((s) => {
            allActivities.push({
              type: 'settlement',
              ...s,
              group_name: g.name,
              actor_name: s.from_user_name,
              receiver_name: s.to_user_name,
              description: 'Settled debt',
            });
          });
        }

        return { ...g, userNetBalance: net };
      } catch {
        return { ...g, userNetBalance: 0 };
      }
    })
  );

  allActivities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return {
    groups: enrichedGroups,
    totals: {
      totalNetBalance: Math.round((totalYouAreOwed - totalYouOwe) * 100) / 100,
      totalYouAreOwed: Math.round(totalYouAreOwed * 100) / 100,
      totalYouOwe: Math.round(totalYouOwe * 100) / 100,
    },
    activities: allActivities.slice(0, 30),
  };
};
