import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiService'; // Assuming you have this from previous step

export const useFetch = (url, options = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Flag to prevent race conditions if component unmounts
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await apiClient(url, options?.headers);
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
    // JSON.stringify(options) is a trick to compare objects in dependency array
  }, [url, JSON.stringify(options)]);

  return { data, loading, error };
};