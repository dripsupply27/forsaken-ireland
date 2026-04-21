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

export default function App() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const pinMarkerRef = useRef(null);
  const lastSubmitRef = useRef(0);

  const { locations, loading: locationsLoading, addLocation, updateLikes } = useLocations();
  const { uploadPhoto } = usePhotoUpload();
  const { moderateLocation } = useContentModeration();
  const { isMobile } = useResponsive();

  const [selected, setSelected] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
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
    if (!mapContainer.current || mapRef.current) return;
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
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const newStyle = mapStyle === "street"
      ? "mapbox://styles/mapbox/streets-v12"
      : MAPBOX_STYLE_SATELLITE;
    mapRef.current.once("style.load", () => setStyleLoaded(n => n + 1));
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
    await updateLikes(id);
    if (selected?.id === id) setSelected(prev => ({ ...prev, likes: prev.likes + 1 }));
  };

  const handleUpload = async () => {
    if (Date.now() - lastSubmitRef.current < 30000) {
      alert("Please wait 30 seconds between submissions.");
      return;
    }
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
      let userId = localStorage.getItem("forsaken_uid");
      if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem("forsaken_uid", userId);
      }
      await addLocation({
        name: uploadForm.name, county: uploadForm.county, lat, lng,
        type: uploadForm.type, risk: uploadForm.risk,
        description: uploadForm.description, access: uploadForm.access,
        likes: 0, uploaded_by: userId,
        date: new Date().toISOString().slice(0, 10),
        tags: [], photo: photoUrl,
      });
      lastSubmitRef.current = Date.now();
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
        mapContainer={mapContainer} mapboxLoaded={true}
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
