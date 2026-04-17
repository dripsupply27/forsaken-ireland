import { RISK_COLORS, RISK_LABELS } from "../../lib/mapbox";

export default function RiskBadge({ risk, variant = "inline" }) {
  if (variant === "inline") {
    return (
      <span style={{
        background: RISK_COLORS[risk] + "22",
        border: `1px solid ${RISK_COLORS[risk]}55`,
        color: RISK_COLORS[risk],
        fontSize: 9,
        padding: "2px 8px",
        letterSpacing: 1
      }}>
        {RISK_LABELS[risk]}
      </span>
    );
  }

  // variant === "full"
  return (
    <span style={{
      background: RISK_COLORS[risk] + "22",
      border: `1px solid ${RISK_COLORS[risk]}55`,
      color: RISK_COLORS[risk],
      fontSize: 9,
      padding: "2px 8px",
      letterSpacing: 1
    }}>
      {RISK_LABELS[risk]}
    </span>
  );
}
