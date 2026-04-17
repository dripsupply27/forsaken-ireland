import { useState } from "react";

export default function AuthModal({ isOpen, onClose, onSignUp, onSignIn, isLoading }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignUp) {
        await onSignUp(email, password);
      } else {
        await onSignIn(email, password);
      }
      setEmail("");
      setPassword("");
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100
    }}>
      <div style={{
        background: "#1a1a1a",
        padding: "30px",
        borderRadius: "4px",
        width: "90%",
        maxWidth: "400px",
        border: "1px solid #333"
      }}>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 24,
          letterSpacing: 2,
          marginBottom: 20,
          color: "#c8b89a"
        }}>
          {isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "10px",
              background: "#0a0a0a",
              border: "1px solid #333",
              color: "#e0d8c8",
              fontFamily: "'Space Mono', monospace",
              fontSize: 13
            }}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "10px",
              background: "#0a0a0a",
              border: "1px solid #333",
              color: "#e0d8c8",
              fontFamily: "'Space Mono', monospace",
              fontSize: 13
            }}
            disabled={isLoading}
          />

          {error && (
            <div style={{ color: "#ff6b6b", fontSize: 12, textAlign: "center" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "10px",
              background: "#c8b89a",
              color: "#0a0a0a",
              border: "none",
              fontFamily: "'Bebas Neue'",
              fontSize: 14,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.5 : 1
            }}
          >
            {isLoading ? "LOADING..." : (isSignUp ? "SIGN UP" : "SIGN IN")}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 12 }}>
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#c8b89a",
              cursor: "pointer",
              textDecoration: "underline"
            }}
            disabled={isLoading}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "none",
            border: "none",
            color: "#666",
            fontSize: 20,
            cursor: "pointer"
          }}
          disabled={isLoading}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
