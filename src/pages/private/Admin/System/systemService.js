import apiEndpoints from "../../../../Constants/api-endpoints";
import { request } from "../../../../services/config/axios_helper";



export const systemService = {

  /**
   * Obtiene todos los usuarios con sus relaciones familiares (nuevo controlador)
   */
  async getAllFamilyRelations() {
    try {
      const response = await request(
        'GET',
        apiEndpoints.SERVICES.ACADEMY,
       apiEndpoints.API_ENDPOINTS.USER.FAMILY.ALL_USERS_WITH_RELATIONS
      );
      if (response.status !== 200) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.data;
    } catch (error) {
      console.error("Error obteniendo relaciones familiares:", error);
      throw error;
    }
  },

  /**
   * Crea una o varias relaciones familiares
   * @param {Object} userFamilyData - Objeto con userDetail, familyRelations e isStudent
   */
  async createFamilyRelations(userFamilyData) {
    try {
      const response = await request(
        'POST',
        apiEndpoints.SERVICES.ACADEMY,
       apiEndpoints.API_ENDPOINTS.USER.FAMILY.CREATE_RELATIONS,
        userFamilyData
      );
      if (response.status !== 201) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.data;
    } catch (error) {
      console.error("Error creando relaciones familiares:", error);
      throw error;
    }
  },

  /**
   * Actualiza una relación familiar existente
   */
  async updateFamilyRelation(id, familyData) {
    try {
      const response = await request(
        'PUT',
        apiEndpoints.SERVICES.ACADEMY,
       apiEndpoints.API_ENDPOINTS.USER.FAMILY.UPDATE_RELATION(id),
        familyData
      );
      if (response.status !== 200) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.data;
    } catch (error) {
      console.error("Error actualizando relación familiar:", error);
      throw error;
    }
  },

  /**
   * Elimina una relación familiar
   */
  async deleteFamilyRelation(id) {
    try {
      const response = await request(
        'DELETE',
        apiEndpoints.SERVICES.ACADEMY,
       apiEndpoints.API_ENDPOINTS.USER.FAMILY.DELETE_RELATION(id)
      );
      if (response.status !== 204) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return true; // Indica que se eliminó correctamente
    } catch (error) {
      console.error("Error eliminando relación familiar:", error);
      throw error;
    }
  },

  /**
   * Obtiene las relaciones familiares de un usuario específico
   */
  async getFamilyRelationsByUser(userId) {
    try {
      const response = await request(
        'GET',
        apiEndpoints.SERVICES.ACADEMY,
       apiEndpoints.API_ENDPOINTS.USER.FAMILY.GET_RELATIONS_BY_USER(userId)
      );
      if (response.status !== 200) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.data;
    } catch (error) {
      console.error("Error obteniendo relaciones por usuario:", error);
      throw error;
    }
  },

  /**
   * Obtiene informes detallados de familias
   */
  async getDetailedFamilyReports() {
    try {
      const response = await request(
        'GET',
        apiEndpoints.SERVICES.ACADEMY,
       apiEndpoints.API_ENDPOINTS.USER.FAMILY.GET_REPORTS
      );
      if (response.status !== 200) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.data;
    } catch (error) {
      console.error("Error obteniendo informes detallados de familias:", error);
      throw error;
    }
  },

  //RELATIONS TYPE

   /**
   * OBTIENE TODAS LAS RELACIONEMSDE tipo de relación familiar
   */
  async getAllFamilyRelationTypes() {
    try {
      const response = await request(
        'GET',
        apiEndpoints.SERVICES.ACADEMY,
       apiEndpoints.API_ENDPOINTS.USER.FAMILY.RELATION_TYPE.GET_ALL
      );
      if (response.status !== 200) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.data;
    } catch (error) {
      console.error("Error obteniendo relaciones familiares:", error);
      throw error;
    }
  },
  
  /**
   * Crea un tipo de relación familiar
   */
  async createFamilyRelationsTypes(relationTypeFamilyData) {
    try {
      const response = await request(
        'POST',
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.USER.FAMILY.RELATION_TYPE.CREATE,
        relationTypeFamilyData
      );
      if (response.status !== 200) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.data;
    } catch (error) {
      console.error("Error creando tipo de relación familiar:", error);
      
      let errorMessage = "No se pudo crear el tipo de relación familiar";
      
      if (error.response) {
        switch (error.response.status) {
          case 409:
            errorMessage = "Ya existe un tipo de relación con este nombre";
            break;
          case 400:
            errorMessage = "Datos inválidos para crear el tipo de relación";
            break;
          case 500:
            errorMessage = "Error interno del servidor al crear tipo de relación";
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      }
      
      throw {
        message: errorMessage,
        status: error.response?.status || 500,
        originalError: error
      };
    }
  },
  
  /**
   * Actualiza un tipo de relación familiar
   */
  async updateFamilyRelationTypes(id, relationTypeFamilyData) {
    try {
      const response = await request(
        'PUT',
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.USER.FAMILY.RELATION_TYPE.UPDATE_BY_ID(id),
        relationTypeFamilyData
      );
      if (response.status !== 200) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.data;
    } catch (error) {
      console.error("Error actualizando tipo de relación familiar:", error);
      
      let errorMessage = "No se pudo actualizar el tipo de relación familiar";
      
      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = "No se encontró el tipo de relación a actualizar";
            break;
          case 409:
            errorMessage = "Ya existe un tipo de relación con este nombre";
            break;
          case 400:
            errorMessage = "Datos inválidos para actualizar el tipo de relación";
            break;
          case 500:
            errorMessage = "Error interno del servidor al actualizar tipo de relación";
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      }
      
      throw {
        message: errorMessage,
        status: error.response?.status || 500,
        originalError: error
      };
    }
  },

  /**
   * Elimina un tipo de relación familiar
   */
async deleteFamilyRelationTypes(id) {
  try {
    const response = await request(
      'DELETE',
      apiEndpoints.SERVICES.ACADEMY,
      apiEndpoints.API_ENDPOINTS.USER.FAMILY.RELATION_TYPE.DELETE_BY_ID(id)
    );
    if (response.status !== 204) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return true; // Indica que se eliminó correctamente
  } catch (error) {
    console.error("Error eliminando tipo de relación familiar:", error);
    
    let errorMessage = "No se pudo eliminar el tipo de relación familiar";
    
    if (error.response) {
      switch (error.response.status) {
        case 404:
          errorMessage = "No se encontró el tipo de relación a eliminar";
          break;
        case 409:
          errorMessage = "No se puede eliminar este tipo de relación porque está en uso";
          break;
        case 500:
          errorMessage = "Error interno del servidor al eliminar tipo de relación";
          break;
        default:
          errorMessage = error.response.data?.message || errorMessage;
      }
    }
    
    throw {
      message: errorMessage,
      status: error.response?.status || 500,
      originalError: error
    };
  }
},


}

