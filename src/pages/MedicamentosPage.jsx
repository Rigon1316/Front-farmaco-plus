import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import Modal from "../components/Modal";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaPills,
} from "react-icons/fa";
import "./MedicamentosPage.css";

const API_URL = "http://localhost:8080/api/medicamentos";

const categorias = [
  "ANALGESICOS",
  "ANTIBIOTICOS",
  "ANTIINFLAMATORIOS",
  "ANTIHISTAMINICOS",
  "ANTIPIRETICOS",
  "ANTITUSIVOS",
  "LAXANTES",
  "VITAMINAS",
  "SUPLEMENTOS",
  "DERMATOLOGICOS",
  "OFTALMOLOGICOS",
  "OTROS",
];
const estados = ["ACTIVO", "INACTIVO", "DESCONTINUADO"];

const initialForm = {
  nombre: "",
  principioActivo: "",
  presentacion: "",
  concentracion: "",
  laboratorio: "",
  precio: "",
  stock: "",
  stockMinimo: "",
  fechaCaducidad: "",
  codigoBarras: "",
  descripcion: "",
  categoria: categorias[0],
  estado: estados[0],
  requiereReceta: false,
};

function MedicamentosPage() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false); // Nuevo estado para modal de detalles
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtro, setFiltro] = useState("todos"); // Nuevo estado para el filtro
  const [busquedaId, setBusquedaId] = useState(""); // Nuevo estado para búsqueda por ID
  const itemsPerPage = 10;

  useEffect(() => {
    fetchMedicamentos();
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

  const fetchMedicamentos = async () => {
    setLoading(true);
    setError("");
    console.log("🔍 Intentando cargar medicamentos desde:", API_URL);
    try {
      const res = await fetch(API_URL);
      console.log("📡 Respuesta del servidor:", res.status, res.statusText);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Error en la respuesta:", errorText);
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      console.log("✅ Datos recibidos:", data);
      setMedicamentos(data);
    } catch (err) {
      console.error("💥 Error completo:", err);
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para obtener medicamentos agotados
  const fetchMedicamentosAgotados = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/agotados`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      setMedicamentos(data);
    } catch (err) {
      console.error("Error fetching medicamentos agotados:", err);
      setError("No se pudieron cargar los medicamentos agotados");
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para obtener medicamentos próximos a caducar
  const fetchMedicamentosProximosACaducar = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/caducidad?diasAntes=30`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      setMedicamentos(data);
    } catch (err) {
      console.error("Error fetching medicamentos próximos a caducar:", err);
      setError("No se pudieron cargar los medicamentos próximos a caducar");
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para buscar medicamento por ID
  const buscarMedicamentoPorId = async (id) => {
    if (!id || id.trim() === "") {
      fetchMedicamentos();
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("No se encontró un medicamento con ese ID");
          setMedicamentos([]);
        } else {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
      } else {
        const medicamento = await res.json();
        setMedicamentos([medicamento]); // Mostrar solo el medicamento encontrado
      }
    } catch (err) {
      console.error("Error buscando medicamento por ID:", err);
      setError("Error al buscar el medicamento");
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la búsqueda por ID
  const handleBusquedaId = (e) => {
    e.preventDefault();
    buscarMedicamentoPorId(busquedaId);
  };

  // Función para manejar el cambio de filtro
  const handleFiltroChange = (nuevoFiltro) => {
    setFiltro(nuevoFiltro);
    setCurrentPage(1); // Resetear a la primera página

    switch (nuevoFiltro) {
      case "agotados":
        fetchMedicamentosAgotados();
        break;
      case "proximos-caducar":
        fetchMedicamentosProximosACaducar();
        break;
      case "todos":
      default:
        fetchMedicamentos();
        break;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          precio: parseFloat(form.precio),
          stock: parseInt(form.stock),
          stockMinimo: parseInt(form.stockMinimo),
          fechaCaducidad: form.fechaCaducidad
            ? new Date(form.fechaCaducidad).toISOString()
            : null,
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      setSuccess("Medicamento agregado exitosamente");
      setOpenAdd(false);
      setForm(initialForm);
      fetchMedicamentos();
    } catch (err) {
      console.error("Error adding medicamento:", err);
      setError(err.message || "No se pudo agregar el medicamento");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (med) => {
    setSelected(med);
    setForm({
      nombre: med.nombre || "",
      principioActivo: med.principioActivo || "",
      presentacion: med.presentacion || "",
      concentracion: med.concentracion || "",
      laboratorio: med.laboratorio || "",
      precio: med.precio || "",
      stock: med.stock || "",
      stockMinimo: med.stockMinimo || "",
      fechaCaducidad: med.fechaCaducidad ? med.fechaCaducidad.slice(0, 16) : "",
      codigoBarras: med.codigoBarras || "",
      descripcion: med.descripcion || "",
      categoria: med.categoria || categorias[0],
      estado: med.estado || estados[0],
      requiereReceta: med.requiereReceta || false,
    });
    setOpenEdit(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          precio: parseFloat(form.precio),
          stock: parseInt(form.stock),
          stockMinimo: parseInt(form.stockMinimo),
          fechaCaducidad: form.fechaCaducidad
            ? new Date(form.fechaCaducidad).toISOString()
            : null,
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      setSuccess("Medicamento actualizado exitosamente");
      setOpenEdit(false);
      setSelected(null);
      setForm(initialForm);
      fetchMedicamentos();
    } catch (err) {
      console.error("Error updating medicamento:", err);
      setError(err.message || "No se pudo editar el medicamento");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este medicamento?"))
      return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      setSuccess("Medicamento eliminado exitosamente");
      setSelected(null);
      fetchMedicamentos();
    } catch (err) {
      console.error("Error deleting medicamento:", err);
      setError(err.message || "No se pudo eliminar el medicamento");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setError("");
  };

  // Lógica de paginación
  const totalPages = Math.ceil(medicamentos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMedicamentos = medicamentos.slice(startIndex, endIndex);

  // Función para abrir el modal de detalles
  const openDetailsModal = (med) => {
    setSelected(med);
    setOpenDetails(true);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <FaPills size={32} color="#8e24aa" />
          <h1>Gestión de Medicamentos</h1>
        </div>
        <div
          className="page-actions"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "16px 0",
            borderRadius: "8px",
            minWidth: 340,
            gap: 8,
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
            Filtrar medicamentos:
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
            <option value="todos">Todos los medicamentos</option>
            <option value="agotados">Medicamentos agotados</option>
            <option value="proximos-caducar">Próximos a caducar</option>
          </select>
        </div>
      </div>

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

      {/* Botones de acción */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          margin: "1rem 0 0.5rem 0",
        }}
      >
        <Button
          icon={<FaPlus className="btn-icon-add" />}
          onClick={() => setOpenAdd(true)}
          disabled={loading}
        >
          Agregar Medicamento
        </Button>
        <Button
          icon={<FaEdit className="btn-icon-edit" />}
          className="custom-btn secondary"
          onClick={() => selected && openEditModal(selected)}
          disabled={!selected}
        >
          Editar
        </Button>
        <Button
          icon={<FaTrash className="btn-icon-delete" />}
          className="custom-btn danger"
          onClick={() => selected && handleDelete(selected.id)}
          disabled={!selected}
        >
          Eliminar
        </Button>

        {/* Campo de búsqueda por ID */}
        <div className="search-container" style={{ marginLeft: "auto" }}>
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
                Nombre
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
                Principio Activo
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
                Presentación
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
                Concentración
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
                Laboratorio
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
                Precio
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
                Stock
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
                Stock Mínimo
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
                Fecha Caducidad
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
                Código Barras
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
                Categoría
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
                Requiere Receta
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
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedMedicamentos.length === 0 ? (
              <tr>
                <td
                  colSpan={14}
                  style={{ textAlign: "center", color: "#888", padding: 32 }}
                >
                  {loading
                    ? "Cargando medicamentos..."
                    : "No hay medicamentos registrados"}
                </td>
              </tr>
            ) : (
              paginatedMedicamentos.map((med, idx) => (
                <tr
                  key={med.id}
                  onClick={() => setSelected(med)}
                  style={{
                    background:
                      selected && selected.id === med.id
                        ? "#b3e5fc"
                        : idx % 2 === 0
                        ? "#fafbfc"
                        : "#fff",
                    transition: "background 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      selected && selected.id === med.id
                        ? "#b3e5fc"
                        : "#e3f2fd")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      selected && selected.id === med.id
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
                    {med.id}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {med.nombre || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {med.principioActivo || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {med.presentacion || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {med.concentracion || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {med.laboratorio || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    ${med.precio || "0"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {med.stock || "0"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {med.stockMinimo || "0"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {med.fechaCaducidad ? med.fechaCaducidad.slice(0, 10) : "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {med.codigoBarras || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {med.categoria || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        background:
                          med.estado === "ACTIVO"
                            ? "#e8f5e8"
                            : med.estado === "INACTIVO"
                            ? "#fff3e0"
                            : "#ffebee",
                        color:
                          med.estado === "ACTIVO"
                            ? "#2e7d32"
                            : med.estado === "INACTIVO"
                            ? "#f57c00"
                            : "#d32f2f",
                      }}
                    >
                      {med.estado || "-"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        background: med.requiereReceta ? "#ffebee" : "#e8f5e8",
                        color: med.requiereReceta ? "#d32f2f" : "#2e7d32",
                      }}
                    >
                      {med.requiereReceta ? "Sí" : "No"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Button
                      icon={<FaPills />}
                      onClick={(e) => {
                        e.stopPropagation(); // Evita que el botón de acción abra el modal de detalles
                        openDetailsModal(med);
                      }}
                      disabled={loading}
                      className="custom-btn info"
                    >
                      Detalles
                    </Button>
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
      {/* Este bloque se elimina porque ya está arriba */}

      {/* Modal para agregar */}
      <Modal
        open={openAdd}
        onClose={() => {
          setOpenAdd(false);
          resetForm();
        }}
        title="Agregar Medicamento"
      >
        <form onSubmit={handleAdd}>
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
            <label
              style={{
                marginBottom: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              Nombre: *
              <input
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleChange}
                required
                maxLength="100"
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
                placeholder="Ingrese el nombre"
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
              Principio Activo:
              <input
                name="principioActivo"
                type="text"
                value={form.principioActivo}
                onChange={handleChange}
                maxLength="100"
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
                placeholder="Ingrese el principio activo"
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
              Presentación:
              <input
                name="presentacion"
                type="text"
                value={form.presentacion}
                onChange={handleChange}
                maxLength="100"
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
                placeholder="Ingrese la presentación"
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
              Concentración:
              <input
                name="concentracion"
                type="text"
                value={form.concentracion}
                onChange={handleChange}
                maxLength="100"
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
                placeholder="Ingrese la concentración"
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
              Laboratorio:
              <input
                name="laboratorio"
                type="text"
                value={form.laboratorio}
                onChange={handleChange}
                maxLength="100"
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
                placeholder="Ingrese el laboratorio"
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
              Precio: *
              <input
                name="precio"
                type="number"
                step="0.01"
                value={form.precio}
                onChange={handleChange}
                required
                min={0}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
                placeholder="0.00"
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
              Stock: *
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                required
                min={0}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
                placeholder="0"
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
              Stock Mínimo: *
              <input
                name="stockMinimo"
                type="number"
                value={form.stockMinimo}
                onChange={handleChange}
                required
                min={0}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
                placeholder="0"
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
              Fecha Caducidad:
              <input
                name="fechaCaducidad"
                type="date"
                value={form.fechaCaducidad}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
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
              Código Barras:
              <input
                name="codigoBarras"
                type="text"
                value={form.codigoBarras}
                onChange={handleChange}
                maxLength="100"
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
                placeholder="Ingrese el código de barras"
              />
            </label>
            <label
              style={{
                gridColumn: "1 / -1",
                marginBottom: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              Descripción:
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                maxLength="200"
                rows={3}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  resize: "vertical",
                }}
                placeholder="Ingrese la descripción"
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
              Categoría:
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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
                name="estado"
                value={form.estado}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              >
                {estados.map((est) => (
                  <option key={est} value={est}>
                    {est}
                  </option>
                ))}
              </select>
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: "10px",
              }}
            >
              <input
                name="requiereReceta"
                type="checkbox"
                checked={form.requiereReceta}
                onChange={handleChange}
                style={{ marginRight: 8 }}
              />
              Requiere Receta
            </label>
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
        </form>
      </Modal>
      {/* Modal para editar */}
      <Modal
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelected(null);
          resetForm();
        }}
        title="Editar Medicamento"
      >
        <form onSubmit={handleEdit}>
          <div
            className="formulario-medicamento-grid"
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
            <label className="form-field-block">
              Nombre: *
              <input
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleChange}
                required
                maxLength="100"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                placeholder="Ingrese el nombre"
                onFocus={(e) => {
                  e.target.style.borderColor = "#1976d2";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(25, 118, 210, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </label>
            <label className="form-field-block">
              Principio Activo:
              <input
                name="principioActivo"
                type="text"
                value={form.principioActivo}
                onChange={handleChange}
                maxLength="100"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                placeholder="Ingrese el principio activo"
                onFocus={(e) => {
                  e.target.style.borderColor = "#1976d2";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(25, 118, 210, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </label>
            <label className="form-field-block">
              Presentación:
              <input
                name="presentacion"
                type="text"
                value={form.presentacion}
                onChange={handleChange}
                maxLength="100"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                placeholder="Ingrese la presentación"
                onFocus={(e) => {
                  e.target.style.borderColor = "#1976d2";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(25, 118, 210, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </label>
            <label className="form-field-block">
              Concentración:
              <input
                name="concentracion"
                type="text"
                value={form.concentracion}
                onChange={handleChange}
                maxLength="100"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                placeholder="Ingrese la concentración"
                onFocus={(e) => {
                  e.target.style.borderColor = "#1976d2";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(25, 118, 210, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </label>
            <label className="form-field-block">
              Laboratorio:
              <input
                name="laboratorio"
                type="text"
                value={form.laboratorio}
                onChange={handleChange}
                maxLength="100"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                placeholder="Ingrese el laboratorio"
                onFocus={(e) => {
                  e.target.style.borderColor = "#1976d2";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(25, 118, 210, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </label>
            <label className="form-field-block">
              Precio: *
              <input
                name="precio"
                type="number"
                step="0.01"
                value={form.precio}
                onChange={handleChange}
                required
                min={0}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                placeholder="0.00"
                onFocus={(e) => {
                  e.target.style.borderColor = "#1976d2";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(25, 118, 210, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </label>
            <label className="form-field-block">
              Stock: *
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                required
                min={0}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                placeholder="0"
                onFocus={(e) => {
                  e.target.style.borderColor = "#1976d2";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(25, 118, 210, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </label>
            <label className="form-field-block">
              Stock Mínimo: *
              <input
                name="stockMinimo"
                type="number"
                value={form.stockMinimo}
                onChange={handleChange}
                required
                min={0}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                placeholder="0"
                onFocus={(e) => {
                  e.target.style.borderColor = "#1976d2";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(25, 118, 210, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </label>
            <label className="form-field-block">
              Fecha Caducidad:
              <input
                name="fechaCaducidad"
                type="date"
                value={form.fechaCaducidad}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#1976d2";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(25, 118, 210, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </label>
            <label className="form-field-block">
              Código Barras:
              <input
                name="codigoBarras"
                type="text"
                value={form.codigoBarras}
                onChange={handleChange}
                maxLength="100"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                placeholder="Ingrese el código de barras"
                onFocus={(e) => {
                  e.target.style.borderColor = "#1976d2";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(25, 118, 210, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </label>
            <label
              className="form-field-block"
              style={{ gridColumn: "1 / -1" }}
            >
              Descripción:
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                maxLength="200"
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                placeholder="Ingrese la descripción"
                onFocus={(e) => {
                  e.target.style.borderColor = "#1976d2";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(25, 118, 210, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </label>
            <label className="form-field-block">
              Categoría:
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  backgroundColor: "#fff",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#1976d2";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(25, 118, 210, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field-block">
              Estado:
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  backgroundColor: "#fff",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#1976d2";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(25, 118, 210, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              >
                {estados.map((est) => (
                  <option key={est} value={est}>
                    {est}
                  </option>
                ))}
              </select>
            </label>
            <label
              className="form-field-block"
              style={{ gridColumn: "1 / -1" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <input
                  name="requiereReceta"
                  type="checkbox"
                  checked={form.requiereReceta}
                  onChange={handleChange}
                  style={{
                    width: "18px",
                    height: "18px",
                    accentColor: "#1976d2",
                  }}
                />
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Requiere Receta
                </span>
              </div>
            </label>
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
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
            <button
              type="button"
              onClick={() => setOpenEdit(false)}
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
        </form>
      </Modal>

      {/* Modal para detalles */}
      <Modal
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        title="Detalles del Medicamento"
      >
        {selected ? (
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
            <div>
              <h3
                style={{
                  color: "#1976d2",
                  marginBottom: "16px",
                  borderBottom: "2px solid #e3f2fd",
                  paddingBottom: "8px",
                }}
              >
                Información Básica
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <strong style={{ color: "#555", fontSize: "14px" }}>
                    ID:
                  </strong>
                  <span style={{ marginLeft: "8px", fontSize: "15px" }}>
                    {selected.id}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "#555", fontSize: "14px" }}>
                    Nombre:
                  </strong>
                  <span style={{ marginLeft: "8px", fontSize: "15px" }}>
                    {selected.nombre}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "#555", fontSize: "14px" }}>
                    Principio Activo:
                  </strong>
                  <span style={{ marginLeft: "8px", fontSize: "15px" }}>
                    {selected.principioActivo || "-"}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "#555", fontSize: "14px" }}>
                    Presentación:
                  </strong>
                  <span style={{ marginLeft: "8px", fontSize: "15px" }}>
                    {selected.presentacion || "-"}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "#555", fontSize: "14px" }}>
                    Concentración:
                  </strong>
                  <span style={{ marginLeft: "8px", fontSize: "15px" }}>
                    {selected.concentracion || "-"}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "#555", fontSize: "14px" }}>
                    Laboratorio:
                  </strong>
                  <span style={{ marginLeft: "8px", fontSize: "15px" }}>
                    {selected.laboratorio || "-"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3
                style={{
                  color: "#1976d2",
                  marginBottom: "16px",
                  borderBottom: "2px solid #e3f2fd",
                  paddingBottom: "8px",
                }}
              >
                Información Comercial
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <strong style={{ color: "#555", fontSize: "14px" }}>
                    Precio:
                  </strong>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "15px",
                      fontWeight: "bold",
                      color: "#2e7d32",
                    }}
                  >
                    ${selected.precio || "0.00"}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "#555", fontSize: "14px" }}>
                    Stock Actual:
                  </strong>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "15px",
                      fontWeight: "bold",
                      color:
                        (selected.stock || 0) <= (selected.stockMinimo || 0)
                          ? "#d32f2f"
                          : "#2e7d32",
                    }}
                  >
                    {selected.stock || "0"}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "#555", fontSize: "14px" }}>
                    Stock Mínimo:
                  </strong>
                  <span style={{ marginLeft: "8px", fontSize: "15px" }}>
                    {selected.stockMinimo || "0"}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "#555", fontSize: "14px" }}>
                    Código Barras:
                  </strong>
                  <span style={{ marginLeft: "8px", fontSize: "15px" }}>
                    {selected.codigoBarras || "-"}
                  </span>
                </div>
                <div>
                  <strong style={{ color: "#555", fontSize: "14px" }}>
                    Categoría:
                  </strong>
                  <span style={{ marginLeft: "8px", fontSize: "15px" }}>
                    {selected.categoria || "-"}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <h3
                style={{
                  color: "#1976d2",
                  marginBottom: "16px",
                  borderBottom: "2px solid #e3f2fd",
                  paddingBottom: "8px",
                }}
              >
                Información Adicional
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <strong style={{ color: "#555", fontSize: "14px" }}>
                    Descripción:
                  </strong>
                  <p
                    style={{
                      marginLeft: "8px",
                      fontSize: "15px",
                      marginTop: "4px",
                      padding: "12px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "6px",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    {selected.descripcion || "Sin descripción disponible"}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  <div>
                    <strong style={{ color: "#555", fontSize: "14px" }}>
                      Fecha Caducidad:
                    </strong>
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "15px",
                        color: selected.fechaCaducidad
                          ? new Date(selected.fechaCaducidad) < new Date()
                            ? "#d32f2f"
                            : "#2e7d32"
                          : "#666",
                      }}
                    >
                      {selected.fechaCaducidad
                        ? selected.fechaCaducidad.slice(0, 10)
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <strong style={{ color: "#555", fontSize: "14px" }}>
                      Estado:
                    </strong>
                    <span
                      style={{
                        marginLeft: "8px",
                        padding: "4px 12px",
                        borderRadius: "16px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        background:
                          selected.estado === "ACTIVO"
                            ? "#e8f5e8"
                            : selected.estado === "INACTIVO"
                            ? "#fff3e0"
                            : "#ffebee",
                        color:
                          selected.estado === "ACTIVO"
                            ? "#2e7d32"
                            : selected.estado === "INACTIVO"
                            ? "#f57c00"
                            : "#d32f2f",
                      }}
                    >
                      {selected.estado || "-"}
                    </span>
                  </div>
                  <div>
                    <strong style={{ color: "#555", fontSize: "14px" }}>
                      Requiere Receta:
                    </strong>
                    <span
                      style={{
                        marginLeft: "8px",
                        padding: "4px 12px",
                        borderRadius: "16px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        background: selected.requiereReceta
                          ? "#ffebee"
                          : "#e8f5e8",
                        color: selected.requiereReceta ? "#d32f2f" : "#2e7d32",
                      }}
                    >
                      {selected.requiereReceta ? "Sí" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>No se seleccionó ningún medicamento para mostrar detalles.</p>
        )}
      </Modal>
    </div>
  );
}

export default MedicamentosPage;
