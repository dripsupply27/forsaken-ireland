import { TYPE_ICONS, RISK_COLORS, RISK_LABELS } from "../../lib/mapbox";
import RiskBadge from "../ui/RiskBadge";
import TagList from "../ui/TagList";
import CommentThread from "../comments/CommentThread";

export default function LocationDetail({ location, isLiked, onLike, onBack }) {
  return (
    <div style={{
      padding: "14px 14px 10px",
      borderBottom: "1px solid #1a1a1a",
      marginBottom: 8
    }}>
      <div style={{
        fontSize: 9,
        color: "#666",
        letterSpacing: 2,
        marginBottom: 10
      }}>
        SELECTED LOCATION
      </div>

      <div style={{
        fontFamily: "'Bebas Neue'",
        fontSize: 20,
        color: "#c8b89a",
        letterSpacing: 1,
        marginBottom: 6
      }}>
        {location.name}
      </div>

      {location.photo && (
        <img
          src={location.photo}
          alt={location.name}
          style={{
            width: "100%",
            height: 200,
            objectFit: "cover",
            marginBottom: 10,
            borderRadius: "2px"
          }}
        />
      )}

      <div style={{
        fontSize: 10,
        color: "#666",
        marginBottom: 8
      }}>
        {location.county} · {TYPE_ICONS[location.type]} {location.type.toUpperCase()}
      </div>

      <div style={{ marginBottom: 6 }}>
        <RiskBadge risk={location.risk} />
      </div>

      <p style={{
        fontSize: 11,
        color: "#b0a898",
        lineHeight: 1.6,
        margin: "10px 0"
      }}>
        {location.description}
      </p>

      <div style={{
        background: "#111",
        border: "1px solid #1f1f1f",
        padding: "10px",
        marginBottom: 10
      }}>
        <div style={{
          fontSize: 9,
          color: "#666",
          letterSpacing: 2,
          marginBottom: 6
        }}>
          ACCESS GUIDE
        </div>
        <p style={{
          fontSize: 10,
          color: "#8a8278",
          lineHeight: 1.6,
          margin: 0
        }}>
          {location.access}
        </p>
      </div>

      <TagList tags={location.tags} />

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8
      }}>
        <div style={{
          fontSize: 9,
          color: "#555"
        }}>
          by @{location.uploadedBy} · {location.date}
        </div>
        <button
          onClick={() => onLike(location.id)}
          className="btn-hover"
          style={{
            background: isLiked ? "#c8b89a22" : "transparent",
            border: `1px solid ${isLiked ? "#c8b89a" : "#333"}`,
            color: isLiked ? "#c8b89a" : "#666",
            padding: "5px 12px",
            fontSize: 11,
            cursor: "pointer",
            transition: "all 0.2s",
            letterSpacing: 1
          }}
        >
          ♥ {location.likes}
        </button>
      </div>

      <CommentThread locationId={location.id} />

      <button
        onClick={onBack}
        style={{
          marginTop: 12,
          background: "transparent",
          border: "none",
          color: "#555",
          fontSize: 10,
          cursor: "pointer",
          letterSpacing: 1,
          padding: 0
        }}
      >
        ← BACK TO LIST
      </button>
    </div>
  );
}
