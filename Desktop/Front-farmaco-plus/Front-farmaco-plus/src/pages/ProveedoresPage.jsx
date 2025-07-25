import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { authenticatedFetch } from "../utils/authUtils.js";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaTruck,
} from "react-icons/fa";
import "./MedicamentosPage.css";

const API_URL = "http://localhost:8080/api/proveedores";

const initialForm = {
  nombre: "",
  contacto: "",
  direccion: "",
  estado: "ACTIVO",
};

function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    fetchProveedores();
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

  const fetchProveedores = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authenticatedFetch(API_URL);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      setProveedores(data);

      // Si no hay datos y es un token mock, mostrar mensaje informativo
      if (
        data.length === 0 &&
        localStorage.getItem("jwtToken")?.startsWith("mock-jwt-token-")
      ) {
        setError(
          "⚠️ Modo demo activo - Los datos se cargarán cuando el backend esté disponible"
        );
      }
    } catch (err) {
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authenticatedFetch(API_URL, {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      setSuccess("Proveedor agregado exitosamente");
      setOpenAdd(false);
      setForm(initialForm);
      setSelected(null);
      fetchProveedores();
    } catch (err) {
      setError(err.message || "No se pudo agregar el proveedor");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (proveedor) => {
    setSelected(proveedor);
    setForm({
      nombre: proveedor.nombre || "",
      contacto: proveedor.contacto || "",
      direccion: proveedor.direccion || "",
      estado: proveedor.estado || "ACTIVO",
    });
    setOpenEdit(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      const res = await authenticatedFetch(`${API_URL}/${selected.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      // Actualizar el proveedor en el array local en lugar de recargar todos
      const updatedProveedor = await res.json();
      const proveedorActualizado = updatedProveedor || {
        ...selected,
        ...form,
        id: selected.id,
      };
      setProveedores((prevProveedores) =>
        prevProveedores.map((prov) =>
          prov.id === selected.id ? proveedorActualizado : prov
        )
      );
      setSuccess("Proveedor actualizado exitosamente");
      setOpenEdit(false);
      setForm(initialForm);
      setSelected(null);
      setSelectedRow(null);
    } catch (err) {
      setError(err.message || "No se pudo actualizar el proveedor");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError("");
    try {
      const res = await authenticatedFetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      setSuccess("Proveedor eliminado exitosamente");
      fetchProveedores();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el proveedor");
    } finally {
      setLoading(false);
    }
  };

  // Paginación
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProveedores = proveedores.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(proveedores.length / itemsPerPage);

  return (
    <div className="main-container">
      <h1
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "#1976d2",
        }}
      >
        <FaTruck /> Gestión de Proveedores
      </h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 24,
          marginLeft: 8,
        }}
      >
        <Button
          onClick={() => {
            setForm(initialForm);
            setOpenAdd(true);
          }}
          color="primary"
          style={{
            fontSize: 16,
            padding: "8px 24px",
            borderRadius: 12,
            fontWeight: 700,
            height: 38,
            minWidth: 140,
            boxShadow: "none",
          }}
        >
          Agregar Proveedor
        </Button>
        <Button
          disabled={selectedRow === null}
          color="secondary"
          onClick={() => {
            if (selectedRow !== null) {
              const proveedor = currentProveedores[selectedRow];
              openEditModal(proveedor);
            }
          }}
          style={{
            fontSize: 16,
            padding: "8px 18px",
            borderRadius: 12,
            fontWeight: 700,
            height: 38,
            minWidth: 90,
            background: selectedRow === null ? "#e0e0e0" : "#bdbdbd",
            color: "#222",
            cursor: selectedRow === null ? "not-allowed" : "pointer",
            border: "none",
            boxShadow: "none",
          }}
        >
          Editar
        </Button>
        <Button
          disabled={selectedRow === null}
          color="danger"
          onClick={() => {
            if (selectedRow !== null) {
              const proveedor = currentProveedores[selectedRow];
              handleDelete(proveedor.id);
            }
          }}
          style={{
            fontSize: 16,
            padding: "8px 18px",
            borderRadius: 12,
            fontWeight: 700,
            height: 38,
            minWidth: 90,
            background: selectedRow === null ? "#ef9a9a" : "#d32f2f",
            color: "#fff",
            cursor: selectedRow === null ? "not-allowed" : "pointer",
            border: "none",
            boxShadow: "none",
          }}
        >
          Eliminar
        </Button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <div
        style={{
          overflowX: "auto",
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: 0,
          marginTop: 8,
          border: "none",
        }}
      >
        <table
          className="styled-table"
          style={{
            borderRadius: 20,
            overflow: "hidden",
            width: "100%",
            tableLayout: "fixed",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontFamily: "Segoe UI",
            fontSize: 18,
          }}
        >
          <thead>
            <tr
              style={{
                background: "#1976d2",
                color: "#fff",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                fontWeight: 700,
              }}
            >
              <th
                style={{
                  borderTopLeftRadius: 20,
                  padding: "16px 12px",
                  textAlign: "left",
                }}
              >
                Nombre
              </th>
              <th style={{ padding: "16px 12px", textAlign: "left" }}>
                Contacto
              </th>
              <th style={{ padding: "16px 12px", textAlign: "left" }}>
                Dirección
              </th>
              <th style={{ padding: "16px 12px", textAlign: "left" }}>
                Fecha Creación
              </th>
              <th
                style={{
                  borderTopRightRadius: 20,
                  padding: "16px 12px",
                  textAlign: "left",
                }}
              >
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {currentProveedores.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 32 }}>
                  No hay proveedores registrados.
                </td>
              </tr>
            ) : (
              currentProveedores.map((proveedor, idx) => {
                const isSelected = selectedRow === idx;
                return (
                  <tr
                    key={proveedor.id}
                    style={{
                      background: isSelected ? "#b3e5fc" : undefined,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onClick={() => setSelectedRow(idx)}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "#e3f2fd";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "#fff";
                    }}
                  >
                    <td
                      style={{
                        padding: "14px 12px",
                        border: "none",
                        textAlign: "left",
                      }}
                    >
                      {proveedor.nombre || "-"}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        border: "none",
                        textAlign: "left",
                      }}
                    >
                      {proveedor.contacto || "-"}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        border: "none",
                        textAlign: "left",
                      }}
                    >
                      {proveedor.direccion || "-"}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        border: "none",
                        textAlign: "left",
                      }}
                    >
                      {proveedor.fechaCreacion
                        ? new Date(proveedor.fechaCreacion).toLocaleDateString(
                            "es-ES"
                          )
                        : "-"}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        border: "none",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: 12,
                          fontSize: 14,
                          fontWeight: 600,
                          background:
                            proveedor.estado === "ACTIVO"
                              ? "#e8f5e8"
                              : proveedor.estado === "INACTIVO"
                              ? "#ffeaea"
                              : "#fffbe6",
                          color:
                            proveedor.estado === "ACTIVO"
                              ? "#2e7d32"
                              : proveedor.estado === "INACTIVO"
                              ? "#d32f2f"
                              : "#bfa100",
                        }}
                      >
                        {proveedor.estado || "INACTIVO"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Paginación */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            style={{
              background: currentPage === i + 1 ? "#1976d2" : "transparent",
              color: currentPage === i + 1 ? "#fff" : "#1976d2",
              border: "none",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 22,
              width: 48,
              height: 48,
              cursor: "pointer",
              transition: "background 0.2s",
              outline: "none",
              boxShadow:
                currentPage === i + 1
                  ? "0 2px 8px rgba(25,118,210,0.10)"
                  : "none",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
      {/* Modal Agregar */}
      <Modal
        open={openAdd}
        onClose={() => {
          setOpenAdd(false);
          setForm(initialForm);
        }}
        title="Agregar Proveedor"
      >
        <form
          onSubmit={handleAdd}
          className="modal-form"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            minWidth: 340,
          }}
        >
          <label style={{ fontWeight: 600, color: "#1976d2" }}>Nombre</label>
          <input
            name="nombre"
            value={form.nombre || ""}
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #bdbdbd",
              fontSize: 16,
            }}
          />
          <label style={{ fontWeight: 600, color: "#1976d2" }}>Contacto</label>
          <input
            name="contacto"
            value={form.contacto || ""}
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #bdbdbd",
              fontSize: 16,
            }}
          />
          <label style={{ fontWeight: 600, color: "#1976d2" }}>Dirección</label>
          <input
            name="direccion"
            value={form.direccion || ""}
            onChange={handleChange}
            style={{
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #bdbdbd",
              fontSize: 16,
            }}
          />
          <label style={{ fontWeight: 600, color: "#1976d2" }}>Estado</label>
          <select
            name="estado"
            value={form.estado || "ACTIVO"}
            onChange={handleChange}
            style={{
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #bdbdbd",
              fontSize: 16,
            }}
          >
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
            <option value="SUSPENDIDO">Suspendido</option>
          </select>
          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 32,
              justifyContent: "space-between",
            }}
          >
            <Button
              type="submit"
              style={{
                fontWeight: 700,
                fontSize: 18,
                padding: "14px 0",
                borderRadius: 10,
                width: "48%",
                background: "#1976d2",
                color: "#fff",
                boxShadow: "0 2px 8px rgba(25,118,210,0.10)",
              }}
            >
              Agregar
            </Button>
            <Button
              onClick={() => setOpenAdd(false)}
              type="button"
              style={{
                fontWeight: 700,
                fontSize: 18,
                padding: "14px 0",
                borderRadius: 10,
                width: "48%",
                background: "#ff6b6b",
                color: "#fff",
                boxShadow: "0 2px 8px rgba(255,107,107,0.10)",
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
      {/* Modal Editar */}
      <Modal
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setForm(initialForm);
        }}
        title="Editar Proveedor"
      >
        <form
          onSubmit={handleEdit}
          className="modal-form"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            minWidth: 340,
          }}
        >
          <label style={{ fontWeight: 600, color: "#1976d2" }}>Nombre</label>
          <input
            name="nombre"
            value={form.nombre || ""}
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #bdbdbd",
              fontSize: 16,
            }}
          />
          <label style={{ fontWeight: 600, color: "#1976d2" }}>Contacto</label>
          <input
            name="contacto"
            value={form.contacto || ""}
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #bdbdbd",
              fontSize: 16,
            }}
          />
          <label style={{ fontWeight: 600, color: "#1976d2" }}>Dirección</label>
          <input
            name="direccion"
            value={form.direccion || ""}
            onChange={handleChange}
            style={{
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #bdbdbd",
              fontSize: 16,
            }}
          />
          <label style={{ fontWeight: 600, color: "#1976d2" }}>Estado</label>
          <select
            name="estado"
            value={form.estado || "ACTIVO"}
            onChange={handleChange}
            style={{
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #bdbdbd",
              fontSize: 16,
            }}
          >
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
            <option value="SUSPENDIDO">Suspendido</option>
          </select>
          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 32,
              justifyContent: "space-between",
            }}
          >
            <Button
              type="submit"
              style={{
                fontWeight: 700,
                fontSize: 18,
                padding: "14px 0",
                borderRadius: 10,
                width: "48%",
                background: "#1976d2",
                color: "#fff",
                boxShadow: "0 2px 8px rgba(25,118,210,0.10)",
              }}
            >
              Actualizar
            </Button>
            <Button
              onClick={() => setOpenEdit(false)}
              type="button"
              style={{
                fontWeight: 700,
                fontSize: 18,
                padding: "14px 0",
                borderRadius: 10,
                width: "48%",
                background: "#ff6b6b",
                color: "#fff",
                boxShadow: "0 2px 8px rgba(255,107,107,0.10)",
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

export default ProveedoresPage;
