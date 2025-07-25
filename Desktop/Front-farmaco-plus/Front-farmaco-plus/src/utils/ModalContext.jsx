import React, { createContext, useContext, useState, useCallback } from "react";

const ModalContext = createContext();

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error(
      "useModalContext debe ser usado dentro de un ModalProvider"
    );
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsAnyModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsAnyModalOpen(false);
  }, []);

  const value = {
    isAnyModalOpen,
    openModal,
    closeModal,
  };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};
