import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import MedicamentosPage from "./pages/MedicamentosPage.jsx";
import ClientesPage from "./pages/ClientesPage.jsx";
import AlertasPage from "./pages/AlertasPage.jsx";
import VentaPage from "./pages/VentaPage.jsx";
import ConsultasIA from "./pages/ConsultasIA.jsx";
import LotePage from "./pages/LotePage.jsx";
import ProveedoresPage from "./pages/ProveedoresPage.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { isTokenValid } from "./utils/authUtils.js";
import "./App.css";

function App() {
  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true" && isTokenValid();

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/medicamentos" element={<MedicamentosPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/alertas" element={<AlertasPage />} />
          <Route path="/venta" element={<VentaPage />} />
          <Route path="/consultas-ia" element={<ConsultasIA />} />
          <Route path="/lote" element={<LotePage />} />
          <Route path="/proveedor" element={<ProveedoresPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
