import apiEndpoints from "../../../../../Constants/api-endpoints";
import { request } from "../../../../../services/config/axios_helper";

export const configurationService = {
  // Dimensiones
  getDimensions: async () => {
    try {
      const response = await request("GET",
apiEndpoints.SERVICES.ACADEMY,
 "/dimensions");
      return response.data;
    } catch (error) {
      console.error("Error fetching dimensions:", error);
      throw error;
    }
  },
  
  getDimensionsGroupBySubject: async () => {
    try {
      const response = await request("GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.SUBJECTS.GET_GROUP_BY_DIMENSIONS);
      return response.data;
    } catch (error) {
      console.error("Error fetching dimensions:", error);
      throw error;
    }
  },

  createDimension: async (dimension) => {
    try {
      const response = await request("POST",
apiEndpoints.SERVICES.ACADEMY,
 "/dimensions", dimension);
      return response.data;
    } catch (error) {
      console.error("Error creating dimension:", error);
      throw error;
    }
  },
  
  updateDimension: async (id, dimension) => {
    try {
      const response = await request("PUT",
apiEndpoints.SERVICES.ACADEMY,
 `/dimensions/${id}`, dimension);
      return response.data;
    } catch (error) {
      console.error("Error updating dimension:", error);
      throw error;
    }
  },
  
  deleteDimension: async (id) => {
    try {
      await request("DELETE",
apiEndpoints.SERVICES.ACADEMY,
 `/dimensions/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting dimension:", error);
      throw error;
    }
  },
  
  // Materias
  createSubject: async (dimensionId, subject) => {
    try {
      const response = await request("POST",
apiEndpoints.SERVICES.ACADEMY,
 `/dimensions/${dimensionId}/subjects`, subject);
      return response.data;
    } catch (error) {
      console.error("Error creating subject:", error);
      throw error;
    }
  },
  
  updateSubject: async (dimensionId, subjectId, subject) => {
    try {
      const response = await request("PUT",
apiEndpoints.SERVICES.ACADEMY,
 `/dimensions/${dimensionId}/subjects/${subjectId}`, subject);
      return response.data;
    } catch (error) {
      console.error("Error updating subject:", error);
      throw error;
    }
  },
  
  deleteSubject: async (dimensionId, subjectId) => {
    try {
      await request("DELETE",
apiEndpoints.SERVICES.ACADEMY,
 `/dimensions/${dimensionId}/subjects/${subjectId}`);
      return true;
    } catch (error) {
      console.error("Error deleting subject:", error);
      throw error;
    }
  },


  // Periodos

  getPeriods: async (year) => {
    try {
       const response = await request(
                "GET",
                apiEndpoints.SERVICES.ACADEMY,
                apiEndpoints.API_ENDPOINTS.PERIODS.GET_ALL,
                {});
      return response.data;
    } catch (error) {
      console.error("Error al obtener períodos:", error);
      throw error;
    }
  },
  
  getPeriodsByYear: async (year) => {
    try {
       const response = await request(
                "GET",
                apiEndpoints.SERVICES.ACADEMY,
                apiEndpoints.API_ENDPOINTS.PERIODS.GET_ALL_BY_YEAR(year),
                {});
      return response.data;
    } catch (error) {
      console.error("Error al obtener períodos:", error);
      throw error;
    }
  },

    getPeriodsBySettingId: async (settingId,year) => {
      try {
         const response = await request(
                  "GET",
                  apiEndpoints.SERVICES.ACADEMY,
                  apiEndpoints.API_ENDPOINTS.PERIODS.GET_ALL_BY_SETTING_AND_YEAR(settingId,year),
                  {});
        return response.data;
      } catch (error) {
        console.error("Error al obtener períodos:", error);
        throw error;
      }
    },
  
  createPeriod: async (periodData) => {
    try {
      const response = await request("POST",
apiEndpoints.SERVICES.ACADEMY,
 "/periods", periodData);
      return response.data;
    } catch (error) {
      console.error("Error al crear período:", error);
      throw error;
    }
  },
  
  updatePeriod: async (periodId, periodData) => {
    try {
      const response = await request("PUT",
apiEndpoints.SERVICES.ACADEMY,
 `/periods/${periodId}`, periodData);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar período:", error);
      throw error;
    }
  },
  
  deletePeriod: async (periodId) => {
    try {
      await request("DELETE",
apiEndpoints.SERVICES.ACADEMY,
 `/periods/${periodId}`);
      return true;
    } catch (error) {
      console.error("Error al eliminar período:", error);
      throw error;
    }
  },
  // Esquemas de Calificación

  // Notas de esquemas
  getGradeSettings: async () => {
  try {
    const response = await request("GET", 
      apiEndpoints.SERVICES.ACADEMY,
      apiEndpoints.API_ENDPOINTS.EVALUATION.GRADE_SETTINGS.GET_ALL,);
    return response.data;
  } catch (error) {
    console.error("Error al obtener notas del esquema:", error);
    throw error;
  }
},



createSchema: async (schemaData) => {
  try {
    const response = await request("POST",
apiEndpoints.SERVICES.ACADEMY,
 "/grade-settings", schemaData);
    return response.data;
  } catch (error) {
    console.error("Error al crear esquema de calificación:", error);
    throw error;
  }
},

updateSchema: async (schemaId, schemaData) => {
  try {
    const response = await request("PUT",
apiEndpoints.SERVICES.ACADEMY,
 `/grade-settings/${schemaId}`, schemaData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar esquema de calificación:", error);
    throw error;
  }
},

deleteSchema: async (schemaId) => {
  try {
    await request("DELETE",
apiEndpoints.SERVICES.ACADEMY,
 `/grade-settings/${schemaId}`);
    return true;
  } catch (error) {
    console.error("Error al eliminar esquema de calificación:", error);
    throw error;
  }
},

// Educational Levels
getEducationalLevels: async () => {
  try {
    const response = await request("GET", 
    apiEndpoints.SERVICES.ACADEMY,
    apiEndpoints.API_ENDPOINTS.EDUCATIONAL_LEVELS.GET_ALL
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener niveles educativos:", error);
    throw error;
  }
},

getEducationalLevel: async (levelId) => {
  try {
    const response = await request("GET", 
    apiEndpoints.SERVICES.ACADEMY,
    apiEndpoints.API_ENDPOINTS.EDUCATIONAL_LEVELS.GET_BY_ID(levelId)
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener niveles educativos:", error);
    throw error;
  }
},


getSubjectsByGroupAndLevel: async (periodId, levelId) => {
  try {
    const response = await request(
      "GET",
      apiEndpoints.SERVICES.ACADEMY,
      apiEndpoints.API_ENDPOINTS.SUBJECTS.SUBJECTS_BY_GROUPS_LEVEL(periodId,levelId)
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener materias por grupo y nivel:", error);
    throw error;
  }
},



// Knowledges

getKnowledges: async () => {
  try {
    const response = await request(
      "GET",
      apiEndpoints.SERVICES.ACADEMY,
      apiEndpoints.API_ENDPOINTS.EVALUATION.KNOWLEDGES.GET_ALL
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener materias por grupo y nivel:", error);
    throw error;
  }
},

getSubjectKnowledge: async () => {
  try {
    const response = await request(
      "GET",
      apiEndpoints.SERVICES.ACADEMY,
      apiEndpoints.API_ENDPOINTS.EVALUATION.KNOWLEDGES.SUBJECTS.GET_ALL
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener materias por grupo y nivel:", error);
    throw error;
  }
},

getAchievementGroupsKnowledge: async (periodId, groupId) => {
  try {
    const response = await request(
      "GET",
      apiEndpoints.SERVICES.ACADEMY,
      apiEndpoints.API_ENDPOINTS.EVALUATION.KNOWLEDGES.SUBJECTS.GET_ALL_BY_PERIOD_AND_GROUP(periodId,groupId)
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener materias por grupo y nivel:", error);
    throw error;
  }
},

// Groups
getAllGroups: async () => {
  try {
    const response = await request(
      "GET",
      apiEndpoints.SERVICES.ACADEMY,
      apiEndpoints.API_ENDPOINTS.GROUPS.GET_ALL
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener materias por grupo y nivel:", error);
    throw error;
  }
},

};

export default configurationService;
