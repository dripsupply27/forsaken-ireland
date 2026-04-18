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
  onToggleMapStyle,
  onStartDrawing,
  onClearPerimeter,
  hasPerimeter,
  isMobile
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
          minHeight: isMobile ? 44 : "auto",
          minWidth: isMobile ? 44 : "auto",
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

      <button
        onClick={hasPerimeter ? onClearPerimeter : onStartDrawing}
        className="btn-hover"
        title={hasPerimeter ? "Clear drawn perimeter" : "Draw perimeter around building"}
        style={{
          position: "absolute",
          top: 60,
          right: 20,
          background: hasPerimeter ? "#4ade8033" : "#0d0d0d",
          color: hasPerimeter ? "#4ade80" : "#c8b89a",
          border: `1px solid ${hasPerimeter ? "#4ade80" : "#2a2a2a"}`,
          padding: "8px 12px",
          minHeight: isMobile ? 44 : "auto",
          minWidth: isMobile ? 44 : "auto",
          fontSize: 11,
          fontFamily: "'Bebas Neue'",
          letterSpacing: 1,
          cursor: "pointer",
          zIndex: 5,
          borderRadius: "2px"
        }}
      >
        {hasPerimeter ? "✓ CLEAR PERIMETER" : "DRAW PERIMETER"}
      </button>

      {!mapboxLoaded && <LoadingScreen />}
    </div>
  );
}
