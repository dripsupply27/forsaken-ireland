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
