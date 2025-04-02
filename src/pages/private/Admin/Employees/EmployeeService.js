import apiEndpoints from "../../../../Constants/api-endpoints";
import { request } from "../../../../services/config/axios_helper";
import { RoleModel, IdTypeModel } from "./";


/**
 * Servicio para gestionar empleados de la institución
 */
export const employeeService = {
  /**
   * Obtiene todos los roles disponibles en el sistema
   * @returns {Promise<Array<RoleModel>>} Lista de roles
   */
  getRoles: async () => {
    try {
      const response = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.ROLE.GET_ALL,
        {}
      );
       
      if (response.status === 200) {
        return response.data.map(role => RoleModel.fromJson(role));
      }
      return [];
    } catch (error) {
      console.error("Error al obtener roles:", error);
      throw error;
    }
  },
  /**
   * Crea un nuevo usuario administrativo
   * @param {Object} userData - Datos del usuario a crear
   * @returns {Promise<Object>} Usuario creado
   */
createAdministrativeUser: async (userData) => {
  try {
    const response = await request(
      "POST",
      apiEndpoints.SERVICES.GATEAWAY,
      apiEndpoints.API_ENDPOINTS.USER.CREATE_ADMINISTRATIVE_GTW,
      userData
    );
    if (response.status === 200 || response.status === 201) {
      return response.data;
    }
    throw new Error("Error al crear usuario administrativo");
  } catch (error) {
    console.error("Error al crear usuario administrativo:", error);
    throw error;
  }
},

  /**
   * Obtiene los tipos de identificación
   * @returns {Promise<Array>} Lista de tipos de identificación
   */
  getIdTypes: async () => {
    try {
      const response = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.ID_TYPE.GET_ALL,
        {}
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error al obtener tipos de identificación:", error);
      throw error;
    }
  },
};

/**
 * Servicio para gestionar usuarios del sistema
 */
export const userService = {
  
   /**
   * Obtiene los detalles completos de un usuario por su ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} Detalles completos del usuario
   */
   getUserDetail: async (id) => {
    try {
      const response = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.USER.GET_DETAIL(id),
        {}
      );

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener detalles del usuario:", error);
      throw error;
    }
  },

  /**
   * Actualiza la información completa de un usuario
   * @param {number} userId - ID del usuario
   * @param {Object} userData - Datos actualizados del usuario y su detalle
   * @returns {Promise<Object>} Resultado de la operación
   */
  updateUserFull: async (userId, userData) => {
    try {
      const response = await request(
        "PATCH",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.USER.UPDATE_DETAIL_BY_ID(userId),
        userData
      );

      if (response.status === 200) {
        return response.data;
      }
      throw new Error("Error al actualizar información del usuario");
    } catch (error) {
      console.error("Error al actualizar información del usuario:", error);
      throw error;
    }
  },

  /**
   * Obtiene todos los tipos de identificación disponibles
   * @returns {Promise<Array<IdTypeModel>>} Lista de tipos de identificación
   */
  getIdTypes: async () => {
    try {
      const response = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.ID_TYPE.GET_ALL,
        {}
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error al obtener tipos de identificación:", error);
      throw error;
    }
  },

  /**
   * Obtiene todos los usuarios administrativos
   * @returns {Promise<Array>} Lista de usuarios administrativos
   */
  getAdministrativeUsers: async () => {
    try {
      const response = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.USER.GET_ADMINISTRATIVE,
        {}
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error al obtener usuarios administrativos:", error);
      throw error;
    }
  },

  /**
   * Obtiene todos los estudiantes
   * @returns {Promise<Array>} Lista de estudiantes
   */
  getStudents: async () => {
    try {
      const response = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.USER.GET_STUDENTS,
        {}
      );

      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error al obtener estudiantes:", error);
      throw error;
    }
  },

  /**
   * Obtiene detalles de un usuario por su ID
   * @param {string|number} id - ID del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  getUserById: async (id) => {
    try {
      const response = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.USER.GET_BY_ID(id),
        {}
      );

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      throw error;
    }
  },

  /**
   * Actualiza el estado de un usuario
   * @param {number} id - ID del usuario
   * @param {string} status - Nuevo estado (A: Activo, I: Inactivo)
   * @returns {Promise<Object>} Resultado de la operación
   */
  updateUserStatus: async (id, status) => {
    try {
      const response = await request(
        "PATCH",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.USER.UPDATE_STATUS(id),
        { status }
      );

      if (response.status === 200) {
        return response.data;
      }
      throw new Error("Error al actualizar estado del usuario");
    } catch (error) {
      console.error("Error al actualizar estado del usuario:", error);
      throw error;
    }
  }
};
