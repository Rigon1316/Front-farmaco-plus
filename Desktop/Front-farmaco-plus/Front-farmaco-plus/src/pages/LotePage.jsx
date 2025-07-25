import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import Modal from "../components/Modal";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaBoxes,
} from "react-icons/fa";
import "./MedicamentosPage.css";

const API_URL = "http://localhost:8080/api/lotes";

const initialForm = {
  codigo: "",
  descripcion: "",
  fechaVencimiento: "",
  cantidad: "",
  contacto: "",
  direccion: "",
  email: "",
  estado: "",
  nombre: "",
  ruc: "",
};

function LotePage() {
  const [lotes, setLotes] = useState([]);
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

  // 1. Estado para medicamentos
  const [medicamentos, setMedicamentos] = useState([]);

  // 2. Obtener medicamentos al abrir el modal de agregar
  useEffect(() => {
    if (openAdd) {
      fetch("http://localhost:8080/api/medicamentos")
        .then((res) => res.json())
        .then((data) => setMedicamentos(data || []));
    }
  }, [openAdd]);

  // 3. Nuevo initialForm para agregar lote
  const initialAddForm = {
    numeroLote: "",
    fechaEntrada: "",
    fechaCaducidad: "",
    cantidad: "",
    estado: "ACTIVO",
    medicamentoId: "",
  };

  // 4. Cambiar el estado form y setForm para agregar lote
  const [addForm, setAddForm] = useState(initialAddForm);
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm({ ...addForm, [name]: value });
  };

  useEffect(() => {
    fetchLotes();
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

  const fetchLotes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      setLotes(data);
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

  // 5. handleAdd ajustado para enviar el JSON correcto
  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = {
        numeroLote: addForm.numeroLote,
        fechaEntrada: addForm.fechaEntrada,
        fechaCaducidad: addForm.fechaCaducidad,
        cantidad: Number(addForm.cantidad),
        estado: addForm.estado,
        medicamento: { id: Number(addForm.medicamentoId) },
      };
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      setSuccess("Lote agregado exitosamente");
      setOpenAdd(false);
      setAddForm(initialAddForm);
      fetchLotes();
    } catch (err) {
      setError(err.message || "No se pudo agregar el lote");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (lote) => {
    setSelected(lote);
    setForm({
      codigo: lote.codigo || "",
      descripcion: lote.descripcion || "",
      fechaVencimiento: lote.fechaVencimiento
        ? lote.fechaVencimiento.slice(0, 10)
        : "",
      cantidad: lote.cantidad || "",
      contacto: lote.contacto || "",
      direccion: lote.direccion || "",
      email: lote.email || "",
      estado: lote.estado || "",
      nombre: lote.nombre || "",
      ruc: lote.ruc || "",
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
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      setSuccess("Lote actualizado exitosamente");
      setOpenEdit(false);
      setForm(initialForm);
      fetchLotes();
    } catch (err) {
      setError(err.message || "No se pudo actualizar el lote");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      setSuccess("Lote eliminado exitosamente");
      fetchLotes();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el lote");
    } finally {
      setLoading(false);
    }
  };

  // Paginación
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLotes = lotes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(lotes.length / itemsPerPage);

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
        <FaBoxes /> Gestión de Lotes
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
          onClick={() => setOpenAdd(true)}
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
          Agregar Lote
        </Button>
        {/* Botón Editar eliminado */}
        <Button
          disabled={selectedRow === null}
          color="danger"
          onClick={() => {
            if (selectedRow !== null) {
              const lote = currentLotes[selectedRow];
              handleDelete(lote.id);
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
                N° Lote
              </th>
              <th style={{ padding: "16px 12px", textAlign: "left" }}>
                Cantidad
              </th>
              <th style={{ padding: "16px 12px", textAlign: "left" }}>
                Estado
              </th>
              <th
                style={{
                  borderTopRightRadius: 20,
                  padding: "16px 12px",
                  textAlign: "left",
                }}
              >
                Fecha Creación
              </th>
            </tr>
          </thead>
          <tbody>
            {currentLotes.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 32 }}>
                  No hay lotes registrados.
                </td>
              </tr>
            ) : (
              currentLotes.map((lote, idx) => {
                const isSelected = selectedRow === idx;
                return (
                  <tr
                    key={lote.id}
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
                      {lote.numeroLote || "-"}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        border: "none",
                        textAlign: "left",
                      }}
                    >
                      {lote.cantidad}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        border: "none",
                        textAlign: "left",
                      }}
                    >
                      {lote.estado || "-"}
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        border: "none",
                        textAlign: "left",
                      }}
                    >
                      {lote.fechaCreacion || "-"}
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
        onClose={() => setOpenAdd(false)}
        title="Agregar Lote"
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
          <div style={{ display: "flex", gap: 18 }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label style={{ fontWeight: 600, color: "#1976d2" }}>
                N° Lote
              </label>
              <input
                name="numeroLote"
                value={addForm.numeroLote}
                onChange={handleAddChange}
                required
                style={{
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #bdbdbd",
                  fontSize: 16,
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label style={{ fontWeight: 600, color: "#1976d2" }}>
                Fecha de Entrada
              </label>
              <input
                type="date"
                name="fechaEntrada"
                value={addForm.fechaEntrada}
                onChange={handleAddChange}
                required
                style={{
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #bdbdbd",
                  fontSize: 16,
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label style={{ fontWeight: 600, color: "#1976d2" }}>
                Fecha de Caducidad
              </label>
              <input
                type="date"
                name="fechaCaducidad"
                value={addForm.fechaCaducidad}
                onChange={handleAddChange}
                required
                style={{
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #bdbdbd",
                  fontSize: 16,
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label style={{ fontWeight: 600, color: "#1976d2" }}>
                Cantidad
              </label>
              <input
                type="number"
                name="cantidad"
                value={addForm.cantidad}
                onChange={handleAddChange}
                required
                style={{
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #bdbdbd",
                  fontSize: 16,
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label style={{ fontWeight: 600, color: "#1976d2" }}>
                Estado
              </label>
              <input
                name="estado"
                value={addForm.estado}
                onChange={handleAddChange}
                required
                style={{
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #bdbdbd",
                  fontSize: 16,
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label style={{ fontWeight: 600, color: "#1976d2" }}>
                Medicamento
              </label>
              <select
                name="medicamentoId"
                value={addForm.medicamentoId}
                onChange={handleAddChange}
                required
                style={{
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #bdbdbd",
                  fontSize: 16,
                }}
              >
                <option value="">Seleccione un medicamento</option>
                {medicamentos.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
        onClose={() => setOpenEdit(false)}
        title={
          <div
            style={{
              textAlign: "center",
              fontWeight: 800,
              fontSize: 26,
              color: "#1976d2",
              letterSpacing: 1,
            }}
          >
            Editar Lote
          </div>
        }
      >
        <form
          onSubmit={handleEdit}
          className="modal-form"
          style={{
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 8px 32px rgba(25, 118, 210, 0.13)",
            padding: 36,
            minWidth: 600,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            border: "1.5px solid #e3e3e3",
          }}
        >
          <div style={{ display: "flex", gap: 32 }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {[
                // Primera columna
                { label: "N° Lote", name: "numeroLote", type: "text" },
                {
                  label: "Fecha de Entrada",
                  name: "fechaEntrada",
                  type: "date",
                },
                {
                  label: "Fecha de Caducidad",
                  name: "fechaCaducidad",
                  type: "date",
                },
              ].map((field) => (
                <div
                  key={field.name}
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <label
                    style={{
                      fontWeight: 600,
                      color: "#1976d2",
                      fontSize: 14,
                      marginBottom: 2,
                      letterSpacing: 0.5,
                    }}
                  >
                    {field.label}
                  </label>
                  <input
                    name={field.name}
                    type={field.type}
                    value={form[field.name] || ""}
                    onChange={handleChange}
                    required
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "1.5px solid #bdbdbd",
                      fontSize: 16,
                      background: "#f9fbfd",
                      outline: "none",
                      transition: "border 0.2s, box-shadow 0.2s",
                      boxShadow: "0 1px 6px rgba(25,118,210,0.06)",
                      marginTop: 2,
                    }}
                    onFocus={(e) =>
                      (e.target.style.border = "1.5px solid #1976d2")
                    }
                    onBlur={(e) =>
                      (e.target.style.border = "1.5px solid #bdbdbd")
                    }
                  />
                </div>
              ))}
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {[
                // Segunda columna
                { label: "Cantidad", name: "cantidad", type: "number" },
                { label: "Estado", name: "estado", type: "text" },
                {
                  label: "Fecha de Creación",
                  name: "fechaCreacion",
                  type: "date",
                },
                {
                  label: "Fecha de Actualización",
                  name: "fechaActualizacion",
                  type: "date",
                },
              ].map((field) => (
                <div
                  key={field.name}
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <label
                    style={{
                      fontWeight: 600,
                      color: "#1976d2",
                      fontSize: 14,
                      marginBottom: 2,
                      letterSpacing: 0.5,
                    }}
                  >
                    {field.label}
                  </label>
                  <input
                    name={field.name}
                    type={field.type}
                    value={form[field.name] || ""}
                    onChange={handleChange}
                    required
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "1.5px solid #bdbdbd",
                      fontSize: 16,
                      background: "#f9fbfd",
                      outline: "none",
                      transition: "border 0.2s, box-shadow 0.2s",
                      boxShadow: "0 1px 6px rgba(25,118,210,0.06)",
                      marginTop: 2,
                    }}
                    onFocus={(e) =>
                      (e.target.style.border = "1.5px solid #1976d2")
                    }
                    onBlur={(e) =>
                      (e.target.style.border = "1.5px solid #bdbdbd")
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 18,
              justifyContent: "center",
            }}
          >
            <Button
              onClick={() => setOpenEdit(false)}
              type="button"
              style={{
                fontWeight: 700,
                fontSize: 18,
                padding: "14px 0",
                borderRadius: 12,
                width: "48%",
                background: "linear-gradient(90deg, #ff6b6b 60%, #ffa07a 100%)",
                color: "#fff",
                border: "none",
                boxShadow: "0 2px 8px rgba(255,107,107,0.10)",
                letterSpacing: 1,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) =>
                (e.target.style.background =
                  "linear-gradient(90deg, #d32f2f 60%, #ff6b6b 100%)")
              }
              onMouseOut={(e) =>
                (e.target.style.background =
                  "linear-gradient(90deg, #ff6b6b 60%, #ffa07a 100%)")
              }
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default LotePage;
