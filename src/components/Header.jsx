import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaRobot,
  FaUserCircle,
  FaMapMarkerAlt,
  FaEnvelope,
} from "react-icons/fa";

export default function Header() {
  const [hora, setHora] = useState("");

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
            {
              href: "#ubicanos",
              icon: <FaMapMarkerAlt style={{ marginRight: 8 }} />,
              label: "Ubícanos",
            },
            {
              href: "#contactanos",
              icon: <FaEnvelope style={{ marginRight: 8 }} />,
              label: "Contáctanos",
            },
          ].map((item, idx) => (
            <a
              key={item.label}
              href={item.href}
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
            </a>
          ))}
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
