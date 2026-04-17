export default function LoadingScreen() {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      background: "#0a0a0a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      zIndex: 50
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 40,
        letterSpacing: 4,
        color: "#c8b89a"
      }}>
        FORSAKEN
      </div>
      <div style={{
        fontSize: 10,
        color: "#555",
        letterSpacing: 3
      }}>
        LOADING MAP...
      </div>
      <div style={{
        width: 120,
        height: 1,
        background: "#1a1a1a",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          height: "100%",
          background: "#c8b89a",
          animation: "load 1.5s infinite",
          width: "40%"
        }} />
      </div>
    </div>
  );
}
