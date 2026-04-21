import { useEffect, useRef } from "react";
import { RISK_COLORS, TYPE_ICONS } from "../lib/mapbox";

export function useMarkerManagement(mapRef, locations, filterType, filterRisk, search, onSelectLocation, setSidebarOpen, styleLoaded, mapboxgl) {
  const markerMapRef = useRef(new Map());

  useEffect(() => {
    // Wait until mapboxgl is lazy-loaded and map is ready
    if (!mapRef.current || !mapboxgl) return;
    const currentIds = new Set(locations.map(l => l.id));

    markerMapRef.current.forEach((val, id) => {
      if (!currentIds.has(id)) {
        val.marker.remove();
        markerMapRef.current.delete(id);
      }
    });

    locations.forEach(loc => {
      if (markerMapRef.current.has(loc.id)) return;

      const el = document.createElement("div");
      el.style.cssText = `
        width:44px;height:44px;border-radius:50% 50% 50% 0;
        background:${RISK_COLORS[loc.risk]};border:3px solid #1a1a1a;cursor:pointer;
        box-shadow:0 4px 16px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.2);
        transition:filter 0.2s ease;
        display:flex;align-items:center;justify-content:center;font-size:16px;
        transform:rotate(-45deg) translate3d(0,0,0);
        will-change:filter;user-select:none;
      `;
      const inner = document.createElement("div");
      inner.style.cssText = "transform:rotate(45deg);";
      inner.textContent = TYPE_ICONS[loc.type] || TYPE_ICONS.default;
      el.appendChild(inner);

      el.addEventListener("mouseenter", () => {
        el.style.filter = "brightness(1.2) drop-shadow(0 2px 8px rgba(200,184,154,0.6))";
      });
      el.addEventListener("mouseleave", () => {
        el.style.filter = "brightness(1)";
      });
      el.addEventListener("click", () => {
        onSelectLocation(loc);
        setSidebarOpen(true);
        mapRef.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 13, duration: 1000 });
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([loc.lng, loc.lat])
        .addTo(mapRef.current);

      markerMapRef.current.set(loc.id, { marker, el, loc });
    });
  }, [locations, mapRef, styleLoaded, mapboxgl]);

  useEffect(() => {
    if (!mapRef.current) return;
    const searchLower = search.toLowerCase();
    markerMapRef.current.forEach(({ el, loc }) => {
      const typeMatch = filterType === "all" || loc.type === filterType;
      const riskMatch = filterRisk === "all" || loc.risk === filterRisk;
      const searchMatch = !search ||
        loc.name.toLowerCase().includes(searchLower) ||
        loc.county.toLowerCase().includes(searchLower);
      el.style.display = (typeMatch && riskMatch && searchMatch) ? "" : "none";
    });
  }, [filterType, filterRisk, search]);

  return markerMapRef;
}
