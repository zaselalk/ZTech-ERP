
const api = {
  async fetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token is invalid or expired, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return response;
  },
};

export default api;
