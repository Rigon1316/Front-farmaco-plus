import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaPills,
  FaUsers,
  FaShoppingCart,
  FaExclamationTriangle,
  FaRobot,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { useNotification } from "../utils/NotificationContext.jsx";

function HomePage() {
  const location = useLocation();
  const { nuevasAlertas, setNuevasAlertas } = useNotification();

  useEffect(() => {
    if (location.pathname === "/alertas") {
      setNuevasAlertas(0);
    }
  }, [location.pathname, setNuevasAlertas]);

  const secciones = [
    {
      titulo: "Medicamentos",
      descripcion: "Gestiona el inventario de medicamentos",
      icono: <FaPills size={40} />,
      ruta: "/medicamentos",
      color: "#4caf50",
    },
    {
      titulo: "Clientes",
      descripcion: "Administra la información de clientes",
      icono: <FaUsers size={40} />,
      ruta: "/clientes",
      color: "#2196f3",
    },
    {
      titulo: "Ventas",
      descripcion: "Registra y gestiona las ventas",
      icono: <FaShoppingCart size={40} />,
      ruta: "/venta",
      color: "#ff9800",
    },
    {
      titulo: "Alertas",
      descripcion: "Consulta el detalle de cada venta realizada",
      // icono se renderiza directamente en el JSX
      ruta: "/alertas",
      color: "#9c27b0",
      onClick: () => setNuevasAlertas(0),
    },
  ];

  return (
    <div>
      <h2>Inicio</h2>

      {/* Secciones principales */}
      <div style={{ marginBottom: "3rem" }}>
        <h3 style={{ marginBottom: "1.5rem", color: "#333" }}>
          Gestión Principal de Farmaco Plus
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {secciones.map((seccion, index) => (
            <Link
              key={index}
              to={seccion.ruta}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "block",
              }}
              onClick={seccion.onClick}
            >
              <div
                style={{
                  background: "#fff",
                  border: `2px solid ${seccion.color}`,
                  borderRadius: "12px",
                  padding: "2rem",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 25px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 6px rgba(0, 0, 0, 0.1)";
                }}
              >
                <div style={{ color: seccion.color, marginBottom: "1rem" }}>
                  {seccion.titulo === "Alertas" ? (
                    <span
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <FaExclamationTriangle size={40} color="#9c27b0" />
                      {nuevasAlertas > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -10,
                            background: "#e53935",
                            borderRadius: "50%",
                            width: 16,
                            height: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                            border: "2px solid #fff",
                            zIndex: 2,
                          }}
                        />
                      )}
                    </span>
                  ) : (
                    seccion.icono
                  )}
                </div>
                <h4
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: seccion.color,
                    fontSize: "1.3rem",
                    fontWeight: "600",
                  }}
                >
                  {seccion.titulo}
                </h4>
                <p
                  style={{
                    margin: 0,
                    color: "#666",
                    fontSize: "0.95rem",
                  }}
                >
                  {seccion.descripcion}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Sección de IA */}
      {/* Eliminado: sección de IA */}
    </div>
  );
}

export default HomePage;
