export default function StatsBar({ count }) {
  return (
    <div style={{
      position: "absolute",
      bottom: 16,
      left: 16,
      background: "#0d0d0dcc",
      backdropFilter: "blur(8px)",
      border: "1px solid #1f1f1f",
      padding: "8px 14px",
      fontSize: 9,
      color: "#666",
      letterSpacing: 2,
      zIndex: 5
    }}>
      {count} LOCATIONS VISIBLE · IRELAND
    </div>
  );
}
