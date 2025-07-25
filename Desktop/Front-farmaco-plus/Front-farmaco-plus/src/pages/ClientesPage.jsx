import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import Modal from "../components/Modal";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import {
  formatDateForInput,
  formatDateForBackend,
  formatDateForDisplay,
} from "../utils/dateUtils";
import {
  validarCedulaEcuatoriana,
  validarCedulaConMensaje,
} from "../utils/cedulaUtils";
import "./MedicamentosPage.css";

const API_URL = "http://localhost:8080/api/clientes";
const estados = ["ACTIVO", "INACTIVO", "SUSPENDIDO"];

const initialForm = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  direccion: "",
  dni: "",
  fechaNacimiento: "",
  estado: estados[0],
};

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [busquedaNombre, setBusquedaNombre] = useState(""); // Nuevo estado para búsqueda por nombre
  const [cedulaError, setCedulaError] = useState(""); // Estado para error de validación de cédula
  const itemsPerPage = 10;

  useEffect(() => {
    fetchClientes();
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

  const fetchClientes = async () => {
    setLoading(true);
    setError("");
    console.log("🔍 Intentando cargar clientes desde:", API_URL);
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
      setClientes(data);
    } catch (err) {
      console.error("💥 Error completo:", err);
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Validación en tiempo real para cédula
    if (name === "dni") {
      setCedulaError(validarCedulaConMensaje(value));
    }
  };

  // Validaciones reforzadas en validateForm:
  const validateForm = () => {
    if (!form.nombre.trim()) return "El nombre es obligatorio";
    if (form.nombre.length > 100)
      return "El nombre no puede exceder 100 caracteres";
    if (!form.apellido.trim()) return "El apellido es obligatorio";
    if (form.apellido.length > 100)
      return "El apellido no puede exceder 100 caracteres";
    if (!form.email.trim()) return "El email es obligatorio";
    if (form.email.length > 150)
      return "El email no puede exceder 150 caracteres";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email))
      return "El formato del email no es válido";
    if (!form.telefono.trim()) return "El teléfono es obligatorio";
    if (!/^[0-9]{10}$/.test(form.telefono))
      return "El teléfono debe tener 10 dígitos";
    if (form.direccion && form.direccion.length > 200)
      return "La dirección no puede exceder 200 caracteres";
    if (!form.dni.trim()) return "La Cédula es obligatoria";
    if (!/^[0-9]{10}$/.test(form.dni)) return "La Cédula debe tener 10 dígitos";
    if (!validarCedulaEcuatoriana(form.dni)) return "La Cédula no es válida";
    if (!form.estado) return "El estado es obligatorio";
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
      const clienteData = {
        ...form,
        fechaNacimiento: formatDateForBackend(form.fechaNacimiento),
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clienteData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      setSuccess("Cliente agregado exitosamente");
      setOpenAdd(false);
      setForm(initialForm);
      fetchClientes();
    } catch (err) {
      console.error("Error adding cliente:", err);
      setError(err.message || "No se pudo agregar el cliente");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (cli) => {
    setSelected(cli);
    const formData = {
      nombre: cli.nombre || "",
      apellido: cli.apellido || "",
      email: cli.email || "",
      telefono: cli.telefono || "",
      direccion: cli.direccion || "",
      dni: cli.dni || "",
      fechaNacimiento: formatDateForInput(cli.fechaNacimiento),
      estado: cli.estado || estados[0],
    };
    setForm(formData);

    // Validar cédula al abrir el modal de editar
    if (formData.dni && formData.dni.length === 10) {
      if (!validarCedulaEcuatoriana(formData.dni)) {
        setCedulaError("La Cédula no es válida");
      } else {
        setCedulaError("");
      }
    } else {
      setCedulaError("");
    }

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
      const clienteData = {
        ...form,
        fechaNacimiento: formatDateForBackend(form.fechaNacimiento),
      };

      const res = await fetch(`${API_URL}/${selected.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clienteData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      // Actualizar el cliente en el array local en lugar de recargar todos los clientes
      const updatedCliente = await res.json();

      // Si el servidor no devuelve el cliente actualizado, creamos uno combinando los datos del formulario
      const clienteActualizado = updatedCliente || {
        ...selected,
        ...clienteData,
        id: selected.id,
      };

      // Actualizar el cliente en el array local manteniendo el mismo orden
      setClientes((prevClientes) =>
        prevClientes.map((cliente) =>
          cliente.id === selected.id ? clienteActualizado : cliente
        )
      );

      setSuccess("Cliente actualizado exitosamente");
      setOpenEdit(false);
      setSelected(null);
      setForm(initialForm);
      // No llamamos a fetchClientes() para mantener el orden
    } catch (err) {
      console.error("Error updating cliente:", err);
      setError(err.message || "No se pudo editar el cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cliente?")) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      setSuccess("Cliente eliminado exitosamente");
      setSelected(null);
      fetchClientes();
    } catch (err) {
      console.error("Error deleting cliente:", err);
      setError(err.message || "No se pudo eliminar el cliente");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setError("");
    setCedulaError("");
  };

  // Lógica de paginación
  const totalPages = Math.ceil(clientes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClientes = clientes.slice(startIndex, endIndex);

  const renderAcciones = (cli) => (
    <div style={{ display: "flex", gap: 8 }}>
      <Button
        icon={<FaEdit className="btn-icon-edit" />}
        className="custom-btn secondary"
        onClick={() => openEditModal(cli)}
        disabled={loading}
      >
        Editar
      </Button>
      <Button
        icon={<FaTrash className="btn-icon-delete" />}
        className="custom-btn danger"
        onClick={() => handleDelete(cli.id)}
        disabled={loading}
      >
        Eliminar
      </Button>
    </div>
  );

  // Nueva función para buscar cliente por nombre
  const buscarClientePorNombre = async (nombre) => {
    if (!nombre || nombre.trim() === "") {
      fetchClientes();
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_URL}/buscar?nombre=${encodeURIComponent(nombre)}`
      );
      if (!res.ok) {
        if (res.status === 404) {
          setError("No se encontró un cliente con ese nombre");
          setClientes([]);
        } else {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
      } else {
        const clientesEncontrados = await res.json();
        setClientes(
          Array.isArray(clientesEncontrados)
            ? clientesEncontrados
            : [clientesEncontrados]
        );
      }
    } catch (err) {
      console.error("Error buscando cliente por nombre:", err);
      setError("Error al buscar el cliente");
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la búsqueda por nombre
  const handleBusquedaNombre = (e) => {
    e.preventDefault();
    buscarClientePorNombre(busquedaNombre);
  };

  return (
    <div>
      <h2
        style={{
          marginBottom: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#43a047",
        }}
      >
        <FaUsers style={{ fontSize: 28, color: "#43a047" }} /> Gestión de
        Clientes
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
          Agregar Cliente
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

        {/* Campo de búsqueda por nombre */}
        <div className="search-container" style={{ marginLeft: "auto" }}>
          <label
            htmlFor="busqueda-nombre"
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "#444",
              marginRight: "8px",
            }}
          >
            Buscar por Nombre:
          </label>
          <form
            onSubmit={handleBusquedaNombre}
            style={{ display: "flex", alignItems: "center" }}
          >
            <input
              id="busqueda-nombre"
              type="text"
              value={busquedaNombre}
              onChange={(e) => setBusquedaNombre(e.target.value)}
              placeholder="Ingrese nombre"
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

      {/* Tabla de clientes */}
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
                Apellido
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
                Email
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
                Teléfono
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
                Dirección
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
                Cédula
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
                Fecha Nacimiento
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
            </tr>
          </thead>
          <tbody>
            {paginatedClientes.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{ textAlign: "center", color: "#888", padding: 32 }}
                >
                  No hay clientes registrados.
                </td>
              </tr>
            ) : (
              paginatedClientes.map((cli, idx) => (
                <tr
                  key={cli.id}
                  onClick={() => setSelected(cli)}
                  style={{
                    background:
                      selected && selected.id === cli.id
                        ? "#b3e5fc"
                        : idx % 2 === 0
                        ? "#fafbfc"
                        : "#fff",
                    transition: "background 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      selected && selected.id === cli.id
                        ? "#b3e5fc"
                        : "#e3f2fd")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      selected && selected.id === cli.id
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
                    {cli.nombre}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {cli.apellido}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {cli.email}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {cli.telefono}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {cli.direccion}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {cli.dni}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {cli.fechaNacimiento
                      ? cli.fechaNacimiento.slice(0, 10)
                      : "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {cli.estado}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Controles de paginación */}
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
        onClose={() => {
          setOpenAdd(false);
          resetForm();
        }}
        title="Agregar Cliente"
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
              Apellido: *
              <input
                name="apellido"
                type="text"
                value={form.apellido}
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
                placeholder="Ingrese el apellido"
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
              Email: *
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength="150"
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
                placeholder="ejemplo@email.com"
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
              Teléfono: *
              <input
                name="telefono"
                type="text"
                value={form.telefono}
                onChange={handleChange}
                required
                pattern="^[0-9]{10}$"
                maxLength="10"
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
                placeholder="1234567890"
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
              Dirección:
              <input
                name="direccion"
                type="text"
                value={form.direccion}
                onChange={handleChange}
                maxLength="200"
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
                placeholder="Ingrese la dirección"
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
              Cédula: *
              <input
                name="dni"
                type="text"
                value={form.dni}
                onChange={handleChange}
                required
                pattern="^[0-9]{10}$"
                maxLength="10"
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: cedulaError ? "1px solid #d32f2f" : "1px solid #ddd",
                  backgroundColor: cedulaError ? "#ffebee" : "#fff",
                }}
                placeholder="1234567890"
              />
              {cedulaError && (
                <span
                  style={{
                    color: "#d32f2f",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <FaTimes style={{ fontSize: "10px" }} />
                  {cedulaError}
                </span>
              )}
              {form.dni.length === 10 && !cedulaError && (
                <span
                  style={{
                    color: "#2e7d32",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <FaCheck style={{ fontSize: "10px" }} />
                  Cédula válida
                </span>
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
              Fecha Nacimiento:
              <input
                name="fechaNacimiento"
                type="date"
                value={form.fechaNacimiento}
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
              Estado: *
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
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              type="button"
              className="secondary"
              onClick={() => {
                setOpenAdd(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
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
        title="Editar Cliente"
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
              Apellido: *
              <input
                name="apellido"
                type="text"
                value={form.apellido}
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
                placeholder="Ingrese el apellido"
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
              Email: *
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength="150"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                placeholder="ejemplo@email.com"
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
              Teléfono: *
              <input
                name="telefono"
                type="text"
                value={form.telefono}
                onChange={handleChange}
                required
                pattern="^[0-9]{10}$"
                maxLength="10"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                placeholder="1234567890"
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
              Dirección:
              <input
                name="direccion"
                type="text"
                value={form.direccion}
                onChange={handleChange}
                maxLength="200"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0",
                  fontSize: "14px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                placeholder="Ingrese la dirección"
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
              Cédula: *
              <input
                name="dni"
                type="text"
                value={form.dni}
                onChange={handleChange}
                required
                pattern="^[0-9]{10}$"
                maxLength="10"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: cedulaError
                    ? "2px solid #d32f2f"
                    : "2px solid #e0e0e0",
                  fontSize: "14px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  backgroundColor: cedulaError ? "#ffebee" : "#fff",
                }}
                placeholder="1234567890"
                onFocus={(e) => {
                  e.target.style.borderColor = cedulaError
                    ? "#d32f2f"
                    : "#1976d2";
                  e.target.style.boxShadow = cedulaError
                    ? "0 0 0 3px rgba(211, 47, 47, 0.1)"
                    : "0 0 0 3px rgba(25, 118, 210, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = cedulaError
                    ? "#d32f2f"
                    : "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              />
              {cedulaError && (
                <span
                  style={{
                    color: "#d32f2f",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <FaTimes style={{ fontSize: "10px" }} />
                  {cedulaError}
                </span>
              )}
              {form.dni.length === 10 && !cedulaError && (
                <span
                  style={{
                    color: "#2e7d32",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <FaCheck style={{ fontSize: "10px" }} />
                  Cédula válida
                </span>
              )}
            </label>
            <label className="form-field-block">
              Fecha Nacimiento:
              <input
                name="fechaNacimiento"
                type="date"
                value={form.fechaNacimiento}
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
              Estado: *
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
              onClick={() => {
                setOpenEdit(false);
                setSelected(null);
                resetForm();
              }}
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
    </div>
  );
}

export default ClientesPage;
