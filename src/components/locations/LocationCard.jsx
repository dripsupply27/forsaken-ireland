import { TYPE_ICONS, RISK_COLORS, RISK_LABELS } from "../../lib/mapbox";

export default function LocationCard({ location, onSelect, onFlyTo }) {
  return (
    <div
      onClick={() => {
        onSelect(location);
        onFlyTo([location.lng, location.lat]);
      }}
      className="loc-card"
      style={{
        padding: "12px 14px",
        borderBottom: "1px solid #141414",
        cursor: "pointer",
        transition: "background 0.15s",
        background: "transparent",
        border: "none",
        width: "100%",
        textAlign: "left"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'Bebas Neue'",
            fontSize: 16,
            color: "#c8b89a",
            letterSpacing: 1,
            lineHeight: 1.1
          }}>
            {location.name}
          </div>
          <div style={{
            fontSize: 9,
            color: "#555",
            letterSpacing: 1
          }}>
            {location.county} · {location.type.toUpperCase()}
          </div>
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
          marginLeft: 8
        }}>
          <span style={{
            fontSize: 8,
            padding: "2px 6px",
            border: `1px solid ${RISK_COLORS[location.risk]}55`,
            color: RISK_COLORS[location.risk],
            background: RISK_COLORS[location.risk] + "11",
            letterSpacing: 1
          }}>
            {RISK_LABELS[location.risk]}
          </span>
          <span style={{ fontSize: 9, color: "#555" }}>♥ {location.likes}</span>
        </div>
      </div>
    </div>
  );
}
