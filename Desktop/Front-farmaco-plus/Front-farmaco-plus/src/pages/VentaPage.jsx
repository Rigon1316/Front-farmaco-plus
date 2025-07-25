import React, { useState, useEffect } from "react";
import { FaTrash, FaEye, FaShoppingCart, FaPlus } from "react-icons/fa";
import Button from "../components/Button";
import Modal from "../components/Modal";

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
  const [openAdd, setOpenAdd] = useState(false);
  const [openTicket, setOpenTicket] = useState(false); // Nuevo estado para el modal de ver ticket
  const [form, setForm] = useState({
    numeroFactura: "",
    subtotal: "",
    iva: "",
    total: "",
    fecha: "",
    cliente: "",
    metodoPago: "",
    estado: "",
    observaciones: "",
  });
  const [iva, setIva] = useState(0.15); // Valor por defecto
  const [clientes, setClientes] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);

  // Estado para los detalles de venta
  const [detalles, setDetalles] = useState([
    {
      medicamentoId: "",
      cantidad: 1,
      precioUnitario: "",
      subtotal: 0,
      observaciones: "",
    },
  ]);

  // Estado para info de producto buscado en cada detalle
  const [productosBuscados, setProductosBuscados] = useState([]);

  const [clienteIdInput, setClienteIdInput] = useState("");
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [clienteError, setClienteError] = useState("");

  const metodoPagoOptions = [
    "EFECTIVO",
    "TARJETA_CREDITO",
    "TARJETA_DEBITO",
    "TRANSFERENCIA",
  ];
  const estadoOptions = ["PAGADA", "PENDIENTE", "CANCELADA", "DEVUELTA"];

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

  // Al abrir el modal, obtener el IVA del backend
  useEffect(() => {
    if (openAdd) {
      fetch("http://localhost:8080/api/ventas/iva")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.iva) setIva(Number(data.iva));
        })
        .catch(() => setIva(0.15));
    }
  }, [openAdd]);

  // Cargar clientes y medicamentos al abrir el modal
  useEffect(() => {
    if (openAdd) {
      fetch("http://localhost:8080/api/clientes")
        .then((res) => res.json())
        .then((data) => setClientes(data || []));
      fetch("http://localhost:8080/api/medicamentos")
        .then((res) => res.json())
        .then((data) => setMedicamentos(data || []));
    }
  }, [openAdd]);

  // Calcular subtotal de los detalles
  useEffect(() => {
    setDetalles((detalles) =>
      detalles.map((det) => {
        const cantidad = parseFloat(det.cantidad) || 0;
        const precio = parseFloat(det.precioUnitario) || 0;
        return { ...det, subtotal: +(cantidad * precio).toFixed(2) };
      })
    );
  }, [
    detalles.length,
    detalles.map((d) => d.cantidad + "-" + d.precioUnitario).join(),
  ]);

  // Calcular subtotal total
  const subtotalNum = detalles.reduce(
    (acc, det) => acc + (parseFloat(det.subtotal) || 0),
    0
  );
  const ivaNum = +(subtotalNum * iva).toFixed(2);
  const totalNum = +(subtotalNum + ivaNum).toFixed(2);

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

  const buscarClientePorId = async (id) => {
    setClienteError("");
    setClienteEncontrado(null);
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:8080/api/clientes/dni/${id}`);
      if (!res.ok) {
        setClienteError("Cliente no encontrado");
        return;
      }
      const data = await res.json();
      setClienteEncontrado(data);
      setForm((f) => ({ ...f, clienteId: data.id }));
    } catch {
      setClienteError("Error al buscar cliente");
    }
  };

  const buscarProductoPorId = async (id, idx) => {
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:8080/api/medicamentos/${id}`);
      if (!res.ok) {
        setProductosBuscados((pb) => {
          const arr = [...pb];
          arr[idx] = {
            error: "Producto no encontrado",
            nombre: "",
            precio: "",
          };
          return arr;
        });
        return;
      }
      const data = await res.json();
      setProductosBuscados((pb) => {
        const arr = [...pb];
        arr[idx] = { nombre: data.nombre, precio: data.precio, error: "" };
        return arr;
      });
      setDetalles((ds) =>
        ds.map((d, i) =>
          i === idx ? { ...d, precioUnitario: data.precio } : d
        )
      );
    } catch {
      setProductosBuscados((pb) => {
        const arr = [...pb];
        arr[idx] = {
          error: "Error al buscar producto",
          nombre: "",
          precio: "",
        };
        return arr;
      });
    }
  };

  // Al enviar el formulario, usa los valores calculados:
  const handleAddVenta = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!clienteEncontrado) {
        setError("Debes buscar y seleccionar un cliente válido");
        setLoading(false);
        return;
      }
      const now = new Date();
      const fechaActualizacion = now.toISOString().slice(0, 10);
      const ventaData = {
        numeroFactura: form.numeroFactura,
        subtotal: subtotalNum,
        igv: ivaNum,
        total: totalNum,
        metodoPago: form.metodoPago,
        estado: form.estado,
        observaciones: form.observaciones || "",
        fechaVenta: form.fecha,
        fechaActualizacion,
        cliente: { id: clienteEncontrado.id },
        detalles: detalles.map((det, idx) => ({
          cantidad: Number(det.cantidad),
          precioUnitario: Number(det.precioUnitario),
          subtotal: Number(det.subtotal),
          igv: +(Number(det.subtotal) * iva).toFixed(2),
          total: +(Number(det.subtotal) + Number(det.subtotal) * iva).toFixed(
            2
          ),
          observaciones: det.observaciones || "",
          medicamento: { id: det.medicamentoId },
        })),
        pagada: form.estado === "PAGADA",
        cancelada: form.estado === "CANCELADA",
      };
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ventaData),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      setSuccess("Venta agregada exitosamente");
      setOpenAdd(false);
      setForm({
        numeroFactura: "",
        subtotal: "",
        iva: "",
        total: "",
        fecha: "",
        cliente: "",
        metodoPago: "",
        estado: "",
        observaciones: "",
      });
      setDetalles([
        {
          medicamentoId: "",
          cantidad: 1,
          precioUnitario: "",
          subtotal: 0,
          observaciones: "",
        },
      ]);
      setProductosBuscados([]);
      setClienteIdInput("");
      setClienteEncontrado(null);
      setClienteError("");
      fetchVentas();
    } catch (err) {
      setError(err.message || "No se pudo agregar la venta");
    } finally {
      setLoading(false);
    }
  };

  const getNextNumeroFactura = (ventas) => {
    const year = new Date().getFullYear();
    const prefix = "F001";
    // Buscar la secuencia máxima entre las ventas con el mismo prefijo y año
    const secuencias = ventas
      .map((v) => {
        const match = /^F001-(\d{4})-(\d{3})$/.exec(v.numeroFactura);
        if (match && match[1] === year.toString()) {
          return parseInt(match[2], 10);
        }
        return null;
      })
      .filter((n) => n !== null && !isNaN(n));
    const nextSeq = (secuencias.length === 0 ? 1 : Math.max(...secuencias) + 1)
      .toString()
      .padStart(3, "0");
    return `${prefix}-${year}-${nextSeq}`;
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
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          margin: "20px 0 0 0",
        }}
      >
        {/* Botones a la izquierda */}
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            className="custom-btn"
            icon={<FaPlus className="btn-icon-add" />}
            onClick={() => {
              setForm({
                ...form,
                numeroFactura: getNextNumeroFactura(ventas),
              });
              setOpenAdd(true);
            }}
            disabled={loading}
          >
            Agregar Venta
          </Button>
          <Button
            className="custom-btn info"
            icon={<FaEye />}
            onClick={() => setOpenTicket(true)}
            disabled={!selected || loading}
          >
            Ver Ticket
          </Button>
          <Button
            className="custom-btn danger"
            icon={<FaTrash />}
            onClick={() => selected && handleDelete(selected.id)}
            disabled={!selected || loading}
          >
            Eliminar
          </Button>
        </div>
        {/* Controles a la derecha, en columna */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 10,
            minWidth: 380,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
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
                IVA
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
                  colSpan={8}
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
                    {venta.igv ?? venta.iva ?? "-"}
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

      {/* Modal para agregar venta */}
      <Modal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        title="Agregar Nueva Venta"
      >
        <form onSubmit={handleAddVenta}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              maxHeight: "70vh",
              overflowY: "auto",
              padding: "8px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Columna izquierda */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <label
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                N° Factura:
                <input
                  type="text"
                  value={form.numeroFactura}
                  readOnly
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "4px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    background: "#f5f5f5",
                    color: "#1976d2",
                    fontWeight: "600",
                  }}
                />
              </label>

              <label
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                Cliente: *
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={clienteIdInput}
                    onChange={(e) => setClienteIdInput(e.target.value)}
                    placeholder="Buscar cliente por cédula"
                    style={{
                      flex: 1,
                      padding: "8px",
                      marginTop: "4px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (clienteIdInput.length === 10) {
                        try {
                          const res = await fetch(
                            `http://localhost:8080/api/clientes/dni/${clienteIdInput}`
                          );
                          if (res.ok) {
                            const data = await res.json();
                            setClienteEncontrado(data);
                          } else {
                            setClienteEncontrado(null);
                          }
                        } catch {
                          setClienteEncontrado(null);
                        }
                      } else {
                        setClienteEncontrado(null);
                      }
                    }}
                    style={{
                      padding: "8px 12px",
                      marginTop: "4px",
                      borderRadius: "4px",
                      border: "1px solid #1976d2",
                      background: "#1976d2",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Buscar
                  </button>
                </div>
                {clienteEncontrado && (
                  <div
                    style={{
                      marginTop: "4px",
                      padding: "4px 8px",
                      background: "#e8f5e8",
                      color: "#2e7d32",
                      borderRadius: "4px",
                      fontSize: "12px",
                      border: "1px solid #c8e6c9",
                    }}
                  >
                    ✓ {clienteEncontrado.nombre} {clienteEncontrado.apellido}
                  </div>
                )}
                {clienteError && (
                  <div
                    style={{
                      marginTop: "4px",
                      padding: "4px 8px",
                      background: "#ffebee",
                      color: "#d32f2f",
                      borderRadius: "4px",
                      fontSize: "12px",
                      border: "1px solid #ffcdd2",
                    }}
                  >
                    ✗ {clienteError}
                  </div>
                )}
              </label>

              <label
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                Método de pago: *
                <select
                  value={form.metodoPago || ""}
                  onChange={(e) =>
                    setForm({ ...form, metodoPago: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "4px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                >
                  <option value="">Seleccione...</option>
                  {metodoPagoOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <label
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                Estado:
                <select
                  value={form.estado || "PENDIENTE"}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "4px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                >
                  {estadoOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>

              <label
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                Observaciones:
                <input
                  type="text"
                  value={form.observaciones || ""}
                  onChange={(e) =>
                    setForm({ ...form, observaciones: e.target.value })
                  }
                  placeholder="Observaciones de la venta"
                  maxLength="500"
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "4px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
              </label>
            </div>

            {/* Columna derecha - Resumen de totales */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                style={{
                  background: "#f8f9fa",
                  border: "1px solid #e9ecef",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    color: "#1976d2",
                    fontSize: "16px",
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  Resumen de Totales
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 100px",
                    rowGap: "8px",
                    columnGap: "12px",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    Subtotal:
                  </span>
                  <input
                    type="number"
                    value={subtotalNum}
                    readOnly
                    style={{
                      background: "#f5f5f5",
                      color: "#666",
                      cursor: "default",
                      fontWeight: "600",
                      fontSize: "14px",
                      textAlign: "right",
                      border: "1px solid #e0e0e0",
                      borderRadius: "4px",
                      padding: "6px 8px",
                    }}
                  />
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    IVA:
                  </span>
                  <input
                    type="number"
                    value={ivaNum}
                    readOnly
                    style={{
                      background: "#f5f5f5",
                      color: "#666",
                      cursor: "default",
                      fontWeight: "600",
                      fontSize: "14px",
                      textAlign: "right",
                      border: "1px solid #e0e0e0",
                      borderRadius: "4px",
                      padding: "6px 8px",
                    }}
                  />
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "16px",
                      color: "#1976d2",
                    }}
                  >
                    Total:
                  </span>
                  <input
                    type="number"
                    value={totalNum}
                    readOnly
                    style={{
                      background: "#e3f2fd",
                      color: "#1976d2",
                      cursor: "default",
                      fontWeight: "700",
                      fontSize: "16px",
                      textAlign: "right",
                      border: "2px solid #1976d2",
                      borderRadius: "4px",
                      padding: "6px 8px",
                    }}
                  />
                </div>
              </div>

              {/* Detalles de la venta */}
              <div
                style={{
                  background: "#f8f9fa",
                  border: "1px solid #e9ecef",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    color: "#1976d2",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Detalles de la Venta
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr 80px 80px",
                    gap: "8px",
                    fontWeight: "600",
                    color: "#1976d2",
                    fontSize: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <div>Cant.</div>
                  <div>Producto</div>
                  <div>Precio</div>
                  <div>Subtotal</div>
                </div>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {detalles.map((det, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "60px 1fr 80px 80px",
                        gap: "8px",
                        alignItems: "center",
                        marginBottom: "8px",
                        padding: "8px",
                        background: "#fff",
                        borderRadius: "4px",
                        border: "1px solid #e9ecef",
                      }}
                    >
                      <input
                        type="number"
                        min="1"
                        value={det.cantidad}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDetalles((ds) =>
                            ds.map((d, i) =>
                              i === idx ? { ...d, cantidad: v } : d
                            )
                          );
                        }}
                        placeholder="Cant."
                        required
                        style={{
                          width: "100%",
                          padding: "4px 6px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      />
                      <input
                        type="text"
                        value={det.medicamentoNombre || ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDetalles((ds) =>
                            ds.map((d, i) =>
                              i === idx ? { ...d, medicamentoNombre: v } : d
                            )
                          );
                        }}
                        placeholder="Nombre del medicamento"
                        required
                        style={{
                          width: "100%",
                          padding: "4px 6px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      />
                      <span
                        style={{
                          color: "#1976d2",
                          fontWeight: "600",
                          fontSize: "12px",
                          textAlign: "right",
                        }}
                      >
                        {productosBuscados[idx] && productosBuscados[idx].precio
                          ? `$${productosBuscados[idx].precio}`
                          : det.precioUnitario
                          ? `$${det.precioUnitario}`
                          : "-"}
                      </span>
                      <span
                        style={{
                          color: "#1976d2",
                          fontWeight: "600",
                          fontSize: "12px",
                          textAlign: "right",
                        }}
                      >
                        {det.subtotal ? `$${det.subtotal}` : "-"}
                      </span>
                      {productosBuscados[idx] &&
                        productosBuscados[idx].error && (
                          <span
                            style={{
                              color: "#d32f2f",
                              fontWeight: "600",
                              gridColumn: "1 / -1",
                              fontSize: "11px",
                              marginTop: "4px",
                            }}
                          >
                            ✗ {productosBuscados[idx].error}
                          </span>
                        )}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "12px",
                  }}
                >
                  <button
                    type="button"
                    onClick={async () => {
                      const idx = detalles.length - 1;
                      const det = detalles[idx];
                      const nombre = det.medicamentoNombre;
                      if (nombre && nombre.length > 2) {
                        try {
                          const res = await fetch(
                            `http://localhost:8080/api/medicamentos/buscar?nombre=${encodeURIComponent(
                              nombre
                            )}`
                          );
                          if (res.ok) {
                            const data = await res.json();
                            let med = Array.isArray(data) ? data[0] : data;
                            if (med && med.id) {
                              setProductosBuscados((pb) => {
                                const arr = [...pb];
                                arr[idx] = {
                                  nombre: med.nombre,
                                  precio: med.precio,
                                  error: "",
                                };
                                return arr;
                              });
                              setDetalles((ds) =>
                                ds.map((d, i) =>
                                  i === idx
                                    ? {
                                        ...d,
                                        medicamentoId: med.id,
                                        precioUnitario: med.precio,
                                        medicamentoNombre: med.nombre,
                                      }
                                    : d
                                )
                              );
                            } else {
                              setProductosBuscados((pb) => {
                                const arr = [...pb];
                                arr[idx] = {
                                  error: "Medicamento no encontrado",
                                  nombre: "",
                                  precio: "",
                                };
                                return arr;
                              });
                            }
                          } else {
                            setProductosBuscados((pb) => {
                              const arr = [...pb];
                              arr[idx] = {
                                error: "Medicamento no encontrado",
                                nombre: "",
                                precio: "",
                              };
                              return arr;
                            });
                          }
                        } catch {
                          setProductosBuscados((pb) => {
                            const arr = [...pb];
                            arr[idx] = {
                              error: "Error al buscar medicamento",
                              nombre: "",
                              precio: "",
                            };
                            return arr;
                          });
                        }
                      }
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "4px",
                      border: "1px solid #1976d2",
                      background: "#1976d2",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Buscar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDetalles([
                        ...detalles,
                        {
                          medicamentoId: "",
                          medicamentoNombre: "",
                          cantidad: 1,
                          precioUnitario: "",
                          subtotal: 0,
                          observaciones: "",
                        },
                      ])
                    }
                    style={{
                      padding: "6px 12px",
                      borderRadius: "4px",
                      border: "1px solid #4caf50",
                      background: "#4caf50",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#1976d2",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(25, 118, 210, 0.2)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "#1256a3";
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow =
                    "0 4px 8px rgba(25, 118, 210, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#1976d2";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(25, 118, 210, 0.2)";
              }}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => setOpenAdd(false)}
              style={{
                flex: 1,
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#ff6b6b",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#ff5252";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#ff6b6b";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
            >
              Cancelar
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </form>
      </Modal>

      {/* Modal para ver ticket */}
      <Modal
        open={openTicket}
        onClose={() => setOpenTicket(false)}
        title={`Ticket de Venta - ${selected?.numeroFactura || ""}`}
      >
        {selected && (
          <div style={{ padding: "0 12px 16px", maxWidth: "600px" }}>
            <div style={{ marginBottom: "16px" }}>
              <h3
                style={{
                  color: "#1976d2",
                  marginBottom: "12px",
                  fontSize: "16px",
                }}
              >
                Información de la Venta
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  fontSize: "14px",
                }}
              >
                <div>
                  <p>
                    <strong>N° Factura:</strong> {selected.numeroFactura}
                  </p>
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {selected.fechaVenta
                      ? new Date(selected.fechaVenta).toLocaleString()
                      : "-"}
                  </p>
                  <p>
                    <strong>Estado:</strong> {selected.estado || "-"}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Método de Pago:</strong>{" "}
                    {selected.metodoPago || "-"}
                  </p>
                  <p>
                    <strong>Total:</strong> {selected.total || "0"}
                  </p>
                  <p>
                    <strong>Observaciones:</strong>{" "}
                    {selected.observaciones || "-"}
                  </p>
                </div>
              </div>
            </div>

            {selected.cliente && (
              <div style={{ marginBottom: "16px" }}>
                <h3
                  style={{
                    color: "#1976d2",
                    marginBottom: "12px",
                    fontSize: "16px",
                  }}
                >
                  Cliente
                </h3>
                <div style={{ fontSize: "14px" }}>
                  <p>
                    <strong>ID:</strong> {selected.cliente.id} |{" "}
                    <strong>Nombre:</strong> {selected.cliente.nombre || "-"}
                  </p>
                  <p>
                    <strong>Teléfono:</strong>{" "}
                    {selected.cliente.telefono || "-"} | <strong>Email:</strong>{" "}
                    {selected.cliente.email || "-"}
                  </p>
                </div>
              </div>
            )}

            {selected.detalles && selected.detalles.length > 0 && (
              <div>
                <h3
                  style={{
                    color: "#1976d2",
                    marginBottom: "12px",
                    fontSize: "16px",
                  }}
                >
                  Detalles de la Venta
                </h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f5f5f5" }}>
                      <th
                        style={{
                          padding: "6px",
                          textAlign: "left",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Producto
                      </th>
                      <th
                        style={{
                          padding: "6px",
                          textAlign: "center",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Cant.
                      </th>
                      <th
                        style={{
                          padding: "6px",
                          textAlign: "right",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Precio
                      </th>
                      <th
                        style={{
                          padding: "6px",
                          textAlign: "right",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.detalles.map((detalle, idx) => (
                      <tr key={idx}>
                        <td
                          style={{
                            padding: "6px",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          {detalle.medicamento
                            ? detalle.medicamento.nombre
                            : "Producto"}
                        </td>
                        <td
                          style={{
                            padding: "6px",
                            textAlign: "center",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          {detalle.cantidad}
                        </td>
                        <td
                          style={{
                            padding: "6px",
                            textAlign: "right",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          {detalle.precioUnitario}
                        </td>
                        <td
                          style={{
                            padding: "6px",
                            textAlign: "right",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          {detalle.subtotal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        colSpan="3"
                        style={{
                          padding: "6px",
                          textAlign: "right",
                          fontWeight: "bold",
                        }}
                      >
                        Subtotal:
                      </td>
                      <td style={{ padding: "6px", textAlign: "right" }}>
                        {selected.subtotal}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan="3"
                        style={{
                          padding: "6px",
                          textAlign: "right",
                          fontWeight: "bold",
                        }}
                      >
                        IVA:
                      </td>
                      <td style={{ padding: "6px", textAlign: "right" }}>
                        {selected.iva}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan="3"
                        style={{
                          padding: "6px",
                          textAlign: "right",
                          fontWeight: "bold",
                        }}
                      >
                        Total:
                      </td>
                      <td
                        style={{
                          padding: "6px",
                          textAlign: "right",
                          fontWeight: "bold",
                        }}
                      >
                        {selected.total}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <div
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                className="custom-btn"
                onClick={() => setOpenTicket(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default VentaPage;
