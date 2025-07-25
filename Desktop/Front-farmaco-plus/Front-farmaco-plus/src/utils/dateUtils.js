/**
 * Utilidades para el manejo de fechas entre frontend y backend
 */

/**
 * Convierte una fecha del backend al formato YYYY-MM-DD para inputs de tipo date
 * @param {string|Date|Array} fecha - Fecha del backend (puede ser string ISO, Date, o array)
 * @returns {string} Fecha en formato YYYY-MM-DD o string vacío si no hay fecha
 */
export const formatDateForInput = (fecha) => {
  if (!fecha) return "";

  try {
    let dateObj;

    // Si es un array (formato del backend)
    if (Array.isArray(fecha)) {
      dateObj = new Date(fecha[0], fecha[1] - 1, fecha[2]);
    }
    // Si es un string ISO
    else if (typeof fecha === "string") {
      dateObj = new Date(fecha);
    }
    // Si ya es un objeto Date
    else if (fecha instanceof Date) {
      dateObj = fecha;
    } else {
      return "";
    }

    // Verificar que la fecha sea válida
    if (isNaN(dateObj.getTime())) {
      return "";
    }

    // Convertir a formato YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formateando fecha para input:", error);
    return "";
  }
};

/**
 * Convierte una fecha del input (YYYY-MM-DD) al formato que espera el backend
 * @param {string} fechaInput - Fecha en formato YYYY-MM-DD del input
 * @returns {string|null} Fecha en formato ISO string o null si no hay fecha
 */
export const formatDateForBackend = (fechaInput) => {
  if (!fechaInput || fechaInput.trim() === "") {
    return null;
  }

  try {
    // Crear fecha y convertir a ISO string
    const dateObj = new Date(fechaInput + "T00:00:00");

    // Verificar que la fecha sea válida
    if (isNaN(dateObj.getTime())) {
      return null;
    }

    return dateObj.toISOString();
  } catch (error) {
    console.error("Error formateando fecha para backend:", error);
    return null;
  }
};

/**
 * Formatea una fecha para mostrar en la interfaz
 * @param {string|Date|Array} fecha - Fecha del backend
 * @returns {string} Fecha formateada para mostrar
 */
export const formatDateForDisplay = (fecha) => {
  if (!fecha) return "No especificada";

  try {
    let dateObj;

    // Si es un array (formato del backend)
    if (Array.isArray(fecha)) {
      dateObj = new Date(fecha[0], fecha[1] - 1, fecha[2]);
    }
    // Si es un string ISO
    else if (typeof fecha === "string") {
      dateObj = new Date(fecha);
    }
    // Si ya es un objeto Date
    else if (fecha instanceof Date) {
      dateObj = fecha;
    } else {
      return "No especificada";
    }

    // Verificar que la fecha sea válida
    if (isNaN(dateObj.getTime())) {
      return "No especificada";
    }

    // Formatear para mostrar (DD/MM/YYYY)
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formateando fecha para display:", error);
    return "No especificada";
  }
};
