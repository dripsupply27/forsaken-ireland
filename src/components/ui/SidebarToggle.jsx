export default function SidebarToggle({ isOpen, onClick, isMobile }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        background: "#0d0d0d",
        border: "1px solid #2a2a2a",
        color: "#c8b89a",
        width: isMobile ? 44 : 36,
        height: isMobile ? 44 : 36,
        cursor: "pointer",
        fontFamily: "'Bebas Neue'",
        fontSize: isMobile ? 22 : 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5
      }}
    >
      {isOpen ? "‹" : "›"}
    </button>
  );
}
