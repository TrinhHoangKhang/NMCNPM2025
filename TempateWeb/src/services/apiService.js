const BASE_URL = import.meta.env.VITE_SUPABASE_URL;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const apiClient = async (endpoint, options = {}) => {
  const fullUrl = `${BASE_URL}${endpoint}`;

  const { method = 'GET', headers = {}, body } = options;

  const config = {
    method: method,
    headers: {
      'apikey': API_KEY,
      'Authorization': `Bearer ${API_KEY}`,
      ...headers
    },
    body: body,
  };

  const response = await fetch(fullUrl, config);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  const text = await response.text();

  return text ? JSON.parse(text) : null;
};