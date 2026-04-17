import { useMemo } from "react";

export function useLocationFilters(locations, filterType, filterRisk, search) {
  return useMemo(() => {
    return locations.filter(loc => {
      if (filterType !== "all" && loc.type !== filterType) return false;
      if (filterRisk !== "all" && loc.risk !== filterRisk) return false;
      if (search && !loc.name.toLowerCase().includes(search.toLowerCase()) &&
          !loc.county.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [locations, filterType, filterRisk, search]);
}
