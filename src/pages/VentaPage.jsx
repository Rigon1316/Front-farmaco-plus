import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";

const API_URL = "http://localhost:8080/api/ventas";

function VentaPage() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchVentas();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchVentas = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      setVentas(data);
    } catch (err) {
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta venta?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      setSuccess("Venta eliminada exitosamente");
      fetchVentas();
    } catch (err) {
      setError(err.message || "No se pudo eliminar la venta");
    } finally {
      setLoading(false);
    }
  };

  // Paginación
  const totalPages = Math.ceil(ventas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVentas = ventas.slice(startIndex, endIndex);

  return (
    <div>
      <h2
        style={{
          marginBottom: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#ff9800",
        }}
      >
        <FaShoppingCart style={{ fontSize: 28, color: "#ff9800" }} /> Gestión de
        Ventas
      </h2>
      {loading && (
        <div style={{ color: "#1976d2", margin: "1rem 0" }}>Cargando...</div>
      )}
      {error && (
        <div style={{ color: "#d32f2f", margin: "1rem 0" }}>{error}</div>
      )}
      {success && (
        <div style={{ color: "#388e3c", margin: "1rem 0" }}>{success}</div>
      )}
      <div
        style={{
          overflowX: "auto",
          margin: "2rem auto 0 auto",
          maxWidth: "98vw",
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(25,118,210,0.10)",
          background: "#fff",
        }}
      >
        <table
          style={{
            minWidth: 900,
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            borderRadius: 12,
            overflow: "hidden",
            fontSize: 15,
            fontFamily: "Segoe UI",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f5f5f5",
                position: "sticky",
                top: 0,
                zIndex: 2,
              }}
            >
              <th
                style={{
                  padding: "14px 10px",
                  textAlign: "left",
                  borderBottom: "2px solid #e0e0e0",
                  position: "sticky",
                  top: 0,
                  background: "#f5f5f5",
                  zIndex: 3,
                }}
              >
                ID
              </th>
              <th
                style={{
                  padding: "14px 10px",
                  textAlign: "left",
                  borderBottom: "2px solid #e0e0e0",
                  position: "sticky",
                  top: 0,
                  background: "#f5f5f5",
                  zIndex: 3,
                }}
              >
                N° Factura
              </th>
              <th
                style={{
                  padding: "14px 10px",
                  textAlign: "left",
                  borderBottom: "2px solid #e0e0e0",
                  position: "sticky",
                  top: 0,
                  background: "#f5f5f5",
                  zIndex: 3,
                }}
              >
                Subtotal
              </th>
              <th
                style={{
                  padding: "14px 10px",
                  textAlign: "left",
                  borderBottom: "2px solid #e0e0e0",
                  position: "sticky",
                  top: 0,
                  background: "#f5f5f5",
                  zIndex: 3,
                }}
              >
                IGV
              </th>
              <th
                style={{
                  padding: "14px 10px",
                  textAlign: "left",
                  borderBottom: "2px solid #e0e0e0",
                  position: "sticky",
                  top: 0,
                  background: "#f5f5f5",
                  zIndex: 3,
                }}
              >
                Total
              </th>
              <th
                style={{
                  padding: "14px 10px",
                  textAlign: "left",
                  borderBottom: "2px solid #e0e0e0",
                  position: "sticky",
                  top: 0,
                  background: "#f5f5f5",
                  zIndex: 3,
                }}
              >
                Método de Pago
              </th>
              <th
                style={{
                  padding: "14px 10px",
                  textAlign: "left",
                  borderBottom: "2px solid #e0e0e0",
                  position: "sticky",
                  top: 0,
                  background: "#f5f5f5",
                  zIndex: 3,
                }}
              >
                Estado
              </th>
              <th
                style={{
                  padding: "14px 10px",
                  textAlign: "left",
                  borderBottom: "2px solid #e0e0e0",
                  position: "sticky",
                  top: 0,
                  background: "#f5f5f5",
                  zIndex: 3,
                }}
              >
                Observaciones
              </th>
              <th
                style={{
                  padding: "14px 10px",
                  textAlign: "left",
                  borderBottom: "2px solid #e0e0e0",
                  position: "sticky",
                  top: 0,
                  background: "#f5f5f5",
                  zIndex: 3,
                }}
              >
                Fecha de Venta
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedVentas.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{ textAlign: "center", color: "#888", padding: 32 }}
                >
                  No hay ventas registradas.
                </td>
              </tr>
            ) : (
              paginatedVentas.map((venta, idx) => (
                <tr
                  key={venta.id}
                  style={{
                    background: idx % 2 === 0 ? "#fafbfc" : "#fff",
                    transition: "background 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#e3f2fd")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      idx % 2 === 0 ? "#fafbfc" : "#fff")
                  }
                >
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {venta.id}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {venta.numeroFactura || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {venta.subtotal ?? "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {venta.igv ?? "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {venta.total ?? "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {venta.metodoPago || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {venta.estado || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {venta.observaciones || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {venta.fechaVenta
                      ? new Date(venta.fechaVenta).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Paginación */}
      {totalPages > 1 && (
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: currentPage === 1 ? "#eee" : "#fff",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            Anterior
          </button>
          <span style={{ alignSelf: "center" }}>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: currentPage === totalPages ? "#eee" : "#fff",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

export default VentaPage;
