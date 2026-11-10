const API_URL = 'http://localhost:5001/api/groups';

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