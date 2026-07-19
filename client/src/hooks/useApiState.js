import { useState } from 'react';

export default function useApiState(initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return {
    data,
    setData,
    loading,
    setLoading,
    error,
    setError,
  };
}