import SidebarToggle from "../ui/SidebarToggle";
import StatsBar from "../ui/StatsBar";
import LoadingScreen from "../ui/LoadingScreen";

export default function MapContainer({
  mapContainer,
  mapboxLoaded,
  sidebarOpen,
  onToggleSidebar,
  filteredCount,
  mapStyle,
  onToggleMapStyle
}) {
  return (
    <div style={{ flex: 1, position: "relative" }}>
      <div ref={mapContainer} style={{
        width: "100%",
        height: "100%",
        transform: "translate3d(0,0,0)"
      }} />

      <SidebarToggle isOpen={sidebarOpen} onClick={onToggleSidebar} />
      <StatsBar count={filteredCount} />

      <button
        onClick={onToggleMapStyle}
        className="btn-hover"
        title={`Switch to ${mapStyle === "satellite" ? "street" : "satellite"} view`}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "#c8b89a",
          color: "#0a0a0a",
          border: "none",
          padding: "8px 12px",
          fontSize: 11,
          fontFamily: "'Bebas Neue'",
          letterSpacing: 1,
          cursor: "pointer",
          zIndex: 5,
          borderRadius: "2px"
        }}
      >
        {mapStyle === "satellite" ? "🛣 STREET" : "🛰 SATELLITE"}
      </button>

      {!mapboxLoaded && <LoadingScreen />}
    </div>
  );
}
