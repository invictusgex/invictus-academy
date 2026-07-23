"use client";

import { useEffect, useState } from "react";

import { ScenarioLibraryService } from "@/lib/services/scenario-library.service";
import type { PublishedScenario } from "@/lib/types/scenario-library.types";

export function useRecentPublishedScenarios(limit = 3) {
  const [scenarios, setScenarios] = useState<PublishedScenario[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadScenarios() {
      setError("");
      setLoading(true);

      const result = await ScenarioLibraryService.getRecentPublishedScenarios(
        limit,
      );

      if (!isActive) {
        return;
      }

      if (result.ok) {
        setScenarios(result.scenarios);
      } else {
        setError(result.message);
        setScenarios([]);
      }

      setLoading(false);
    }

    void loadScenarios();

    return () => {
      isActive = false;
    };
  }, [limit]);

  return {
    error,
    loading,
    scenarios,
  };
}
