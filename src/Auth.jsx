import React, { useState } from "react";
import { HeartPulse } from "lucide-react";
import { supabase } from "./supabaseClient";

const C = {
  bg: "#0B1220",
  panel: "#111A2C",
  border: "rgba(94,234,212,0.14)",
  borderSoft: "rgba(148,163,184,0.10)",
  cyan: "#5EEAD4",
  rose: "#FB7185",
  text: "#EDF1F7",
  muted: "#6B7A99",
};

export default function Auth({ onAuthed }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!email || !password) {
      setError("Enter both an email and password.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (data.session) {
          onAuthed(data.session);
        } else {
          setNotice("Check your email to confirm your account, then log in.");
          setMode("login");
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onAuthed(data.session);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "'Manrope', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 360,
          background: C.panel,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <HeartPulse size={20} color={C.cyan} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 16 }}>
            VitalAI
          </span>
        </div>

        <div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.1em",
              color: C.muted,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Email
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            style={{
              width: "100%",
              background: "transparent",
              border: `1px solid ${C.borderSoft}`,
              borderRadius: 4,
              color: C.text,
              fontSize: 14,
              padding: "10px 12px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.1em",
              color: C.muted,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Password
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            style={{
              width: "100%",
              background: "transparent",
              border: `1px solid ${C.borderSoft}`,
              borderRadius: 4,
              color: C.text,
              fontSize: 14,
              padding: "10px 12px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <div style={{ color: C.rose, fontSize: 13 }}>{error}</div>
        )}
        {notice && (
          <div style={{ color: C.cyan, fontSize: 13 }}>{notice}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: C.cyan,
            color: "#08131A",
            border: "none",
            borderRadius: 4,
            padding: "11px 0",
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: "0.03em",
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Working…" : mode === "signup" ? "Create account" : "Log in"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signup" ? "login" : "signup");
            setError("");
            setNotice("");
          }}
          style={{
            background: "transparent",
            border: "none",
            color: C.muted,
            fontSize: 13,
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {mode === "signup" ? "Already have an account? Log in" : "New here? Create an account"}
        </button>
      </form>
    </div>
  );
}
