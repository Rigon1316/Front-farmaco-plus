import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Normalizar entradas
      const userEmail = email.trim().toLowerCase();
      const userPassword = password.trim();

      // Validar que los campos no estén vacíos
      if (!userEmail || !userPassword) {
        setError("Por favor, completa todos los campos");
        setIsLoading(false);
        return;
      }

      // Verificar credenciales locales (temporal hasta que el backend esté listo)
      const validCredentials = {
        email: "maques1316@gmail.com",
        password: "Incipio123",
      };

      if (
        userEmail === validCredentials.email &&
        userPassword === validCredentials.password
      ) {
        // Simular token JWT temporal
        const mockToken = "mock-jwt-token-" + Date.now();
        const mockRefreshToken = "mock-refresh-token-" + Date.now();

        // Guardar token en localStorage
        localStorage.setItem("jwtToken", mockToken);
        localStorage.setItem("refreshToken", mockRefreshToken);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", userEmail);

        // Recargar la página para actualizar el estado de autenticación
        window.location.reload();
        return;
      }

      // Si las credenciales locales no coinciden, intentar con el backend
      try {
        const response = await fetch(
          "http://localhost:8080/api/auth/authenticate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: userEmail,
              password: userPassword,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();

          // Guardar token en localStorage
          localStorage.setItem("jwtToken", data.token);
          localStorage.setItem("refreshToken", data.refreshToken);
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("currentUser", userEmail);

          // Recargar la página para actualizar el estado de autenticación
          window.location.reload();
        } else {
          // Manejar diferentes tipos de errores
          if (response.status === 401) {
            setError("Credenciales incorrectas");
          } else if (response.status === 404) {
            setError("Usuario no encontrado");
          } else {
            setError("Error en el servidor. Intenta nuevamente.");
          }
        }
      } catch (backendError) {
        console.error("Error de conexión con backend:", backendError);
        setError("Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error general:", error);
      setError("Error de conexión. Verifica que el servidor esté funcionando.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "12px 10px",
              borderRadius: 8,
              border: "1.5px solid #b6c6e3",
              fontSize: 16,
              outline: "none",
              transition: "border 0.2s",
              boxSizing: "border-box",
              opacity: isLoading ? 0.7 : 1,
            }}
            autoComplete="email"
            placeholder="maques1316@gmail.com"
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
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "12px 10px",
                paddingRight: "45px",
                borderRadius: 8,
                border: "1.5px solid #b6c6e3",
                fontSize: 16,
                outline: "none",
                transition: "border 0.2s",
                boxSizing: "border-box",
                opacity: isLoading ? 0.7 : 1,
              }}
              autoComplete="current-password"
              placeholder="Incipio123"
              onFocus={(e) => (e.target.style.border = "1.5px solid #4882e7")}
              onBlur={(e) => (e.target.style.border = "1.5px solid #b6c6e3")}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                color: "#666",
                fontSize: "16px",
                padding: "4px",
                borderRadius: "4px",
                transition: "color 0.2s",
                opacity: isLoading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.target.style.color = "#1976d2";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#666";
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              color: "#d32f2f",
              marginBottom: 16,
              textAlign: "center",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            background: isLoading
              ? "#ccc"
              : "linear-gradient(90deg, #4882e7 0%, #1976d2 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "13px 0",
            fontWeight: 700,
            fontSize: 17,
            cursor: isLoading ? "not-allowed" : "pointer",
            marginTop: 8,
            boxShadow: "0 2px 8px rgba(72,130,231,0.10)",
            letterSpacing: 0.5,
            transition: "background 0.2s",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? "Iniciando sesión..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
