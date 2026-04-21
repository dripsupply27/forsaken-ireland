import SidebarToggle from "../ui/SidebarToggle";
import StatsBar from "../ui/StatsBar";
import LoadingScreen from "../ui/LoadingScreen";

export default function MapContainer({
  mapContainer, mapboxLoaded, sidebarOpen, onToggleSidebar,
  filteredCount, mapStyle, onToggleMapStyle, isMobile
}) {
  return (
    <div style={{ flex: 1, position: "relative" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%", transform: "translate3d(0,0,0)" }} />

      {/* Fix #11: pass isMobile as prop instead of calling useResponsive again */}
      <SidebarToggle isOpen={sidebarOpen} onClick={onToggleSidebar} isMobile={isMobile} />
      <StatsBar count={filteredCount} />

      <button
        onClick={onToggleMapStyle}
        className="btn-hover"
        title={`Switch to ${mapStyle === "satellite" ? "street" : "satellite"} view`}
        style={{
          position: "absolute", top: 20, right: 20,
          background: "#c8b89a", color: "#0a0a0a", border: "none",
          padding: "8px 12px",
          minHeight: isMobile ? 44 : "auto",
          minWidth: isMobile ? 44 : "auto",
          fontSize: 11, fontFamily: "'Bebas Neue'",
          letterSpacing: 1, cursor: "pointer", zIndex: 5, borderRadius: "2px"
        }}
      >
        {mapStyle === "satellite" ? "🛣 STREET" : "🛰 SATELLITE"}
      </button>

      {!mapboxLoaded && <LoadingScreen />}
    </div>
  );
}
