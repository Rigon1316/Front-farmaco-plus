import React from "react";
import Header from "../components/Header.jsx";

function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main style={{ padding: "2rem" }}>{children}</main>
    </>
  );
}

export default MainLayout;
