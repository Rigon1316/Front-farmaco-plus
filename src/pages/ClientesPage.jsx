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
    if (!form.dni.trim()) return "El DNI es obligatorio";
    if (!/^[0-9]{8}$/.test(form.dni)) return "El DNI debe tener 8 dígitos";
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
    setForm({
      nombre: cli.nombre || "",
      apellido: cli.apellido || "",
      email: cli.email || "",
      telefono: cli.telefono || "",
      direccion: cli.direccion || "",
      dni: cli.dni || "",
      fechaNacimiento: formatDateForInput(cli.fechaNacimiento),
      estado: cli.estado || estados[0],
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

      setSuccess("Cliente actualizado exitosamente");
      setOpenEdit(false);
      setSelected(null);
      setForm(initialForm);
      fetchClientes();
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
              {/* Aquí van los <th> originales, solo cambia el style */}
              {[
                "ID",
                "Nombre",
                "Apellido",
                "Email",
                "Teléfono",
                "Dirección",
                "DNI",
                "Fecha Nacimiento",
                "Estado",
              ].map((col, i) => (
                <th
                  key={col}
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
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedClientes.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
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
                    {cli.id}
                  </td>
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
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            margin: "18px 0 0 0",
          }}
        >
          <Button
            className="secondary"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ minWidth: 40 }}
          >
            Anterior
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              className={currentPage === i + 1 ? "custom-btn" : "secondary"}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                minWidth: 36,
                fontWeight: currentPage === i + 1 ? 700 : 500,
              }}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            className="secondary"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{ minWidth: 40 }}
          >
            Siguiente
          </Button>
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
              gap: "24px 16px",
              maxHeight: "70vh",
              overflowY: "auto",
              padding: "8px",
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
              DNI: *
              <input
                name="dni"
                type="text"
                value={form.dni}
                onChange={handleChange}
                required
                pattern="^[0-9]{8}$"
                maxLength="8"
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
                placeholder="12345678"
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
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px 16px",
              maxHeight: "70vh",
              overflowY: "auto",
              padding: "8px",
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
              DNI: *
              <input
                name="dni"
                type="text"
                value={form.dni}
                onChange={handleChange}
                required
                pattern="^[0-9]{8}$"
                maxLength="8"
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "4px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
                placeholder="12345678"
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
              {loading ? "Actualizando..." : "Actualizar"}
            </Button>
            <Button
              type="button"
              className="secondary"
              onClick={() => {
                setOpenEdit(false);
                setSelected(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ClientesPage;
