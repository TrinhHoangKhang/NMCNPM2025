const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const apiClient = async (endpoint, options = {}) => {
  const { method = 'GET', headers: customHeaders = {}, body, params } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const fullUrl = url;

  // Get current user token from localStorage
  let token = null;
  try {
    const sessionStr = localStorage.getItem("active_session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      // AdminWeb might store it directly or nested. Based on previous steps, check 'value.token'
      token = session.value?.token || session.token;
    }
  } catch (e) {
    console.error("Error reading token", e);
  }

  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : undefined,
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

  // Handle empty response
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};