#!/bin/bash
set -e

echo ""
echo "═══════════════════════════════════════════"
echo "  FORSAKEN IRELAND — Applying All Fixes"
echo "═══════════════════════════════════════════"
echo ""

if [ ! -f "package.json" ] || ! grep -q "forsaken-ireland" package.json; then
  echo "❌ ERROR: Run this from your forsaken-ireland project root"
  exit 1
fi

echo "📁 Project root confirmed"
echo ""

echo "🔧 Fix #13 — CSS parse error (stray brace)..."
cat > src/styles/mapbox-overrides.css << 'CSS'
.mapboxgl-ctrl-group {
  background: #111 !important;
  border: 1px solid #333 !important;
}

.mapboxgl-ctrl-group button {
  background: #111 !important;
  color: #ccc !important;
}

.mapboxgl-ctrl-group button span {
  filter: invert(1);
}
CSS
echo "   ✅ done"

echo "🔧 Fix #12 — Realtime subscription leak..."
cat > src/hooks/useComments.js << 'JS'
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useComments(locationId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!locationId) return;
    fetchComments();
    const unsub = subscribeToComments();
    return unsub;
  }, [locationId]);

  async function fetchComments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("location_id", locationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setComments(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToComments() {
    const subscription = supabase
      .channel(`comments-${locationId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `location_id=eq.${locationId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setComments(prev => [...prev, payload.new]);
          } else if (payload.eventType === "DELETE") {
            setComments(prev => prev.filter(c => c.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setComments(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }

  async function addComment(content, userEmail) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([{ location_id: locationId, user_email: userEmail, content }])
        .select();
      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error("Error adding comment:", err);
      throw err;
    }
  }

  async function deleteComment(commentId) {
    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);
      if (error) throw error;
    } catch (err) {
      console.error("Error deleting comment:", err);
      throw err;
    }
  }

  return { comments, loading, error, addComment, deleteComment };
}
JS
echo "   ✅ done"

echo "🔧 Fix #3  — Moderation fails closed..."
cat > src/hooks/useContentModeration.js << 'JS'
export function useContentModeration() {
  async function moderateContent(text) {
    if (!text || text.trim().length === 0) {
      return { safe: true, flags: {} };
    }
    try {
      const response = await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!response.ok) {
        return { safe: false, flags: {}, error: "Moderation service unavailable. Please try again shortly." };
      }
      return await response.json();
    } catch (err) {
      console.error("Content moderation error:", err);
      return { safe: false, flags: {}, error: "Moderation service unavailable. Please try again shortly." };
    }
  }

  async function moderateLocation(description, access) {
    return moderateContent(`${description} ${access}`);
  }

  return { moderateContent, moderateLocation };
}
JS
echo "   ✅ done"

echo "🔧 Fix #7+8 — Marker performance + style-change survival..."
cat > src/hooks/useMarkerManagement.js << 'JS'
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { RISK_COLORS, TYPE_ICONS } from "../lib/mapbox";

export function useMarkerManagement(mapRef, locations, filterType, filterRisk, search, onSelectLocation, setSidebarOpen, styleLoaded) {
  const markerMapRef = useRef(new Map());

  useEffect(() => {
    if (!mapRef.current) return;
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
  }, [locations, mapRef, styleLoaded]);

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
JS
echo "   ✅ done"

echo "🔧 Fix #2,4,8,9 — App.jsx..."
cat > src/App.jsx << 'JS'
import { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN, MAPBOX_STYLE_SATELLITE, IRELAND_CENTER, IRELAND_MAX_BOUNDS } from "./lib/mapbox";
import Sidebar from "./components/layout/Sidebar";
import MapContainer from "./components/layout/MapContainer";
import SubmitModal from "./components/submit/SubmitModal";
import LoadingScreen from "./components/ui/LoadingScreen";
import { useLocationFilters } from "./hooks/useLocationFilters";
import { useDebouncedSearch } from "./hooks/useDebouncedSearch";
import { useMarkerManagement } from "./hooks/useMarkerManagement";
import { useLocations } from "./hooks/useLocations";
import { usePhotoUpload } from "./hooks/usePhotoUpload";
import { useContentModeration } from "./hooks/useContentModeration";
import { useResponsive } from "./hooks/useResponsive";
import "./styles/mapbox-overrides.css";

function useMapbox() { return true; }

export default function App() {
  const mapboxLoaded = useMapbox();
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const pinMarkerRef = useRef(null);

  const { locations, loading: locationsLoading, addLocation, updateLikes } = useLocations();
  const { uploadPhoto } = usePhotoUpload();
  const { moderateLocation } = useContentModeration();
  const { isMobile } = useResponsive();

  const [selected, setSelected] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [uploading, setUploading] = useState(false);
  const [mapStyle, setMapStyle] = useState("satellite");
  const [pinDropMode, setPinDropMode] = useState(false);
  const [styleLoaded, setStyleLoaded] = useState(0);

  const [uploadForm, setUploadForm] = useState({
    name: "", county: "", lat: "", lng: "", type: "industrial",
    risk: "medium", description: "", access: "", photo: null
  });

  const { searchInput, setSearchInput, search } = useDebouncedSearch();
  const filtered = useLocationFilters(locations, filterType, filterRisk, search);

  useEffect(() => {
    if (!mapboxLoaded || !mapContainer.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_STYLE_SATELLITE,
      center: IRELAND_CENTER,
      zoom: 6.5,
      maxBounds: IRELAND_MAX_BOUNDS,
      attributionControl: false,
      antialias: true,
      fadeDuration: 200,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    map.on("load", () => setIsMapLoaded(true));
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [mapboxLoaded]);

  useEffect(() => {
    if (!mapRef.current) return;
    const newStyle = mapStyle === "street"
      ? "mapbox://styles/mapbox/streets-v12"
      : MAPBOX_STYLE_SATELLITE;
    mapRef.current.once("style.load", () => {
      setStyleLoaded(n => n + 1);
    });
    mapRef.current.setStyle(newStyle);
  }, [mapStyle]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (pinDropMode) {
      map.getCanvas().style.cursor = "crosshair";
      const handleClick = (e) => {
        const { lng, lat } = e.lngLat;
        if (pinMarkerRef.current) pinMarkerRef.current.remove();
        const el = document.createElement("div");
        el.style.cssText = "width:20px;height:20px;border-radius:50%;background:#c8b89a;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.8);";
        pinMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([lng, lat]).addTo(map);
        setUploadForm(prev => ({ ...prev, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
        map.getCanvas().style.cursor = "";
        setPinDropMode(false);
        setShowUpload(true);
      };
      map.once("click", handleClick);
      return () => { map.off("click", handleClick); map.getCanvas().style.cursor = ""; };
    }
  }, [pinDropMode]);

  useEffect(() => {
    if (!showUpload && pinMarkerRef.current) {
      pinMarkerRef.current.remove();
      pinMarkerRef.current = null;
    }
  }, [showUpload]);

  useMarkerManagement(mapRef, locations, filterType, filterRisk, search, setSelected, setSidebarOpen, styleLoaded);

  const handleLike = async (id) => {
    if (likedIds.has(id)) return;
    setLikedIds(prev => new Set([...prev, id]));
    const location = locations.find(l => l.id === id);
    if (location) {
      await updateLikes(id, location.likes + 1);
      if (selected?.id === id) setSelected(prev => ({ ...prev, likes: prev.likes + 1 }));
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      const lat = parseFloat(uploadForm.lat);
      const lng = parseFloat(uploadForm.lng);
      if (isNaN(lat) || isNaN(lng) || lat < 51.3 || lat > 55.5 || lng < -10.7 || lng > -5.9) {
        alert("Coordinates must be within Ireland. Use the 📍 Drop Pin button to set them accurately.");
        setUploading(false);
        return;
      }
      if (uploadForm.photo) {
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(uploadForm.photo.type)) {
          alert("Invalid file type. Only JPG, PNG, and WebP images are allowed.");
          setUploading(false);
          return;
        }
        if (uploadForm.photo.size > 5 * 1024 * 1024) {
          alert("Photo must be under 5MB. Please compress or resize the image.");
          setUploading(false);
          return;
        }
      }
      const moderation = await moderateLocation(uploadForm.description, uploadForm.access);
      if (!moderation.safe) {
        const msg = moderation.error
          ? moderation.error
          : `Content flagged: ${Object.entries(moderation.flags).filter(([_, v]) => v).map(([k]) => k).join(", ")}. Please revise your submission.`;
        alert(msg);
        setUploading(false);
        return;
      }
      let photoUrl = null;
      if (uploadForm.photo) {
        photoUrl = await uploadPhoto(uploadForm.photo, Date.now(), "anonymous");
      }
      await addLocation({
        name: uploadForm.name, county: uploadForm.county, lat, lng,
        type: uploadForm.type, risk: uploadForm.risk,
        description: uploadForm.description, access: uploadForm.access,
        likes: 0, uploaded_by: "anonymous",
        date: new Date().toISOString().slice(0, 10),
        tags: [], photo: photoUrl,
      });
      setShowUpload(false);
      setUploadForm({ name: "", county: "", lat: "", lng: "", type: "industrial", risk: "medium", description: "", access: "", photo: null });
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFlyTo = (coords) => {
    if (mapRef.current) mapRef.current.flyTo({ center: coords, zoom: 13, duration: 1000 });
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: "#0a0a0a", fontFamily: "'Courier New', monospace", color: "#e0d8c8", overflow: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes load { 0% { left: -40% } 100% { left: 100% } }
        .loc-card:hover { background: #1a1a1a !important; }
        .btn-hover:hover { opacity: 0.85; transform: translateY(-1px); }
      `}</style>
      {locationsLoading && <LoadingScreen />}
      {pinDropMode && (
        <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", background: "#c8b89a", color: "#0a0a0a", padding: "10px 20px", fontFamily: "'Bebas Neue'", fontSize: 16, letterSpacing: 2, zIndex: 50, boxShadow: "0 4px 16px rgba(0,0,0,0.8)" }}>
          📍 CLICK THE MAP TO DROP YOUR PIN
        </div>
      )}
      <Sidebar
        isOpen={sidebarOpen} locations={locations} filtered={filtered}
        selected={selected} likedIds={likedIds} searchInput={searchInput}
        filterType={filterType} filterRisk={filterRisk}
        onSearchChange={setSearchInput} onFilterTypeChange={setFilterType}
        onFilterRiskChange={setFilterRisk} onSelectLocation={setSelected}
        onDeselectLocation={() => setSelected(null)} onFlyTo={handleFlyTo}
        onLike={handleLike} onShowUpload={() => setShowUpload(true)}
        isMobile={isMobile} onCloseSidebar={() => setSidebarOpen(false)}
      />
      <MapContainer
        mapContainer={mapContainer} mapboxLoaded={mapboxLoaded}
        sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(p => !p)}
        filteredCount={filtered.length} mapStyle={mapStyle}
        onToggleMapStyle={() => setMapStyle(s => s === "satellite" ? "street" : "satellite")}
        isMobile={isMobile}
      />
      <SubmitModal
        isOpen={showUpload} form={uploadForm}
        onFormChange={(field, value) => setUploadForm(p => ({ ...p, [field]: value }))}
        onSubmit={handleUpload} onClose={() => setShowUpload(false)}
        isLoading={uploading} isMobile={isMobile}
        onPinDrop={() => { setShowUpload(false); setPinDropMode(true); }}
      />
    </div>
  );
}
JS
echo "   ✅ done"

echo "🔧 Fix #9  — Sidebar (accept filtered as prop)..."
cat > src/components/layout/Sidebar.jsx << 'JS'
import SearchBar from "../ui/SearchBar";
import FilterBar from "../ui/FilterBar";
import LocationList from "../locations/LocationList";
import LocationDetail from "../locations/LocationDetail";

export default function Sidebar({
  isOpen, locations, filtered, selected, likedIds, searchInput, filterType, filterRisk,
  onSearchChange, onFilterTypeChange, onFilterRiskChange, onSelectLocation,
  onDeselectLocation, onFlyTo, onLike, onShowUpload, isMobile, onCloseSidebar
}) {
  const containerStyle = isMobile ? {
    position: "fixed", top: 0, left: 0, width: "80vw", maxWidth: 300, height: "100vh",
    background: "#0d0d0d", borderRight: "1px solid #1f1f1f",
    display: "flex", flexDirection: "column", overflow: "hidden",
    zIndex: 20, transform: isOpen ? "translateX(0)" : "translateX(-100%)",
    transition: "transform 0.3s ease",
  } : {
    width: isOpen ? 340 : 0, minWidth: isOpen ? 340 : 0,
    background: "#0d0d0d", borderRight: "1px solid #1f1f1f",
    display: "flex", flexDirection: "column", overflow: "hidden",
    transition: "width 0.3s ease, min-width 0.3s ease", zIndex: 10, position: "relative"
  };

  return (
    <>
      {isMobile && isOpen && (
        <div onClick={onCloseSidebar} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 19 }} />
      )}
      <div style={containerStyle}>
        <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid #1a1a1a", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🏚</span>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 20 : 24, letterSpacing: 2, color: "#c8b89a", lineHeight: 1 }}>FORSAKEN</div>
              <div style={{ fontSize: 8, color: "#555", letterSpacing: 3 }}>IRELAND URBEX MAP</div>
            </div>
          </div>
          {isMobile && (
            <button onClick={onCloseSidebar} style={{ background: "transparent", border: "1px solid #333", color: "#888", fontSize: 16, cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
          )}
        </div>
        <div style={{ padding: "10px 12px", borderBottom: "1px solid #1a1a1a", flexShrink: 0 }}>
          <SearchBar value={searchInput} onChange={onSearchChange} />
          <FilterBar filterType={filterType} onTypeChange={onFilterTypeChange} filterRisk={filterRisk} onRiskChange={onFilterRiskChange} />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {selected ? (
            <LocationDetail location={selected} isLiked={likedIds.has(selected.id)} onLike={onLike} onBack={onDeselectLocation} />
          ) : (
            <LocationList locations={filtered} onSelectLocation={(loc) => { onSelectLocation(loc); onFlyTo([loc.lng, loc.lat]); }} onFlyTo={onFlyTo} />
          )}
        </div>
        <div style={{ padding: "10px 12px", borderTop: "1px solid #1a1a1a", flexShrink: 0 }}>
          <button onClick={onShowUpload} className="btn-hover" style={{ width: "100%", background: "#c8b89a", color: "#0a0a0a", border: "none", padding: "12px", fontFamily: "'Bebas Neue'", fontSize: 14, letterSpacing: 2, cursor: "pointer", transition: "all 0.2s" }}>
            + SUBMIT A LOCATION
          </button>
          <div style={{ fontSize: 7, color: "#444", textAlign: "center", marginTop: 5, letterSpacing: 1 }}>
            IRELAND ONLY · STAY SAFE · NO VANDALISM
          </div>
        </div>
      </div>
    </>
  );
}
JS
echo "   ✅ done"

echo "🔧 Fix #14 — Lazy image loading..."
sed -i 's/<img src={location\.photo} alt={location\.name}/<img src={location.photo} alt={location.name} loading="lazy" decoding="async"/' src/components/locations/LocationDetail.jsx
echo "   ✅ done"

echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ All code fixes applied!"
echo "═══════════════════════════════════════════"
echo ""
echo "🚀 Next steps:"
echo "   npm run dev"
echo "   git add -A && git commit -m 'fix: security and performance patches'"
echo "   git push"
echo ""
