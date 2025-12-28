const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const apiClient = async (endpoint, options = {}) => {
  const fullUrl = `${BASE_URL}${endpoint}`;

  const { method = 'GET', headers = {}, body } = options;

  // Get current user token if logged in
  let token = null;

  const config = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body,
  };

  const response = await fetch(fullUrl, config);

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API Error ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.error) errorMessage = errorJson.error;
    } catch (e) { }

    throw new Error(errorMessage);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};