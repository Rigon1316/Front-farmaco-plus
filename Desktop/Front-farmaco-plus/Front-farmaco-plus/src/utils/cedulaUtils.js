/**
 * Utilidades para validación de cédula ecuatoriana
 */

/**
 * Valida una cédula ecuatoriana usando el algoritmo oficial
 * @param {string} cedula - La cédula a validar (debe tener 10 dígitos)
 * @returns {boolean} - true si la cédula es válida, false en caso contrario
 */
export const validarCedulaEcuatoriana = (cedula) => {
  // Verificar que tenga exactamente 10 dígitos
  if (!/^[0-9]{10}$/.test(cedula)) {
    return false;
  }

  // Verificar que no sea una secuencia de números iguales
  if (/^(\d)\1{9}$/.test(cedula)) {
    return false;
  }

  // Algoritmo de validación de cédula ecuatoriana
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const verificador = parseInt(cedula.charAt(9));

  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let producto = parseInt(cedula.charAt(i)) * coeficientes[i];

    // Si el producto es mayor a 9, sumar los dígitos
    if (producto > 9) {
      producto = Math.floor(producto / 10) + (producto % 10);
    }

    suma += producto;
  }

  // Calcular el dígito verificador esperado
  const residuo = suma % 10;
  const digitoEsperado = residuo === 0 ? 0 : 10 - residuo;

  return verificador === digitoEsperado;
};

/**
 * Formatea una cédula para mostrar con guiones (ej: 1234567890 -> 12-3456789-0)
 * @param {string} cedula - La cédula a formatear
 * @returns {string} - La cédula formateada
 */
export const formatearCedula = (cedula) => {
  if (!cedula || cedula.length !== 10) {
    return cedula;
  }

  return `${cedula.slice(0, 2)}-${cedula.slice(2, 9)}-${cedula.slice(9)}`;
};

/**
 * Obtiene el tipo de cédula basado en el primer dígito
 * @param {string} cedula - La cédula
 * @returns {string} - El tipo de cédula
 */
export const obtenerTipoCedula = (cedula) => {
  if (!cedula || cedula.length !== 10) {
    return "Inválida";
  }

  const primerDigito = parseInt(cedula.charAt(0));

  switch (primerDigito) {
    case 1:
    case 2:
      return "Cédula de Identidad";
    case 3:
      return "Cédula de Extranjero";
    case 4:
      return "Cédula de Extranjero";
    case 5:
      return "Cédula de Extranjero";
    case 6:
      return "Cédula de Extranjero";
    case 7:
      return "Cédula de Extranjero";
    case 8:
      return "Cédula de Extranjero";
    case 9:
      return "Cédula de Extranjero";
    default:
      return "Inválida";
  }
};

/**
 * Valida y retorna un mensaje de error descriptivo
 * @param {string} cedula - La cédula a validar
 * @returns {string} - Mensaje de error o cadena vacía si es válida
 */
export const validarCedulaConMensaje = (cedula) => {
  if (!cedula || cedula.length === 0) {
    return "";
  }

  if (cedula.length < 10) {
    return "La Cédula debe tener 10 dígitos";
  }

  if (cedula.length > 10) {
    return "La Cédula debe tener exactamente 10 dígitos";
  }

  if (!/^[0-9]{10}$/.test(cedula)) {
    return "La Cédula solo debe contener números";
  }

  if (/^(\d)\1{9}$/.test(cedula)) {
    return "La Cédula no puede ser una secuencia de números iguales";
  }

  if (!validarCedulaEcuatoriana(cedula)) {
    return "La Cédula no es válida";
  }

  return "";
};
