import React, { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  // Estado global para nuevas alertas
  const [nuevasAlertas, setNuevasAlertas] = useState(1); // Simulación inicial

  return (
    <NotificationContext.Provider value={{ nuevasAlertas, setNuevasAlertas }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
