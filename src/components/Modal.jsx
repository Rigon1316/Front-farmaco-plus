import React, { useEffect } from "react";
import { FaTimesCircle } from "react-icons/fa";
import { useModalContext } from "../utils/ModalContext";
import "./Modal.css";

function Modal({ open, onClose, title, children }) {
  const { openModal, closeModal } = useModalContext();

  useEffect(() => {
    if (open) {
      openModal();
    } else {
      closeModal();
    }
  }, [open, openModal, closeModal]);

  if (!open) return null;

  return (
    <div className="modal-overlay modal-fade-in">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24, color: "#1976d2" }}>💡</span>
            <h3 style={{ margin: 0, fontWeight: 700, color: "#1976d2" }}>
              {title}
            </h3>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar"
            tabIndex={0}
            style={{
              display: "flex",
              alignItems: "center",
              background: "none",
              border: "none",
            }}
          >
            <FaTimesCircle
              size={28}
              color="#d32f2f"
              style={{ transition: "color 0.2s" }}
            />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
