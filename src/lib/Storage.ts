export const saveState = (key: string, value: unknown) => {
  try {
    const serializedState = JSON.stringify(value);
    localStorage.setItem(key, serializedState);
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
};

export const loadState = (key: string) => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading from localStorage:', err);
    return undefined;
  }
};

export const removeState = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Error removing from localStorage:', err);
  }
};

// Token management
export const saveToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('auth');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
  localStorage.removeItem('regionId');
};