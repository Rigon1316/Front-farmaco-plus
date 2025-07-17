import React, { useState } from "react";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Normalizar entradas
    const user = username.trim().toLowerCase();
    const pass = password.trim().toLowerCase();
    if (user === "demo" && pass === "demo") {
      localStorage.setItem("isLoggedIn", "true");
      window.location.reload();
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(120deg, #4882e7 0%, #1976d2 100%)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: "40px 32px 32px 32px",
          borderRadius: 18,
          boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
          minWidth: 340,
          maxWidth: 360,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "#4882e7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
            boxShadow: "0 2px 8px rgba(72,130,231,0.18)",
          }}
        >
          <svg width="32" height="32" fill="#fff" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
          </svg>
        </div>
        <h2
          style={{
            marginBottom: 24,
            textAlign: "center",
            color: "#1976d2",
            fontWeight: 800,
            letterSpacing: 1,
          }}
        >
          Iniciar sesión
        </h2>
        <div style={{ marginBottom: 18, width: "100%" }}>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              color: "#333",
              fontWeight: 600,
            }}
          >
            Usuario
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              padding: "12px 10px",
              borderRadius: 8,
              border: "1.5px solid #b6c6e3",
              fontSize: 16,
              outline: "none",
              transition: "border 0.2s",
              boxSizing: "border-box",
            }}
            autoComplete="username"
            placeholder="Usuario"
            onFocus={(e) => (e.target.style.border = "1.5px solid #4882e7")}
            onBlur={(e) => (e.target.style.border = "1.5px solid #b6c6e3")}
          />
        </div>
        <div style={{ marginBottom: 18, width: "100%" }}>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              color: "#333",
              fontWeight: 600,
            }}
          >
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 10px",
              borderRadius: 8,
              border: "1.5px solid #b6c6e3",
              fontSize: 16,
              outline: "none",
              transition: "border 0.2s",
              boxSizing: "border-box",
            }}
            autoComplete="current-password"
            placeholder="Contraseña"
            onFocus={(e) => (e.target.style.border = "1.5px solid #4882e7")}
            onBlur={(e) => (e.target.style.border = "1.5px solid #b6c6e3")}
          />
        </div>
        {error && (
          <div
            style={{
              color: "#d32f2f",
              marginBottom: 16,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          style={{
            width: "100%",
            background: "linear-gradient(90deg, #4882e7 0%, #1976d2 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "13px 0",
            fontWeight: 700,
            fontSize: 17,
            cursor: "pointer",
            marginTop: 8,
            boxShadow: "0 2px 8px rgba(72,130,231,0.10)",
            letterSpacing: 0.5,
            transition: "background 0.2s",
          }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
