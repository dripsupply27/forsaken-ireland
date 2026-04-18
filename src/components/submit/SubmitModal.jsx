import { IRELAND_COUNTIES } from "../../lib/mapbox";

export default function SubmitModal({
  isOpen,
  form,
  onFormChange,
  onSubmit,
  onClose,
  isLoading,
  isMobile
}) {
  if (!isOpen) return null;

  const isValid = form.name && form.county && form.lat && form.lng;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#000000cc",
      backdropFilter: "blur(4px)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#0d0d0d",
        border: "1px solid #2a2a2a",
        width: 480,
        maxWidth: "95vw",
        maxHeight: "90vh",
        overflowY: "auto",
        padding: isMobile ? "16px 14px" : 28,
        paddingBottom: isMobile ? 80 : 28
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20
        }}>
          <div>
            <div style={{
              fontFamily: "'Bebas Neue'",
              fontSize: 24,
              letterSpacing: 2,
              color: "#c8b89a"
            }}>
              SUBMIT A LOCATION
            </div>
            <div style={{
              fontSize: 9,
              color: "#555",
              letterSpacing: 2
            }}>
              IRELAND ONLY · BE RESPONSIBLE
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#555",
              fontSize: 20,
              cursor: "pointer"
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          background: "#111",
          border: "1px solid #ff443322",
          padding: "10px 14px",
          marginBottom: 16,
          fontSize: 10,
          color: "#ff8866",
          lineHeight: 1.6,
          letterSpacing: 0.5
        }}>
          ⚠ Do not share access info that could lead to harm. Respect private property. No vandalism. Stay safe and don't enter structurally unsound buildings alone.
        </div>

        {[
          ["name", "Location Name", "text"],
          ["county", "County", "select-county"],
          ["lat", "Latitude (e.g. 53.349)", "text"],
          ["lng", "Longitude (e.g. -6.260)", "text"],
          ["type", "Type", "select-type"],
          ["risk", "Risk Level", "select-risk"],
          ["description", "Description", "textarea"],
          ["access", "Safe Access Guide", "textarea"],
          ["tags", "Tags (comma separated)", "text"],
          ["photo", "Photo (optional)", "file"],
        ].map(([field, label, inputType]) => (
          <div key={field} style={{ marginBottom: 12 }}>
            <div style={{
              fontSize: 9,
              color: "#666",
              letterSpacing: 2,
              marginBottom: 4
            }}>
              {label.toUpperCase()}
            </div>

            {inputType === "textarea" ? (
              <textarea
                value={form[field]}
                onChange={e => onFormChange(field, e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  background: "#111",
                  border: "1px solid #2a2a2a",
                  color: "#e0d8c8",
                  padding: "8px 10px",
                  fontSize: 11,
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box"
                }}
              />
            ) : inputType === "select-county" ? (
              <select
                value={form[field]}
                onChange={e => onFormChange(field, e.target.value)}
                style={{
                  width: "100%",
                  background: "#111",
                  border: "1px solid #2a2a2a",
                  color: "#e0d8c8",
                  padding: "8px 10px",
                  fontSize: 11,
                  outline: "none"
                }}
              >
                <option value="">Select county...</option>
                {IRELAND_COUNTIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : inputType === "select-type" ? (
              <select
                value={form[field]}
                onChange={e => onFormChange(field, e.target.value)}
                style={{
                  width: "100%",
                  background: "#111",
                  border: "1px solid #2a2a2a",
                  color: "#e0d8c8",
                  padding: "8px 10px",
                  fontSize: 11,
                  outline: "none"
                }}
              >
                <option value="industrial">Industrial</option>
                <option value="mansion">Mansion / Estate</option>
                <option value="asylum">Asylum / Hospital</option>
                <option value="hotel">Hotel</option>
                <option value="entertainment">Entertainment</option>
                <option value="church">Church</option>
              </select>
            ) : inputType === "select-risk" ? (
              <select
                value={form[field]}
                onChange={e => onFormChange(field, e.target.value)}
                style={{
                  width: "100%",
                  background: "#111",
                  border: "1px solid #2a2a2a",
                  color: "#e0d8c8",
                  padding: "8px 10px",
                  fontSize: 11,
                  outline: "none"
                }}
              >
                <option value="low">Low — structurally sound, minimal hazard</option>
                <option value="medium">Medium — some hazards, proceed with care</option>
                <option value="high">High — serious risks, experts only</option>
              </select>
            ) : inputType === "file" ? (
              <>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={e => onFormChange(field, e.target.files?.[0] || null)}
                  style={{
                    width: "100%",
                    background: "#111",
                    border: "1px solid #2a2a2a",
                    color: "#999",
                    padding: "8px 10px",
                    fontSize: 11,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
                {form[field] && (
                  <div style={{ fontSize: 9, color: "#666", marginTop: 6 }}>
                    ✓ {form[field].name}
                  </div>
                )}
              </>
            ) : (
              <input
                value={form[field]}
                onChange={e => onFormChange(field, e.target.value)}
                type="text"
                style={{
                  width: "100%",
                  background: "#111",
                  border: "1px solid #2a2a2a",
                  color: "#e0d8c8",
                  padding: "8px 10px",
                  fontSize: 11,
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            )}
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={onClose}
            className="btn-hover"
            style={{
              flex: 1,
              background: "transparent",
              border: "1px solid #2a2a2a",
              color: "#666",
              padding: "11px",
              fontFamily: "'Bebas Neue'",
              fontSize: 14,
              letterSpacing: 2,
              cursor: "pointer"
            }}
          >
            CANCEL
          </button>
          <button
            onClick={onSubmit}
            className="btn-hover"
            disabled={!isValid || isLoading}
            style={{
              flex: 2,
              background: "#c8b89a",
              color: "#0a0a0a",
              border: "none",
              padding: "11px",
              fontFamily: "'Bebas Neue'",
              fontSize: 14,
              letterSpacing: 2,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: (isValid && !isLoading) ? 1 : 0.4
            }}
          >
            {isLoading ? "UPLOADING..." : "SUBMIT LOCATION"}
          </button>
        </div>
      </div>
    </div>
  );
}
