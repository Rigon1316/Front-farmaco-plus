import { useState, useEffect } from "react";

export const useModalDetection = () => {
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  useEffect(() => {
    const checkForModals = () => {
      // Buscar elementos con clase modal-overlay
      const modalOverlays = document.querySelectorAll(".modal-overlay");
      const hasVisibleModal = modalOverlays.length > 0;

      console.log(
        "useModalDetection: modalOverlays.length =",
        modalOverlays.length,
        "hasVisibleModal =",
        hasVisibleModal
      );
      setIsAnyModalOpen(hasVisibleModal);
    };

    // Verificar inmediatamente
    checkForModals();

    // Configurar un observer para detectar cambios en el DOM
    const observer = new MutationObserver(checkForModals);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return isAnyModalOpen;
};
