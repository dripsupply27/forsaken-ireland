import SearchBar from "../ui/SearchBar";
import FilterBar from "../ui/FilterBar";
import LocationList from "../locations/LocationList";
import LocationDetail from "../locations/LocationDetail";
import { useLocationFilters } from "../../hooks/useLocationFilters";

export default function Sidebar({
  isOpen,
  locations,
  selected,
  likedIds,
  searchInput,
  filterType,
  filterRisk,
  onSearchChange,
  onFilterTypeChange,
  onFilterRiskChange,
  onSelectLocation,
  onDeselectLocation,
  onFlyTo,
  onLike,
  onShowUpload,
  isMobile,
  onCloseSidebar
}) {
  const filtered = useLocationFilters(locations, filterType, filterRisk, searchInput);

  const containerStyle = isMobile ? {
    position: "fixed",
    top: 0,
    left: 0,
    width: "85vw",
    maxWidth: 340,
    height: "100vh",
    background: "#0d0d0d",
    borderRight: "1px solid #1f1f1f",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 20,
    transform: isOpen ? "translateX(0)" : "translateX(-100%)",
    transition: "transform 0.3s ease",
  } : {
    width: isOpen ? 340 : 0,
    minWidth: isOpen ? 340 : 0,
    background: "#0d0d0d",
    borderRight: "1px solid #1f1f1f",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    transition: "width 0.3s ease, min-width 0.3s ease",
    zIndex: 10,
    position: "relative"
  };

  return (
    <>
      {isMobile && isOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 19,
          onClick: onCloseSidebar
        }} />
      )}
      <div style={containerStyle}>
      {/* Header */}
      <div style={{
        padding: "20px 18px 14px",
        borderBottom: "1px solid #1a1a1a",
        flexShrink: 0
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12
        }}>
          <span style={{ fontSize: 22 }}>🏚</span>
          <div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 24,
              letterSpacing: 2,
              color: "#c8b89a",
              lineHeight: 1
            }}>
              FORSAKEN
            </div>
            <div style={{
              fontSize: 9,
              color: "#555",
              letterSpacing: 3
            }}>
              IRELAND URBEX MAP
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div style={{
        padding: "12px 14px",
        borderBottom: "1px solid #1a1a1a",
        flexShrink: 0
      }}>
        <SearchBar value={searchInput} onChange={onSearchChange} />
        <FilterBar
          filterType={filterType}
          onTypeChange={onFilterTypeChange}
          filterRisk={filterRisk}
          onRiskChange={onFilterRiskChange}
        />
      </div>

      {/* Location list */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "8px 0"
      }}>
        {selected ? (
          <LocationDetail
            location={selected}
            isLiked={likedIds.has(selected.id)}
            onLike={onLike}
            onBack={onDeselectLocation}
          />
        ) : (
          <LocationList
            locations={filtered}
            onSelectLocation={onSelectLocation}
            onFlyTo={onFlyTo}
          />
        )}
      </div>

      {/* Upload button */}
      <div style={{
        padding: "12px 14px",
        borderTop: "1px solid #1a1a1a",
        flexShrink: 0
      }}>
        <button
          onClick={onShowUpload}
          className="btn-hover"
          style={{
            width: "100%",
            background: "#c8b89a",
            color: "#0a0a0a",
            border: "none",
            padding: isMobile ? "14px" : "11px",
            fontFamily: "'Bebas Neue'",
            fontSize: 15,
            letterSpacing: 2,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          + SUBMIT A LOCATION
        </button>
        <div style={{
          fontSize: 8,
          color: "#444",
          textAlign: "center",
          marginTop: 6,
          letterSpacing: 1
        }}>
          IRELAND ONLY · STAY SAFE · NO VANDALISM
        </div>
      </div>
    </div>
    </>
  );
}
