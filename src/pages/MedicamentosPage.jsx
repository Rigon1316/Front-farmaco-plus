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
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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

  return (
    <div>
      <h2
        style={{
          marginBottom: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#8e24aa",
        }}
      >
        <FaPills style={{ fontSize: 28, color: "#8e24aa" }} /> Gestión de
        Medicamentos
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
        title="Agregar Medicamento"
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
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              type="button"
              className="secondary"
              onClick={() => setOpenAdd(false)}
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
        title="Editar Medicamento"
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
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <Button type="submit" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </Button>
            <Button
              type="button"
              className="secondary"
              onClick={() => setOpenEdit(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MedicamentosPage;
