import { request } from "../../../services/config/axios_helper";

/**
 * Servicio para gestionar reportes y datos administrativos de estudiantes
 */
export const adminStudentService = {
  /**
   * Obtiene el resumen académico de estudiantes por nivel y grado
   * @returns {Promise<Object>} Datos del nivel académico agrupados por grado
   */
  getAcademicLevelReport: async (year = new Date().getFullYear()) => {
    try {
      const response = await request(
        "GET",
        "academy",
        `/admin/students/academic-level?year=${year}`,
        {}
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error al obtener reporte de nivel académico:", error);
      return [];
    }
  },

  /**
   * Obtiene el reporte de ausencias de estudiantes por grado
   * @returns {Promise<Object>} Datos de ausencias agrupados por grado
   */
  getAbsenceReport: async (year = new Date().getFullYear()) => {
    try {
      const response = await request(
        "GET",
        "academy",
        `/admin/students/absences?year=${year}`,
        {}
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error al obtener reporte de ausencias:", error);
      return [];
    }
  },

  /**
   * Obtiene el reporte de estudiantes repitentes por grado
   * @returns {Promise<Object>} Datos de repitentes agrupados por grado
   */
  getRepeatingStudentsReport: async (year = new Date().getFullYear()) => {
    try {
      const response = await request(
        "GET",
        "academy",
        `/admin/students/repeating?year=${year}`,
        {}
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error al obtener reporte de repitentes:", error);
      return [];
    }
  },

  /**
   * Obtiene el reporte de estudiantes nuevos por grado
   * @returns {Promise<Object>} Datos de estudiantes nuevos agrupados por grado
   */
  getNewStudentsReport: async (year = new Date().getFullYear()) => {
    try {
      const response = await request(
        "GET",
        "academy",
        `/admin/students/new?year=${year}`,
        {}
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error al obtener reporte de estudiantes nuevos:", error);
      return [];
    }
  },

  /**
   * Obtiene el listado detallado de estudiantes nuevos según criterios de filtro
   * @param {Object} filters - Criterios de filtro (year, matriculaEn, noEn)
   * @returns {Promise<Array>} Lista de estudiantes que cumplen los criterios
   */
  getDetailedNewStudents: async (filters) => {
    try {
      const response = await request(
        "POST",
        "academy",
        "/admin/students/new/detail",
        filters
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error al obtener detalle de estudiantes nuevos:", error);
      return [];
    }
  }
};
