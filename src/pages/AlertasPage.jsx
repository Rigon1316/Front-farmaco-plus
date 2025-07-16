import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import Modal from "../components/Modal";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaBell,
  FaSearch,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
} from "react-icons/fa";
import "./MedicamentosPage.css";

const API_URL = "http://localhost:8080/api/alertas";

const tiposAlerta = [
  "STOCK_BAJO",
  "VENCIMIENTO",
  "SISTEMA",
  "VENTA",
  "CLIENTE",
];

const prioridades = ["BAJA", "MEDIA", "ALTA", "CRITICA"];

const initialForm = {
  titulo: "",
  descripcion: "",
  tipo: tiposAlerta[0],
  prioridad: prioridades[0],
  fechaVencimiento: "",
  activa: true,
};

function DetalleVentaPage() {
  const [alertas, setAlertas] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterPrioridad, setFilterPrioridad] = useState("");
  const itemsPerPage = 10;
  // Estado para el modal de lectura
  const [openRead, setOpenRead] = useState(false);
  const [alertaLeida, setAlertaLeida] = useState(null);
  // Estado local para IDs de alertas leídas
  const [leidas, setLeidas] = useState([]);

  useEffect(() => {
    fetchAlertas();
  }, []);

  // Limpiar mensajes después de 3 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchAlertas = async () => {
    setLoading(true);
    setError("");
    console.log("🔍 Intentando cargar alertas desde:", API_URL);
    try {
      const res = await fetch(API_URL);
      console.log("📡 Respuesta del servidor:", res.status, res.statusText);
      if (!res.ok) {
        // Si el endpoint no existe, usar datos de ejemplo
        console.log("Endpoint no encontrado, usando datos de ejemplo");
        const mockData = [
          {
            id: 1,
            titulo: "Stock bajo - Paracetamol",
            descripcion:
              "El medicamento Paracetamol tiene menos de 10 unidades en stock",
            tipo: "STOCK BAJO",
            prioridad: "ALTA",
            fechaVencimiento: "2024-02-15",
            activa: true,
            fechaCreacion: "2024-01-15T10:30:00",
          },
          {
            id: 2,
            titulo: "Vencimiento próximo - Ibuprofeno",
            descripcion: "El lote de Ibuprofeno vence en 30 días",
            tipo: "VENCIMIENTO",
            prioridad: "MEDIA",
            fechaVencimiento: "2024-03-01",
            activa: true,
            fechaCreacion: "2024-01-14T14:20:00",
          },
          {
            id: 3,
            titulo: "Mantenimiento del sistema",
            descripcion:
              "Programado mantenimiento del sistema para el próximo domingo",
            tipo: "SISTEMA",
            prioridad: "BAJA",
            fechaVencimiento: "2024-01-21",
            activa: true,
            fechaCreacion: "2024-01-13T09:15:00",
          },
        ];
        setAlertas(mockData);
        setError(
          "⚠️ Usando datos de ejemplo - Endpoint no disponible en el backend"
        );
        return;
      }
      const data = await res.json();
      console.log("✅ Datos recibidos:", data);
      setAlertas(data);
    } catch (err) {
      console.error("💥 Error completo:", err);
      // Usar datos de ejemplo en caso de error
      const mockData = [
        {
          id: 1,
          titulo: "Stock bajo - Paracetamol",
          descripcion:
            "El medicamento Paracetamol tiene menos de 10 unidades en stock",
          tipo: "STOCK BAJO",
          prioridad: "ALTA",
          fechaVencimiento: "2024-02-15",
          activa: true,
          fechaCreacion: "2024-01-15T10:30:00",
        },
        {
          id: 2,
          titulo: "Vencimiento próximo - Ibuprofeno",
          descripcion: "El lote de Ibuprofeno vence en 30 días",
          tipo: "VENCIMIENTO",
          prioridad: "MEDIA",
          fechaVencimiento: "2024-03-01",
          activa: true,
          fechaCreacion: "2024-01-14T14:20:00",
        },
        {
          id: 3,
          titulo: "Mantenimiento del sistema",
          descripcion:
            "Programado mantenimiento del sistema para el próximo domingo",
          tipo: "SISTEMA",
          prioridad: "BAJA",
          fechaVencimiento: "2024-01-21",
          activa: true,
          fechaCreacion: "2024-01-13T09:15:00",
        },
      ];
      setAlertas(mockData);
      setError("⚠️ Usando datos de ejemplo - Error de conexión con el backend");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    if (!form.titulo.trim()) return "El título es obligatorio";
    if (form.titulo.length > 100)
      return "El título no puede exceder 100 caracteres";
    if (!form.descripcion.trim()) return "La descripción es obligatoria";
    if (form.descripcion.length > 500)
      return "La descripción no puede exceder 500 caracteres";
    if (!form.tipo) return "El tipo de alerta es obligatorio";
    if (!form.prioridad) return "La prioridad es obligatoria";
    return null;
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const alertaData = {
        ...form,
        fechaCreacion: new Date().toISOString(),
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertaData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      setSuccess("Alerta agregada exitosamente");
      setOpenAdd(false);
      setForm(initialForm);
      fetchAlertas();
    } catch (err) {
      console.error("Error adding alerta:", err);
      setError(err.message || "No se pudo agregar la alerta");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (alerta) => {
    setSelected(alerta);
    setForm({
      titulo: alerta.titulo || "",
      descripcion: alerta.descripcion || "",
      tipo: alerta.tipo || tiposAlerta[0],
      prioridad: alerta.prioridad || prioridades[0],
      fechaVencimiento: alerta.fechaVencimiento
        ? alerta.fechaVencimiento.slice(0, 10)
        : "",
      activa: alerta.activa !== undefined ? alerta.activa : true,
    });
    setOpenEdit(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selected) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const alertaData = {
        ...form,
        fechaVencimiento: form.fechaVencimiento
          ? new Date(form.fechaVencimiento).toISOString()
          : null,
      };

      const res = await fetch(`${API_URL}/${selected.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(alertaData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      setSuccess("Alerta actualizada exitosamente");
      setOpenEdit(false);
      setSelected(null);
      setForm(initialForm);
      fetchAlertas();
    } catch (err) {
      console.error("Error updating alerta:", err);
      setError(err.message || "No se pudo editar la alerta");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta alerta?")) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      setSuccess("Alerta eliminada exitosamente");
      setSelected(null);
      fetchAlertas();
    } catch (err) {
      console.error("Error deleting alerta:", err);
      setError(err.message || "No se pudo eliminar la alerta");
    } finally {
      setLoading(false);
    }
  };

  const toggleAlerta = async (id, activa) => {
    try {
      const res = await fetch(`${API_URL}/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !activa }),
      });

      if (res.ok) {
        setSuccess(
          `Alerta ${!activa ? "activada" : "desactivada"} exitosamente`
        );
        fetchAlertas();
      }
    } catch (err) {
      console.error("Error toggling alerta:", err);
      setError("No se pudo cambiar el estado de la alerta");
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setError("");
  };

  // Filtrar alertas por búsqueda y filtros
  const filteredAlertas = alertas.filter((alerta) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      alerta.titulo?.toLowerCase().includes(searchLower) ||
      alerta.descripcion?.toLowerCase().includes(searchLower) ||
      alerta.tipo?.toLowerCase().includes(searchLower);

    const matchesTipo = !filterTipo || alerta.tipo === filterTipo;
    const matchesPrioridad =
      !filterPrioridad || alerta.prioridad === filterPrioridad;

    return matchesSearch && matchesTipo && matchesPrioridad;
  });

  // Lógica de paginación
  const totalPages = Math.ceil(filteredAlertas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAlertas = filteredAlertas.slice(startIndex, endIndex);

  // Marcar alerta como leída
  const marcarComoLeida = (id) => {
    if (!leidas.includes(id)) {
      setLeidas((prev) => [...prev, id]);
    }
  };

  const renderAcciones = (alerta) => {
    const esLeida = leidas.includes(alerta.id);
    return (
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          className={`custom-btn info${esLeida ? " leido-btn" : ""}`}
          style={
            esLeida
              ? { background: "#bdbdbd", color: "#fff", border: "none" }
              : {}
          }
          onClick={() => {
            setAlertaLeida(alerta);
            setOpenRead(true);
            marcarComoLeida(alerta.id);
          }}
        >
          {esLeida ? "Leído" : "Leer"}
        </Button>
      </div>
    );
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case "STOCK_BAJO":
        return <FaExclamationTriangle style={{ color: "#ff9800" }} />;
      case "VENCIMIENTO":
        return <FaTimes style={{ color: "#f44336" }} />;
      case "SISTEMA":
        return <FaInfoCircle style={{ color: "#2196f3" }} />;
      case "VENTA":
        return <FaCheckCircle style={{ color: "#4caf50" }} />;
      case "CLIENTE":
        return <FaBell style={{ color: "#9c27b0" }} />;
      default:
        return <FaBell />;
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case "CRITICA":
        return "#f44336";
      case "ALTA":
        return "#ff9800";
      case "MEDIA":
        return "#ffc107";
      case "BAJA":
        return "#4caf50";
      default:
        return "#666";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES");
    } catch {
      return "Fecha inválida";
    }
  };

  // Función para formatear el tipo de alerta
  const formatTipo = (tipo) => {
    if (!tipo) return "";
    return tipo
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        background: "transparent",
        padding: "2rem 0",
      }}
    >
      {/* Elimino el contenedor blanco, dejo solo el contenido principal */}
      <div style={{ width: "100%", maxWidth: 1400 }}>
        <h2
          style={{
            marginBottom: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#ffb300",
            fontWeight: 700,
            fontSize: 32,
          }}
        >
          <FaExclamationTriangle style={{ fontSize: 32, color: "#ffb300" }} />{" "}
          Gestión de Alertas
        </h2>

        {/* Mensajes de estado */}
        {loading && (
          <div
            style={{
              color: "#1976d2",
              margin: "1rem 0",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div className="loading-spinner"></div>
            Procesando...
          </div>
        )}

        {error && (
          <div
            style={{
              color: "#d32f2f",
              margin: "1rem 0",
              padding: "12px",
              background: "#ffebee",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FaTimes />
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              color: "#2e7d32",
              margin: "1rem 0",
              padding: "12px",
              background: "#e8f5e8",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FaCheck />
            {success}
          </div>
        )}

        {/* Barra de herramientas */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: "1rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          {/* El botón Nueva Alerta ha sido eliminado */}
        </div>

        {/* Tabla de alertas */}
        <div
          className="table-container"
          style={{ width: "100%", marginTop: "1.5rem", overflow: "visible" }}
        >
          <table
            className="custom-table"
            style={{
              width: "100%",
              minWidth: 900,
              borderCollapse: "separate",
              borderSpacing: 0,
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "left", verticalAlign: "middle" }}>
                  Tipo
                </th>
                <th style={{ textAlign: "left", verticalAlign: "middle" }}>
                  Título
                </th>
                <th style={{ textAlign: "center", verticalAlign: "middle" }}>
                  Prioridad
                </th>
                <th style={{ textAlign: "center", verticalAlign: "middle" }}>
                  Estado
                </th>
                <th style={{ textAlign: "center", verticalAlign: "middle" }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedAlertas.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "left",
                      padding: "2rem",
                      verticalAlign: "middle",
                    }}
                  >
                    {loading ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <div className="loading-spinner"></div>
                        Cargando alertas...
                      </div>
                    ) : (
                      "No hay alertas para mostrar"
                    )}
                  </td>
                </tr>
              ) : (
                paginatedAlertas.map((alerta) => (
                  <tr
                    key={alerta.id}
                    style={{
                      backgroundColor:
                        alerta.estado === "INACTIVA" ? "#f5f5f5" : "inherit",
                      opacity: alerta.estado === "INACTIVA" ? 0.7 : 1,
                    }}
                  >
                    <td style={{ textAlign: "left", verticalAlign: "middle" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          justifyContent: "flex-start",
                        }}
                      >
                        {getTipoIcon(alerta.tipo)}
                        {formatTipo(alerta.tipo)}
                      </div>
                    </td>
                    <td style={{ textAlign: "left", verticalAlign: "middle" }}>
                      {alerta.titulo}
                    </td>
                    <td
                      style={{ textAlign: "center", verticalAlign: "middle" }}
                    >
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: getPrioridadColor(alerta.nivel),
                          color: "white",
                          fontSize: "12px",
                          fontWeight: "bold",
                          display: "inline-block",
                        }}
                      >
                        {alerta.nivel}
                      </span>
                    </td>
                    <td
                      style={{ textAlign: "center", verticalAlign: "middle" }}
                    >
                      {alerta.estado}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        verticalAlign: "middle",
                        height: 48,
                        padding: 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                        }}
                      >
                        {renderAcciones(alerta)}
                      </div>
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

        {/* Modal para agregar */}
        <Modal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          title="Nueva Alerta"
        >
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                maxLength={100}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Descripción *
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                maxLength={500}
                rows={3}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Tipo de Alerta *
              </label>
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              >
                {tiposAlerta.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Prioridad *
              </label>
              <select
                name="prioridad"
                value={form.prioridad}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              >
                {prioridades.map((prioridad) => (
                  <option key={prioridad} value={prioridad}>
                    {prioridad}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                name="fechaVencimiento"
                value={form.fechaVencimiento}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  name="activa"
                  checked={form.activa}
                  onChange={handleChange}
                />
                Alerta activa
              </label>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
              }}
            >
              <Button
                type="button"
                className="custom-btn secondary"
                onClick={() => setOpenAdd(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="custom-btn primary"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal para editar */}
        <Modal
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          title="Editar Alerta"
        >
          <form onSubmit={handleEdit}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                maxLength={100}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Descripción *
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                maxLength={500}
                rows={3}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Tipo de Alerta *
              </label>
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              >
                {tiposAlerta.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Prioridad *
              </label>
              <select
                name="prioridad"
                value={form.prioridad}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              >
                {prioridades.map((prioridad) => (
                  <option key={prioridad} value={prioridad}>
                    {prioridad}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                name="fechaVencimiento"
                value={form.fechaVencimiento}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  name="activa"
                  checked={form.activa}
                  onChange={handleChange}
                />
                Alerta activa
              </label>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
              }}
            >
              <Button
                type="button"
                className="custom-btn secondary"
                onClick={() => setOpenEdit(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="custom-btn primary"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal para leer descripción */}
        <Modal
          open={openRead}
          onClose={() => setOpenRead(false)}
          title="Descripción de la Alerta"
        >
          <div
            style={{
              padding: 16,
              fontSize: 16,
              position: "relative",
              minHeight: 120,
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>
              {alertaLeida?.titulo}
            </div>
            <div style={{ marginBottom: 24 }}>
              {alertaLeida?.descripcion || alertaLeida?.mensaje}
            </div>
            {alertaLeida && (
              <button
                style={{
                  position: "absolute",
                  right: 24,
                  bottom: 16,
                  background: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 28px",
                  fontWeight: 600,
                  fontSize: "16px",
                  boxShadow: "0 2px 8px rgba(25,118,210,0.10)",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onClick={() => {
                  handleDelete(alertaLeida.id);
                  setOpenRead(false);
                }}
              >
                Realizado
              </button>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default DetalleVentaPage;
