import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import Button from "../components/Button";

const API_URL = "http://localhost:8080/api/ventas";

function VentaPage() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [busquedaId, setBusquedaId] = useState("");
  const [filtro, setFiltro] = useState("todos"); // Nuevo estado para el filtro
  const [selected, setSelected] = useState(null); // Estado para la fila seleccionada
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

  // Nueva función para buscar venta por ID
  const buscarVentaPorId = async (id) => {
    if (!id || id.trim() === "") {
      fetchVentas();
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("No se encontró una venta con ese ID");
          setVentas([]);
        } else {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
      } else {
        const venta = await res.json();
        setVentas([venta]); // Mostrar solo la venta encontrada
      }
    } catch (err) {
      console.error("Error buscando venta por ID:", err);
      setError("Error al buscar la venta");
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la búsqueda por ID
  const handleBusquedaId = (e) => {
    e.preventDefault();
    buscarVentaPorId(busquedaId);
  };

  // Nueva función para obtener ventas por estado
  const fetchVentasPorEstado = async (estado) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/estado/${estado}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      setVentas(data);
    } catch (err) {
      console.error("Error fetching ventas por estado:", err);
      setError("No se pudieron cargar las ventas por estado");
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para obtener ventas del día
  const fetchVentasDelDia = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/dia`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      setVentas(data);
    } catch (err) {
      console.error("Error fetching ventas del día:", err);
      setError("No se pudieron cargar las ventas del día");
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para obtener top ventas
  const fetchTopVentas = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/top`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      setVentas(data);
    } catch (err) {
      console.error("Error fetching top ventas:", err);
      setError("No se pudieron cargar las top ventas");
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el cambio de filtro
  const handleFiltroChange = (nuevoFiltro) => {
    setFiltro(nuevoFiltro);
    setCurrentPage(1); // Resetear a la primera página

    switch (nuevoFiltro) {
      case "PAGADA":
      case "PENDIENTE":
      case "CANCELADA":
      case "DEVUELTA":
        fetchVentasPorEstado(nuevoFiltro);
        break;
      case "dia":
        fetchVentasDelDia();
        break;
      case "top":
        fetchTopVentas();
        break;
      case "todos":
      default:
        fetchVentas();
        break;
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

      {/* Campo de búsqueda por ID */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          className="search-container"
          style={{ display: "flex", alignItems: "center" }}
        >
          <label
            htmlFor="busqueda-id"
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "#444",
              marginRight: "8px",
            }}
          >
            Buscar por ID:
          </label>
          <form
            onSubmit={handleBusquedaId}
            style={{ display: "flex", alignItems: "center" }}
          >
            <input
              id="busqueda-id"
              type="number"
              value={busquedaId}
              onChange={(e) => setBusquedaId(e.target.value)}
              placeholder="Ingrese ID"
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                backgroundColor: "#fff",
                fontSize: "14px",
                width: "120px",
                marginRight: "8px",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #1976d2",
                backgroundColor: "#1976d2",
                color: "#fff",
                fontSize: "14px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

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
            minWidth: 1200,
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
                background: "#1976d2",
                color: "#fff",
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
                  background: "#1976d2",
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
                  background: "#1976d2",
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
                  background: "#1976d2",
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
                  background: "#1976d2",
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
                  background: "#1976d2",
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
                  background: "#1976d2",
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
                  background: "#1976d2",
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
                  background: "#1976d2",
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
                  background: "#1976d2",
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
                  onClick={() => setSelected(venta)}
                  style={{
                    background:
                      selected && selected.id === venta.id
                        ? "#b3e5fc"
                        : idx % 2 === 0
                        ? "#fafbfc"
                        : "#fff",
                    transition: "background 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      selected && selected.id === venta.id
                        ? "#b3e5fc"
                        : "#e3f2fd")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      selected && selected.id === venta.id
                        ? "#b3e5fc"
                        : idx % 2 === 0
                        ? "#fafbfc"
                        : "#fff")
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 18,
            marginTop: "1.5rem",
            fontSize: 22,
            fontWeight: 400,
            color: "#1976d2",
            userSelect: "none",
          }}
        >
          {Array.from({ length: totalPages }, (_, i) => (
            <span
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                cursor: "pointer",
                color: currentPage === i + 1 ? "#fff" : "#1976d2",
                background: currentPage === i + 1 ? "#1976d2" : "transparent",
                borderRadius: 6,
                padding: "2px 14px",
                fontWeight: currentPage === i + 1 ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              {i + 1}
            </span>
          ))}
        </div>
      )}

      {/* Selector de filtros en la parte inferior */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
          padding: "16px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #e9ecef",
        }}
      >
        <label
          style={{
            fontSize: "14px",
            fontWeight: "500",
            color: "#444",
            marginRight: "12px",
            display: "flex",
            alignItems: "center",
          }}
        >
          Filtrar ventas:
        </label>
        <select
          value={filtro}
          onChange={(e) => handleFiltroChange(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            backgroundColor: "#fff",
            fontSize: "14px",
            cursor: "pointer",
            minWidth: "200px",
          }}
        >
          <option value="todos">Todas las ventas</option>
          <option value="PAGADA">Ventas pagadas</option>
          <option value="PENDIENTE">Ventas pendientes</option>
          <option value="CANCELADA">Ventas canceladas</option>
          <option value="DEVUELTA">Ventas devueltas</option>
          <option value="dia">Ventas del día</option>
          <option value="top">Top ventas</option>
        </select>
      </div>
    </div>
  );
}

export default VentaPage;
