import { request } from "../../../../services/config/axios_helper";


/**
 * Servicio para gestionar empleados de la institución
 */
export const employeeService = {
  /**
   * Obtiene el consolidado de empleados para un año determinado
   * @param {number} year - Año para filtrar los empleados
   * @returns {Promise<Array>} Lista de empleados
   */
  getEmployeeConsolidated: async (year = new Date().getFullYear()) => {
    try {
      const response = await request(
        "GET",
        "admin",
        `/employees/consolidated?year=${year}`,
        {}
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error al obtener consolidado de empleados:", error);
      throw error;
    }
  },

  /**
   * Obtiene detalles de un empleado por su ID
   * @param {string|number} id - ID del empleado
   * @returns {Promise<Object>} Datos del empleado
   */
  getEmployeeById: async (id) => {
    try {
      const response = await request(
        "GET",
        "admin",
        `/employees/${id}`,
        {}
      );

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener datos del empleado:", error);
      throw error;
    }
  },

  /**
   * Agrega un nuevo empleado al sistema
   * @param {Object} employeeData - Datos del nuevo empleado
   * @returns {Promise<Object>} Datos del empleado creado
   */
  addEmployee: async (employeeData) => {
    try {
      const response = await request(
        "POST",
        "admin",
        "/employees",
        employeeData
      );

      if (response.status === 201 || response.status === 200) {
        return response.data;
      }
      throw new Error("No se pudo crear el empleado");
    } catch (error) {
      console.error("Error al agregar empleado:", error);
      throw error;
    }
  },

  /**
   * Actualiza los datos de un empleado existente
   * @param {string|number} id - ID del empleado a actualizar
   * @param {Object} employeeData - Nuevos datos del empleado
   * @returns {Promise<Object>} Datos actualizados del empleado
   */
  updateEmployee: async (id, employeeData) => {
    try {
      const response = await request(
        "PUT",
        "admin",
        `/employees/${id}`,
        employeeData
      );

      if (response.status === 200) {
        return response.data;
      }
      throw new Error("No se pudo actualizar el empleado");
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      throw error;
    }
  },

  /**
   * Elimina un empleado del sistema
   * @param {string|number} id - ID del empleado a eliminar
   * @returns {Promise<boolean>} Resultado de la operación
   */
  deleteEmployee: async (id) => {
    try {
      const response = await request(
        "DELETE",
        "admin",
        `/employees/${id}`,
        {}
      );

      if (response.status === 200 || response.status === 204) {
        return true;
      }
      throw new Error("No se pudo eliminar el empleado");
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      throw error;
    }
  },

  /**
   * Obtiene la lista de cargos disponibles para los empleados
   * @returns {Promise<Array>} Lista de cargos
   */
  getAvailableRoles: async () => {
    try {
      const response = await request(
        "GET",
        "admin",
        "/employees/roles",
        {}
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error al obtener lista de cargos:", error);
      return ["Docente", "Auxiliar administrativo", "Coordinador académico", "Rector", "Personal de apoyo"];
    }
  },

  /**
   * Cambia el estado de uno o varios empleados
   * @param {Array} employeeIds - Array con IDs de los empleados a modificar
   * @param {string} newStatus - Nuevo estado a aplicar
   * @returns {Promise<boolean>} Resultado de la operación
   */
  changeEmployeeStatus: async (employeeIds, newStatus) => {
    try {
      const response = await request(
        "PATCH",
        "admin",
        "/employees/status",
        { ids: employeeIds, status: newStatus }
      );

      if (response.status === 200) {
        return true;
      }
      throw new Error("No se pudo actualizar el estado de los empleados");
    } catch (error) {
      console.error("Error al cambiar estado de empleados:", error);
      throw error;
    }
  }
};
