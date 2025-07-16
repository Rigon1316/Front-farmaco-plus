import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaRobot,
  FaUserCircle,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPills,
  FaUsers,
  FaShoppingCart,
  FaExclamationTriangle,
  FaChevronDown,
  FaCog,
} from "react-icons/fa";
import { useModalDetection } from "../utils/useModalDetection";

export default function Header() {
  const [hora, setHora] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const location = useLocation();
  const isAnyModalOpen = useModalDetection();

  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = new Date();
      setHora(
        ahora.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar el dropdown si se abre un modal
  useEffect(() => {
    if (isAnyModalOpen) {
      setShowDropdown(false);
    }
  }, [isAnyModalOpen]);

  // Verificar si estamos en una página de gestión
  const isManagementPage = [
    "/medicamentos",
    "/clientes",
    "/venta",
    "/alertas",
  ].includes(location.pathname);

  const managementPages = [
    {
      href: "/medicamentos",
      icon: <FaPills style={{ marginRight: 8 }} />,
      label: "Medicamentos",
    },
    {
      href: "/clientes",
      icon: <FaUsers style={{ marginRight: 8 }} />,
      label: "Clientes",
    },
    {
      href: "/venta",
      icon: <FaShoppingCart style={{ marginRight: 8 }} />,
      label: "Ventas",
    },
    {
      href: "/alertas",
      icon: <FaExclamationTriangle style={{ marginRight: 8 }} />,
      label: "Alertas",
    },
  ];

  // Función para calcular la posición del dropdown
  const calculateDropdownPosition = (event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left,
    });
  };

  return (
    <header
      style={{
        background: "#4882e7",
        color: "#fff",
        padding: "0 0 0 0",
        borderBottom: "2px solid #333",
        minHeight: "80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        width: "100vw",
        maxWidth: "100vw",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "100vw",
          boxSizing: "border-box",
          padding: "0.5rem 2rem 0.5rem 2rem",
          overflowX: "hidden",
        }}
      >
        {/* Menú */}
        <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          {[
            {
              href: "/",
              icon: <FaHome style={{ marginRight: 8 }} />,
              label: "Inicio",
            },
            {
              href: "/consultas-ia",
              icon: <FaRobot style={{ marginRight: 8 }} />,
              label: "Consultas de IA",
            },
          ].map((item, idx) => (
            <Link
              key={item.label}
              to={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 20,
                position: "relative",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ffb300";
                e.currentTarget.style.textShadow = "0 2px 8px rgba(0,0,0,0.10)";
                e.currentTarget.style.setProperty("--underline-width", "100%");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.textShadow = "none";
                e.currentTarget.style.setProperty("--underline-width", "0");
              }}
            >
              {item.icon} {item.label}
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: -2,
                  width: "var(--underline-width, 0)",
                  height: 3,
                  background: "#ffb300",
                  borderRadius: 2,
                  transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              />
            </Link>
          ))}

          {/* Menú desplegable para páginas de gestión */}
          {isManagementPage && (
            <div
              style={{ position: "relative", zIndex: 9999 }}
              className="dropdown-container"
              onMouseEnter={(e) => {
                if (!isAnyModalOpen) {
                  calculateDropdownPosition(e);
                  setShowDropdown(true);
                }
              }}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <Link
                to="#"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: isAnyModalOpen ? "#ccc" : "#fff",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 20,
                  position: "relative",
                  transition: "color 0.2s",
                  cursor: isAnyModalOpen ? "not-allowed" : "pointer",
                  opacity: isAnyModalOpen ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isAnyModalOpen) {
                    e.currentTarget.style.color = "#ffb300";
                    e.currentTarget.style.textShadow =
                      "0 2px 8px rgba(0,0,0,0.10)";
                    e.currentTarget.style.setProperty(
                      "--underline-width",
                      "100%"
                    );
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isAnyModalOpen
                    ? "#ccc"
                    : "#fff";
                  e.currentTarget.style.textShadow = "none";
                  e.currentTarget.style.setProperty("--underline-width", "0");
                }}
                onClick={(e) => {
                  e.preventDefault();
                  if (isAnyModalOpen) {
                    return;
                  }
                }}
              >
                <FaCog style={{ marginRight: 8 }} /> Gestión
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: -2,
                    width: "var(--underline-width, 0)",
                    height: 3,
                    background: "#ffb300",
                    borderRadius: 2,
                    transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
                    zIndex: 1,
                    pointerEvents: "none",
                  }}
                />
              </Link>

              {showDropdown && !isAnyModalOpen && (
                <div
                  style={{
                    position: "fixed",
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`,
                    background: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    minWidth: "200px",
                    zIndex: 99999,
                    border: "1px solid #e0e0e0",
                    overflow: "hidden",
                  }}
                >
                  {managementPages.map((page, index) => (
                    <div key={page.label}>
                      <Link
                        to={page.href}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "12px 16px",
                          color: "#333",
                          textDecoration: "none",
                          fontSize: "16px",
                          fontWeight: 500,
                          transition: "background 0.2s",
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f5f5f5";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fff";
                        }}
                      >
                        {page.icon} {page.label}
                      </Link>
                      {index < managementPages.length - 1 && (
                        <div
                          style={{
                            height: "1px",
                            background: "#f0f0f0",
                            margin: "0 16px",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>
        {/* Título y eslogan */}
        <div style={{ textAlign: "right", flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: 1 }}>
            Farmacia <span style={{ color: "#ffb300" }}>Farmaco Plus</span>
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 400,
              color: "#e3e3e3",
              marginTop: 2,
            }}
          >
            ¡Cuidando tu salud, innovando cada día!
          </div>
        </div>
        {/* Reloj y usuario */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            minWidth: 120,
            maxWidth: "100%",
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "#fff",
              marginBottom: 4,
            }}
          >
            {hora}
          </span>
          <FaUserCircle
            size={32}
            color="#fff"
            style={{ marginTop: 2 }}
            title="Usuario"
          />
        </div>
      </div>
    </header>
  );
}
