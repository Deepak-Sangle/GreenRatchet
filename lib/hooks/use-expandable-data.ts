"use client";

import { useEffect, useState } from "react";

interface UseExpandableDataOptions<T> {
  fetchData: () => Promise<{ success: true; data: T } | { error: string }>;
  autoLoad?: boolean;
}

export function useExpandableData<T>({ 
  fetchData, 
  autoLoad = false 
}: UseExpandableDataOptions<T>) {
  const [isExpanded, setIsExpanded] = useState(autoLoad);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchData();
      if ("error" in result) {
        setError(result.error);
      } else {
        setData(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded && !data && !loading) {
      loadData();
    }
  }, [isExpanded]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const refresh = () => {
    setData(null);
    if (isExpanded) {
      loadData();
    }
  };

  return {
    isExpanded,
    data,
    loading,
    error,
    toggleExpanded,
    loadData,
    refresh,
  };
}
