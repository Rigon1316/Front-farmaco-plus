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
          <div className="modal-title-container">
            <span className="modal-icon">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path
                  fill="#FFA726"
                  d="M12 2a7 7 0 0 0-7 7c0 2.93 2.36 5.36 5.25 5.7V17a1 1 0 0 0 2 0v-2.3C16.64 14.36 19 11.93 19 9a7 7 0 0 0-7-7zm0 18a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2z"
                />
              </svg>
            </span>
            <h3 className="modal-title">{title}</h3>
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
