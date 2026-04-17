import { useState, useRef, useEffect } from "react";

export function useDebouncedSearch(delay = 300) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(searchInput);
    }, delay);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchInput, delay]);

  return { searchInput, setSearchInput, search };
}
