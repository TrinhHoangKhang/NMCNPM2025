const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const apiClient = async (endpoint, options = {}) => {
  const fullUrl = `${BASE_URL}${endpoint}`;

  const { method = 'GET', headers: customHeaders = {}, body } = options;

  // Get current user token if logged in
  let token = null;
  try {
    const sessionStr = localStorage.getItem("active_session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      token = session.value?.token || session.value?.user?.token;
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