import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { RISK_COLORS, TYPE_ICONS } from "../lib/mapbox";

export function useMarkerManagement(mapRef, locations, filterType, filterRisk, search, onSelectLocation, setSidebarOpen) {
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const filtered = locations.filter(loc => {
      if (filterType !== "all" && loc.type !== filterType) return false;
      if (filterRisk !== "all" && loc.risk !== filterRisk) return false;
      if (search && !loc.name.toLowerCase().includes(search.toLowerCase()) &&
          !loc.county.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    filtered.forEach(loc => {
      const zoom = mapRef.current.getZoom();
      const scale = zoom < 8 ? 0.6 : zoom < 10 ? 0.8 : 1;
      const width = Math.round(44 * scale);
      const height = Math.round(44 * scale);
      const fontSize = Math.round(16 * scale);
      const borderWidth = Math.max(2, Math.round(3 * scale));

      const el = document.createElement("div");
      el.style.cssText = `
        width:${width}px;height:${height}px;border-radius:50% 50% 50% 0;
        background:${RISK_COLORS[loc.risk]};border:${borderWidth}px solid #1a1a1a;cursor:pointer;
        box-shadow:0 4px 16px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.2);
        transition:filter 0.2s ease, width 0.3s ease, height 0.3s ease;
        display:flex;align-items:center;justify-content:center;font-size:${fontSize}px;
        transform:rotate(-45deg) translate3d(0,0,0);
        will-change:filter;
        user-select:none;
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
        if (mapRef.current) {
          mapRef.current.flyTo({ center: [loc.lng, loc.lat], zoom: 13, duration: 1000 });
        }
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([loc.lng, loc.lat])
        .addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [locations, filterType, filterRisk, search, mapRef, onSelectLocation, setSidebarOpen]);

  return markersRef;
}
