export default function SearchBar({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Search locations..."
      style={{
        width: "100%",
        background: "#111",
        border: "1px solid #2a2a2a",
        color: "#e0d8c8",
        padding: "8px 10px",
        fontSize: 11,
        letterSpacing: 1,
        outline: "none",
        boxSizing: "border-box",
        marginBottom: 8
      }}
    />
  );
}
