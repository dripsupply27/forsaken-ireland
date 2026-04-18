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

function useMapbox() {
  return true;
}

export default function App() {
  // Map setup
  const mapboxLoaded = useMapbox();
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  // Data state
  const { locations, loading: locationsLoading, addLocation, updateLikes } = useLocations();
  const { uploadPhoto } = usePhotoUpload();
  const { moderateLocation } = useContentModeration();
  const { isMobile } = useResponsive();
  const [selected, setSelected] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());

  // Map state
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // UI state
  const [filterType, setFilterType] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [uploading, setUploading] = useState(false);
  const [mapStyle, setMapStyle] = useState("satellite");

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    name: "", county: "", lat: "", lng: "", type: "industrial",
    risk: "medium", description: "", access: "", tags: "", photo: null
  });

  // Debounced search
  const { searchInput, setSearchInput, search } = useDebouncedSearch();

  // Initialize map
  useEffect(() => {
    if (!mapboxLoaded || !mapContainer.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const initialStyle = mapStyle === "street"
      ? "mapbox://styles/mapbox/streets-v12"
      : MAPBOX_STYLE_SATELLITE;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: initialStyle,
      center: IRELAND_CENTER,
      zoom: 6.5,
      maxBounds: IRELAND_MAX_BOUNDS,
      attributionControl: false,
      antialias: true,
      optimizeForTerrain: true,
      fadeDuration: 200,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    map.on('load', () => {
      map.setPaintProperty('background', 'background-opacity', 1);
      setIsMapLoaded(true);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxLoaded]);


  // Change map style
  useEffect(() => {
    if (!mapRef.current) return;
    const newStyle = mapStyle === "street"
      ? "mapbox://styles/mapbox/streets-v12"
      : MAPBOX_STYLE_SATELLITE;
    mapRef.current.setStyle(newStyle);
  }, [mapStyle]);

  // Marker management hook
  useMarkerManagement(mapRef, locations, filterType, filterRisk, search, setSelected, setSidebarOpen);

  // Compute filtered locations
  const filtered = useLocationFilters(locations, filterType, filterRisk, search);

  // Event handlers
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
      // Moderate content
      const moderation = await moderateLocation(uploadForm.description, uploadForm.access);
      if (!moderation.safe) {
        const flaggedItems = Object.entries(moderation.flags)
          .filter(([_, flagged]) => flagged)
          .map(([name]) => name)
          .join(", ");
        alert(`Content flagged by moderation: ${flaggedItems}. Please revise your submission.`);
        setUploading(false);
        return;
      }

      let photoUrl = null;
      if (uploadForm.photo) {
        photoUrl = await uploadPhoto(uploadForm.photo, Date.now(), "anonymous");
      }

      const newLoc = {
        name: uploadForm.name,
        county: uploadForm.county,
        lat: parseFloat(uploadForm.lat),
        lng: parseFloat(uploadForm.lng),
        type: uploadForm.type,
        risk: uploadForm.risk,
        description: uploadForm.description,
        access: uploadForm.access,
        likes: 0,
        uploaded_by: "anonymous",
        date: new Date().toISOString().slice(0, 10),
        tags: uploadForm.tags.split(",").map(t => t.trim()).filter(Boolean),
        photo: photoUrl,
      };
      await addLocation(newLoc);
      setShowUpload(false);;
      setUploadForm({
        name: "",
        county: "",
        lat: "",
        lng: "",
        type: "industrial",
        risk: "medium",
        description: "",
        access: "",
        tags: "",
        photo: null
      });
    } catch (err) {
      console.error("Failed to upload location:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFlyTo = (coords) => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: coords, zoom: 13, duration: 1000 });
    }
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100vw",
      background: "#0a0a0a",
      fontFamily: "'Courier New', monospace",
      color: "#e0d8c8",
      overflow: "hidden",
      position: "relative"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes load { 0% { left: -40% } 100% { left: 100% } }
        .loc-card:hover { background: #1a1a1a !important; border-color: #555 !important; }
        .btn-hover:hover { opacity: 0.85; transform: translateY(-1px); }
      `}</style>

      {locationsLoading && <LoadingScreen />}

      <Sidebar
        isOpen={sidebarOpen}
        locations={locations}
        selected={selected}
        likedIds={likedIds}
        searchInput={searchInput}
        filterType={filterType}
        filterRisk={filterRisk}
        onSearchChange={setSearchInput}
        onFilterTypeChange={setFilterType}
        onFilterRiskChange={setFilterRisk}
        onSelectLocation={setSelected}
        onDeselectLocation={() => setSelected(null)}
        onFlyTo={handleFlyTo}
        onLike={handleLike}
        onShowUpload={() => setShowUpload(true)}
        isMobile={isMobile}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      <MapContainer
        mapContainer={mapContainer}
        mapboxLoaded={mapboxLoaded}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(p => !p)}
        filteredCount={filtered.length}
        mapStyle={mapStyle}
        onToggleMapStyle={() => setMapStyle(s => s === "satellite" ? "street" : "satellite")}
        isMobile={isMobile}
      />

      <SubmitModal
        isOpen={showUpload}
        form={uploadForm}
        onFormChange={(field, value) => setUploadForm(p => ({ ...p, [field]: value }))}
        onSubmit={handleUpload}
        onClose={() => setShowUpload(false)}
        isLoading={uploading}
        isMobile={isMobile}
      />
    </div>
  );
}
