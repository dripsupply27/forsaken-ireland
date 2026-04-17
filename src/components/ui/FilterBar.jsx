export default function FilterBar({ filterType, onTypeChange, filterRisk, onRiskChange }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <select
        value={filterType}
        onChange={e => onTypeChange(e.target.value)}
        style={{
          flex: 1,
          background: "#111",
          border: "1px solid #2a2a2a",
          color: "#aaa",
          padding: "6px 8px",
          fontSize: 10,
          outline: "none",
          letterSpacing: 1
        }}
      >
        <option value="all">ALL TYPES</option>
        <option value="asylum">ASYLUM</option>
        <option value="industrial">INDUSTRIAL</option>
        <option value="mansion">MANSION</option>
        <option value="hotel">HOTEL</option>
        <option value="entertainment">ENTERTAINMENT</option>
        <option value="church">CHURCH</option>
      </select>

      <select
        value={filterRisk}
        onChange={e => onRiskChange(e.target.value)}
        style={{
          flex: 1,
          background: "#111",
          border: "1px solid #2a2a2a",
          color: "#aaa",
          padding: "6px 8px",
          fontSize: 10,
          outline: "none",
          letterSpacing: 1
        }}
      >
        <option value="all">ALL RISK</option>
        <option value="low">LOW RISK</option>
        <option value="medium">MED RISK</option>
        <option value="high">HIGH RISK</option>
      </select>
    </div>
  );
}
