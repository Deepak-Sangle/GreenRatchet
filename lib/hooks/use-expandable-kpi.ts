/**
 * Reusable hook for expandable KPI components
 * Handles expand/collapse state, data loading, and error handling
 */

import { useEffect, useState } from "react";

/**
 * Generic hook for expandable KPI data loading
 * @param fetchAction - Server action that fetches the KPI data
 * @returns State and handlers for expandable KPI component
 */
export function useExpandableKpi<T>(
  fetchAction: () => Promise<{ data: T } | { error: string }>
) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isExpanded && !data) {
      loadData();
    }
  }, [isExpanded, data]);

  async function loadData() {
    setLoading(true);
    setError(null);
    const result = await fetchAction();
    if ("error" in result) {
      setError(result.error);
    } else {
      setData(result.data);
    }
    setLoading(false);
  }

  return {
    isExpanded,
    setIsExpanded,
    data,
    loading,
    error,
    loadData,
  };
}
