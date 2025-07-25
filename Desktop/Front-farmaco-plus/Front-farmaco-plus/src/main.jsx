import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.css";
import { NotificationProvider } from "./utils/NotificationContext.jsx";
import { ModalProvider } from "./utils/ModalContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NotificationProvider>
      <ModalProvider>
        <App />
      </ModalProvider>
    </NotificationProvider>
  </React.StrictMode>
);
