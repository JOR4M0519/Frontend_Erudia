/**
 * Obtiene la fecha y hora actual en la zona horaria especificada.
 * @param {string} timeZone - La zona horaria (ej: "America/Bogota", "Europe/Madrid").
 * @returns {Date} - Retorna un objeto Date ajustado a la zona horaria.
 */
export const getCurrentDateInTimeZone = (timeZone) => {
  return new Date(new Date().toLocaleString("en-US", { timeZone }));
};

/**
 * Formatea una fecha en una zona horaria y formato local específico.
 * @param {string} dateString - Fecha en formato "YYYY-MM-DDTHH:mm:ssZ" (ISO 8601).
 * @param {string} timeZone - Zona horaria en la que se quiere mostrar la fecha.
 * @param {string} locale - Idioma y formato de la fecha (ej: "es-CO", "en-US").
 * @returns {string} - Retorna la fecha formateada según el idioma.
 */
export const formatDateInTimeZone = (dateString, timeZone, locale) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, { timeZone });
};
