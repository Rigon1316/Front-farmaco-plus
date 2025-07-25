import React, { useState } from "react";
import { FaTrash, FaPlusCircle, FaPaperPlane, FaRobot } from "react-icons/fa";

function ConsultasIA() {
  // Estado para la consulta actual
  const [consulta, setConsulta] = useState("");
  // Estado para la respuesta de la IA
  const [respuesta, setRespuesta] = useState(null);
  // Estado para mostrar el spinner de carga
  const [cargando, setCargando] = useState(false);
  // Estado para mostrar errores
  const [error, setError] = useState("");
  // Historial de preguntas y respuestas de la sesión actual
  const [historial, setHistorial] = useState([]); // [{ pregunta, respuesta }]
  // Índice de la pregunta seleccionada en el historial
  const [seleccionado, setSeleccionado] = useState(null);

  // Maneja el envío del formulario para consultar a la IA
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");
    setRespuesta(null);
    try {
      // Realiza la petición al backend de IA
      const res = await fetch("http://localhost:8080/api/nlq/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ pregunta: consulta }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      const text = await res.text();
      setRespuesta(text);
      // Agrega la consulta y respuesta al historial (al inicio)
      setHistorial([{ pregunta: consulta, respuesta: text }, ...historial]);
      setSeleccionado(0); // Selecciona la última búsqueda
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setCargando(false);
      // No borrar el texto del textarea
    }
  };

  // Elimina una búsqueda específica del historial
  const eliminarBusqueda = (idx) => {
    const nuevoHistorial = historial.filter((_, i) => i !== idx);
    setHistorial(nuevoHistorial);
    // Si la búsqueda eliminada estaba seleccionada, deselecciona
    if (seleccionado === idx) {
      setSeleccionado(null);
    } else if (seleccionado > idx) {
      setSeleccionado(seleccionado - 1);
    }
  };

  // Limpia la consulta, respuesta y selección para una nueva consulta
  const nuevaConsulta = () => {
    setConsulta("");
    setRespuesta(null);
    setSeleccionado(null);
    setError("");
  };

  // Determina qué respuesta mostrar (la seleccionada del historial o la última respuesta)
  const respuestaAMostrar =
    seleccionado !== null && historial[seleccionado]
      ? historial[seleccionado].respuesta
      : respuesta;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 32 }}>
      {/* Historial de búsquedas a la izquierda */}
      <div
        style={{
          minWidth: 260,
          maxWidth: 320,
          background: "#e3f2fd",
          borderRadius: 12,
          padding: 18,
          boxShadow: "0 2px 8px rgba(25,118,210,0.07)",
          height: "fit-content",
          border: "1.5px solid #90caf9",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            fontSize: 18,
            color: "#1976d2",
            marginBottom: 12,
            letterSpacing: 1,
          }}
        >
          Historial de consultas
        </h3>
        {/* Lista de preguntas del historial */}
        {historial.length === 0 ? (
          <div style={{ color: "#888", fontSize: 15 }}>
            No hay búsquedas aún.
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {historial.map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: seleccionado === idx ? "#bbdefb" : "transparent",
                  color: seleccionado === idx ? "#1976d2" : "#222",
                  borderRadius: 7,
                  padding: "8px 10px",
                  marginBottom: 6,
                  cursor: "pointer",
                  fontWeight: seleccionado === idx ? 600 : 400,
                  transition: "background 0.2s, color 0.2s",
                  border:
                    seleccionado === idx
                      ? "1.5px solid #1976d2"
                      : "1.5px solid transparent",
                  fontSize: 15,
                }}
              >
                {/* Pregunta (clic para ver la respuesta) */}
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={item.pregunta}
                  onClick={() => setSeleccionado(idx)}
                >
                  {item.pregunta.length > 40
                    ? item.pregunta.slice(0, 40) + "..."
                    : item.pregunta}
                </span>
                {/* Botón para eliminar la búsqueda */}
                <button
                  onClick={() => eliminarBusqueda(idx)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#d32f2f",
                    marginLeft: 8,
                    cursor: "pointer",
                    fontSize: 16,
                    padding: 2,
                    borderRadius: 4,
                    transition: "background 0.2s",
                  }}
                  title="Eliminar búsqueda"
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#ffebee")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Formulario de consulta y respuesta */}
      <div style={{ flex: 1 }}>
        <h2 style={{ color: "#1976d2", letterSpacing: 1, marginBottom: 8 }}>
          Consultas con Inteligencia Artificial
        </h2>
        <p style={{ color: "#37474f", marginBottom: 18 }}>
          Aquí podrás hacer consultas con IA sobre los datos de la Farmacia.
        </p>
        {/* Formulario para enviar la consulta */}
        <form
          onSubmit={handleSubmit}
          style={{ marginTop: "2rem", maxWidth: 500 }}
        >
          <label
            htmlFor="consulta"
            style={{
              display: "block",
              marginBottom: 8,
              fontWeight: 500,
              color: "#1976d2",
            }}
          >
            Escribe tu consulta:
          </label>
          <textarea
            id="consulta"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 6,
              border: "1.5px solid #90caf9",
              resize: "vertical",
              fontSize: 16,
              background: "#fafafa",
              color: "#0d47a1",
            }}
            placeholder="Escribe aquí tu pregunta o consulta..."
            required
          />
          {/* Botones de acción: Enviar y Nueva consulta */}
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginTop: 18,
            }}
          >
            <button
              type="submit"
              style={{
                background: "#43a047",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "10px 24px",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              disabled={cargando}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#388e3c")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#43a047")}
            >
              <FaPaperPlane style={{ fontSize: 18 }} />{" "}
              {cargando ? "Consultando..." : "Enviar"}
            </button>
            <button
              type="button"
              onClick={nuevaConsulta}
              style={{
                background: "#fff",
                color: "#1976d2",
                border: "2px solid #1976d2",
                borderRadius: 6,
                padding: "10px 24px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#e3f2fd")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <FaPlusCircle style={{ fontSize: 18 }} /> Nueva consulta
            </button>
          </div>
        </form>
        {/* Mensaje de error */}
        {error && (
          <div
            style={{
              color: "#d32f2f",
              background: "#ffebee",
              borderRadius: 6,
              padding: "10px 18px",
              marginTop: 20,
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}
        {/* Respuesta de la IA */}
        {respuestaAMostrar && (
          <div
            style={{
              background: "#e3f2fd",
              color: "#1976d2",
              borderRadius: 8,
              padding: "1.1rem 1.3rem 1rem 1.3rem",
              marginTop: 40,
              boxShadow: "none",
              maxWidth: 650,
              minWidth: 320,
              position: "relative",
              fontSize: "1.13rem",
              fontWeight: 400,
              letterSpacing: 0.1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <FaRobot style={{ color: "#1976d2", fontSize: 22 }} />
              <strong
                style={{ fontSize: 18, color: "#1976d2", letterSpacing: 1 }}
              >
                Respuesta de la IA:
              </strong>
            </div>
            <div
              style={{
                marginTop: 8,
                whiteSpace: "pre-line",
                color: "#0d47a1",
                fontSize: 17,
                lineHeight: 1.7,
              }}
            >
              {respuestaAMostrar}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsultasIA;
