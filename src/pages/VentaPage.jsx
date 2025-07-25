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
  const [iva, setIva] = useState(0.15);
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
      const res = await fetch(`http://localhost:8080/api/clientes/${id}`);
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
        iva: ivaNum,
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
          iva: +(Number(det.subtotal) * iva).toFixed(2),
          total: +(Number(det.subtotal) + Number(det.subtotal) * iva).toFixed(
            2
          ),
          observaciones: det.observaciones || "",
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
                    {venta.iva ?? "-"}
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
        <form onSubmit={handleAddVenta} style={{ paddingBottom: 48 }}>
          <div
            style={{
              display: "flex",
              gap: 32,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            {/* Columna izquierda: formulario principal */}
            <div style={{ flex: 1, minWidth: 340, maxWidth: 520 }}>
              <div className="modal-form-grid">
                <label>
                  N° Factura
                  <input
                    type="text"
                    value={form.numeroFactura}
                    readOnly
                    style={{
                      background: "#fff",
                      color: "#222",
                      border: "1.5px solid #b6c6e3",
                      fontWeight: 700,
                      cursor: "default",
                    }}
                  />
                </label>
                <label>
                  Fecha
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={(e) =>
                      setForm({ ...form, fecha: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  ID Cliente
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <input
                      type="number"
                      value={clienteIdInput}
                      onChange={(e) => setClienteIdInput(e.target.value)}
                      onBlur={(e) => buscarClientePorId(e.target.value)}
                      placeholder="Ingrese ID de cliente"
                      style={{ width: 180 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => buscarClientePorId(clienteIdInput)}
                      style={{
                        background: "#1976d2",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 16px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Buscar
                    </button>
                  </div>
                  {clienteEncontrado && (
                    <div
                      style={{
                        marginTop: 6,
                        color: "#1976d2",
                        fontWeight: 600,
                      }}
                    >
                      {clienteEncontrado.nombre} {clienteEncontrado.apellido}{" "}
                      (DNI: {clienteEncontrado.dni})
                    </div>
                  )}
                  {clienteError && (
                    <div
                      style={{
                        marginTop: 6,
                        color: "#d32f2f",
                        fontWeight: 600,
                      }}
                    >
                      {clienteError}
                    </div>
                  )}
                </label>
              </div>
              {/* Subtotal, IVA, Total alineados a la izquierda */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 220px",
                  rowGap: 18,
                  columnGap: 32,
                  margin: "32px 0 0 0",
                  alignItems: "center",
                  maxWidth: 500,
                }}
              >
                <label
                  style={{ textAlign: "left", fontWeight: 700, fontSize: 18 }}
                >
                  Subtotal
                </label>
                <input
                  type="number"
                  value={subtotalNum}
                  readOnly
                  style={{
                    background: "#f1f1f1",
                    color: "#888",
                    cursor: "default",
                    fontWeight: 700,
                    fontSize: 18,
                    textAlign: "right",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 18px",
                  }}
                />
                <label
                  style={{ textAlign: "left", fontWeight: 700, fontSize: 18 }}
                >
                  IVA
                </label>
                <input
                  type="number"
                  value={ivaNum}
                  readOnly
                  style={{
                    background: "#f1f1f1",
                    color: "#888",
                    cursor: "default",
                    fontWeight: 700,
                    fontSize: 18,
                    textAlign: "right",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 18px",
                  }}
                />
                <label
                  style={{
                    textAlign: "left",
                    fontWeight: 700,
                    fontSize: 20,
                    color: "#1976d2",
                  }}
                >
                  Total
                </label>
                <input
                  type="number"
                  value={totalNum}
                  readOnly
                  style={{
                    background: "#f1f1f1",
                    color: "#1976d2",
                    cursor: "default",
                    fontWeight: 900,
                    fontSize: 22,
                    textAlign: "right",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 18px",
                  }}
                />
              </div>
              <div className="modal-form-grid" style={{ marginTop: 10 }}>
                <label>
                  Método de pago
                  <select
                    value={form.metodoPago || ""}
                    onChange={(e) =>
                      setForm({ ...form, metodoPago: e.target.value })
                    }
                    required
                  >
                    <option value="">Seleccione...</option>
                    {metodoPagoOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Estado
                  <select
                    value={form.estado || ""}
                    onChange={(e) =>
                      setForm({ ...form, estado: e.target.value })
                    }
                    required
                  >
                    <option value="">Seleccione...</option>
                    {estadoOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ gridColumn: "1 / -1" }}>
                  Observaciones
                  <input
                    type="text"
                    value={form.observaciones || ""}
                    onChange={(e) =>
                      setForm({ ...form, observaciones: e.target.value })
                    }
                    placeholder="Observaciones de la venta"
                  />
                </label>
              </div>
            </div>
            {/* Columna derecha: panel de detalles */}
            <div style={{ flex: 1.2, minWidth: 340, maxWidth: 600 }}>
              <div className="detalle-panel">
                <div className="detalle-panel-titulo">Detalles de la venta</div>
                {/* Títulos de columna */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "70px 110px 130px 120px 110px 90px 1fr",
                    gap: 10,
                    fontWeight: 700,
                    color: "#1976d2",
                    marginBottom: 8,
                    fontSize: 15,
                  }}
                >
                  <div>Cant.</div>
                  <div>ID prod.</div>
                  <div></div>
                  <div>Precio</div>
                  <div>Subtotal</div>
                  <div></div>
                  <div>Producto</div>
                </div>
                {detalles.map((det, idx) => (
                  <div
                    key={idx}
                    className="detalle-fila"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "70px 110px 120px 110px 1fr",
                      gap: 10,
                      alignItems: "center",
                      marginBottom: 18,
                      background: "none",
                      border: "none",
                      width: "100%",
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
                      placeholder="Cantidad"
                      required
                    />
                    <input
                      type="number"
                      value={det.medicamentoId || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDetalles((ds) =>
                          ds.map((d, i) =>
                            i === idx ? { ...d, medicamentoId: v } : d
                          )
                        );
                      }}
                      placeholder="ID producto"
                      required
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={det.precioUnitario}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDetalles((ds) =>
                          ds.map((d, i) =>
                            i === idx ? { ...d, precioUnitario: v } : d
                          )
                        );
                      }}
                      placeholder="Precio unitario"
                      required
                    />
                    <input
                      type="number"
                      value={det.subtotal}
                      readOnly
                      style={{
                        background: "#f1f1f1",
                        color: "#888",
                        cursor: "default",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        buscarProductoPorId(det.medicamentoId, idx)
                      }
                      style={{
                        background: "#1976d2",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        justifySelf: "end",
                        minWidth: 130,
                      }}
                    >
                      Buscar producto
                    </button>
                    {detalles.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setDetalles((ds) => ds.filter((_, i) => i !== idx))
                        }
                        style={{
                          background: "#ff6b6b",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 12px",
                          cursor: "pointer",
                          minWidth: 90,
                          gridColumn: "1 / -1",
                          marginTop: 6,
                        }}
                      >
                        Quitar
                      </button>
                    )}
                    <div style={{ minWidth: 180, gridColumn: "1 / -1" }}>
                      {productosBuscados[idx]?.nombre && (
                        <div className="nombre-producto">
                          {productosBuscados[idx].nombre}
                        </div>
                      )}
                      {productosBuscados[idx]?.error && (
                        <div className="error-producto">
                          {productosBuscados[idx].error}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="agregar-detalle-btn"
                  style={{ marginTop: 10 }}
                  onClick={() => {
                    setDetalles([
                      ...detalles,
                      {
                        medicamentoId: "",
                        cantidad: 1,
                        precioUnitario: "",
                        subtotal: 0,
                        observaciones: "",
                      },
                    ]);
                    setProductosBuscados((pb) => [...pb, {}]);
                  }}
                >
                  Agregar detalle
                </button>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid #e0e0e0",
            }}
          >
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
              <h3 style={{ color: "#1976d2", marginBottom: "12px", fontSize: "16px" }}>Información de la Venta</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "14px" }}>
                <div>
                  <p><strong>N° Factura:</strong> {selected.numeroFactura}</p>
                  <p><strong>Fecha:</strong> {selected.fechaVenta ? new Date(selected.fechaVenta).toLocaleString() : "-"}</p>
                  <p><strong>Estado:</strong> {selected.estado || "-"}</p>
                </div>
                <div>
                  <p><strong>Método de Pago:</strong> {selected.metodoPago || "-"}</p>
                  <p><strong>Total:</strong> {selected.total || "0"}</p>
                  <p><strong>Observaciones:</strong> {selected.observaciones || "-"}</p>
                </div>
              </div>
            </div>
            
            {selected.cliente && (
              <div style={{ marginBottom: "16px" }}>
                <h3 style={{ color: "#1976d2", marginBottom: "12px", fontSize: "16px" }}>Cliente</h3>
                <div style={{ fontSize: "14px" }}>
                  <p><strong>ID:</strong> {selected.cliente.id} | <strong>Nombre:</strong> {selected.cliente.nombre || "-"}</p>
                  <p><strong>Teléfono:</strong> {selected.cliente.telefono || "-"} | <strong>Email:</strong> {selected.cliente.email || "-"}</p>
                </div>
              </div>
            )}
            
            {selected.detalles && selected.detalles.length > 0 && (
              <div>
                <h3 style={{ color: "#1976d2", marginBottom: "12px", fontSize: "16px" }}>Detalles de la Venta</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f5f5f5" }}>
                      <th style={{ padding: "6px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Producto</th>
                      <th style={{ padding: "6px", textAlign: "center", borderBottom: "1px solid #ddd" }}>Cant.</th>
                      <th style={{ padding: "6px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Precio</th>
                      <th style={{ padding: "6px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.detalles.map((detalle, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}>
                          {detalle.medicamento ? detalle.medicamento.nombre : "Producto"}
                        </td>
                        <td style={{ padding: "6px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                          {detalle.cantidad}
                        </td>
                        <td style={{ padding: "6px", textAlign: "right", borderBottom: "1px solid #eee" }}>
                          {detalle.precioUnitario}
                        </td>
                        <td style={{ padding: "6px", textAlign: "right", borderBottom: "1px solid #eee" }}>
                          {detalle.subtotal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" style={{ padding: "6px", textAlign: "right", fontWeight: "bold" }}>Subtotal:</td>
                      <td style={{ padding: "6px", textAlign: "right" }}>{selected.subtotal}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" style={{ padding: "6px", textAlign: "right", fontWeight: "bold" }}>IVA:</td>
                      <td style={{ padding: "6px", textAlign: "right" }}>{selected.iva}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" style={{ padding: "6px", textAlign: "right", fontWeight: "bold" }}>Total:</td>
                      <td style={{ padding: "6px", textAlign: "right", fontWeight: "bold" }}>{selected.total}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            
            <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
              <Button className="custom-btn" onClick={() => setOpenTicket(false)}>
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
