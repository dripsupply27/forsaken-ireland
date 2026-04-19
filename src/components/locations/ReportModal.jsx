import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ReportModal({ locationId, locationName, onClose }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("reports")
        .insert([{ location_id: locationId, reason, details }]);
      if (error) throw error;
      setDone(true);
    } catch (err) {
      alert("Failed to submit report: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000000cc",
      backdropFilter: "blur(4px)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", width: 400, maxWidth: "95vw", padding: 24 }}>
        {done ? (
          <>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: "#c8b89a", marginBottom: 10 }}>REPORT SUBMITTED</div>
            <p style={{ fontSize: 11, color: "#888", marginBottom: 16 }}>Thanks for keeping Forsaken safe.</p>
            <button onClick={onClose} style={{
              background: "#c8b89a", color: "#0a0a0a", border: "none",
              padding: "10px 20px", fontFamily: "'Bebas Neue'", fontSize: 14,
              letterSpacing: 2, cursor: "pointer"
            }}>CLOSE</button>
          </>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: "#f87171", letterSpacing: 1 }}>REPORT LOCATION</div>
                <div style={{ fontSize: 9, color: "#555", letterSpacing: 2 }}>{locationName}</div>
              </div>
              <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#555", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: "#666", letterSpacing: 2, marginBottom: 4 }}>REASON</div>
              <select value={reason} onChange={e => setReason(e.target.value)}
                style={{ width: "100%", background: "#111", border: "1px solid #2a2a2a", color: "#e0d8c8", padding: "8px 10px", fontSize: 11, outline: "none", fontFamily: "'Space Mono', monospace" }}>
                <option value="">Select a reason...</option>
                <option value="inappropriate">Inappropriate content</option>
                <option value="fake">Fake location</option>
                <option value="dangerous">Dangerous information</option>
                <option value="spam">Spam</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: "#666", letterSpacing: 2, marginBottom: 4 }}>DETAILS (OPTIONAL)</div>
              <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3}
                placeholder="Any additional info..."
                style={{ width: "100%", background: "#111", border: "1px solid #2a2a2a", color: "#e0d8c8", padding: "8px 10px", fontSize: 11, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "'Space Mono', monospace" }} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={{
                flex: 1, background: "transparent", border: "1px solid #2a2a2a",
                color: "#666", padding: "10px", fontFamily: "'Bebas Neue'",
                fontSize: 13, letterSpacing: 2, cursor: "pointer"
              }}>CANCEL</button>
              <button onClick={handleSubmit} disabled={!reason || submitting} style={{
                flex: 2, background: "#f87171", color: "#0a0a0a", border: "none",
                padding: "10px", fontFamily: "'Bebas Neue'", fontSize: 13,
                letterSpacing: 2, cursor: (!reason || submitting) ? "not-allowed" : "pointer",
                opacity: (!reason || submitting) ? 0.4 : 1
              }}>{submitting ? "SUBMITTING..." : "SUBMIT REPORT"}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
