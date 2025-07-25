// Utilidades para manejo de autenticación JWT

// Verificar si el token JWT es válido
export const isTokenValid = () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) return false;

  // Si es un token mock, verificar que existe
  if (token.startsWith("mock-jwt-token-")) {
    return true;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch (error) {
    console.error("Error al validar token:", error);
    return false;
  }
};

// Obtener el token JWT del localStorage
export const getAuthToken = () => {
  return localStorage.getItem("jwtToken");
};

// Función para hacer peticiones autenticadas
export const authenticatedFetch = async (url, options = {}) => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Si el token ha expirado (401), redirigir al login
    if (response.status === 401) {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");
      window.location.reload();
      throw new Error("Token expirado. Por favor, inicia sesión nuevamente.");
    }

    // Si es un token mock y el backend rechaza (403), usar datos mock
    if (response.status === 403 && token.startsWith("mock-jwt-token-")) {
      console.warn("Backend rechaza token mock, usando datos de ejemplo");
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return response;
  } catch (error) {
    // Si hay un error de conexión y es un token mock, permitir continuar
    if (token.startsWith("mock-jwt-token-") && error.name === "TypeError") {
      console.warn("Backend no disponible, usando modo mock");
      // Retornar una respuesta mock para evitar errores
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw error;
  }
};

// Función para renovar el token usando refresh token
export const refreshAuthToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No hay refresh token disponible");
  }

  try {
    const response = await fetch("http://localhost:8080/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      return data.token;
    } else {
      throw new Error("Error al renovar el token");
    }
  } catch (error) {
    console.error("Error renovando token:", error);
    // Si falla la renovación, limpiar todo y redirigir al login
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    window.location.reload();
    throw error;
  }
};

// Función para cerrar sesión
export const logout = () => {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("currentUser");
  window.location.reload();
};
