import apiEndpoints from "../../../../../Constants/api-endpoints";
import { request } from "../../../../../services/config/axios_helper";

export const configurationService = {
  // Dimensiones
  getDimensions: async () => {
    try {
      const response = await request("GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.DIMENSIONS.GET_ALL);
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
        apiEndpoints.API_ENDPOINTS.DIMENSIONS.RELATION_SUBJECTS.GET_GROUP_BY_DIMENSIONS);
      return response.data;
    } catch (error) {
      console.error("Error fetching dimensions:", error);
      throw error;
    }
  },

  deleteSubjectDimension: async (id) => {
    try {
      await request("DELETE",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.DIMENSIONS.RELATION_SUBJECTS.DELETE_BY_ID(id));
      return true;
    } catch (error) {
      console.error("Error deleting dimension:", error);
      throw error;
    }
  },

  createDimension: async (dimension) => {
    try {
      const response = await request("POST",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.DIMENSIONS.CREATE_DIMENSION,
        dimension);
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
        apiEndpoints.API_ENDPOINTS.DIMENSIONS.UPDATE_BY_ID(id),
        dimension);
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
        apiEndpoints.API_ENDPOINTS.DIMENSIONS.DELETE_BY_ID(id));
      return true;
    } catch (error) {
      console.error("Error deleting dimension:", error);
      throw error;
    }
  },



  //SubjectKnowledges

  createSubjectKnowledge: async (subjectKnowledge) => {
    try {
      const response = await request("POST",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.KNOWLEDGES.SUBJECTS.CREATE,
        subjectKnowledge);
      return response.data;
    } catch (error) {
      console.error("Error creating Relación subject-knowledge:", error);
      throw error;
    }
  },

  updateSubjectKnowledge: async (id, subjectKnowledge) => {
    try {
      const response = await request("PUT",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.KNOWLEDGES.SUBJECTS.UPDATE_BY_ID(id),
        subjectKnowledge);
      return response.data;
    } catch (error) {
      console.error("Error updating Relación subject-knowledge:", error);
      throw error;
    }
  },

  deleteSubjectKnowledge: async (id) => {
    try {
      await request("DELETE",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.KNOWLEDGES.SUBJECTS.DELETE_BY_ID(id));
      return true;
    } catch (error) {
      console.error("Error deleting Relación subject-knowledge:", error);
      throw error;
    }
  },

  //Subject

  getSubjects: async () => {
    try {
      const response = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.SUBJECTS.GET_ALL,
        {});
      return response.data;
    } catch (error) {
      console.error("Error al obtener períodos:", error);
      throw error;
    }
  },

  createSubject: async (subjectKnowledge) => {
    try {
      const response = await request("POST",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.SUBJECTS.CREATE,
        subjectKnowledge);
      return response.data;
    } catch (error) {
      console.error("Error creating Relación subject-knowledge:", error);
      throw error;
    }
  },

  updateSubject: async (subjectId, subject) => {
    try {
      const response = await request("PUT",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.SUBJECTS.UPDATE_BY_ID(subjectId),
        subject);
      return response.data;
    } catch (error) {
      console.error("Error updating subject:", error);
      throw error;
    }
  },
  deleteSubject: async (id) => {
    try {
      await request(
        "DELETE",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.SUBJECTS.DELETE_BY_ID(id)
      );
      return true;
    } catch (error) {
      console.error("Error al eliminar la asignatura:", error);
      throw error;
    }
  },
  



  //Relacioón SubjectDimension

  createSubjectDimension: async (dimensionId, subjectId) => {

    const subjectDimensionDomain = {
      dimension: { id: dimensionId },
      subject: { id: subjectId },
    }

    try {
      const response = await request("POST",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.DIMENSIONS.RELATION_SUBJECTS.CREATE,
        subjectDimensionDomain);
      return response.data;
    } catch (error) {
      console.error("Error updating subject:", error);
      throw error;
    }
  },

  updateSubjectDimension: async (relationId, dimensionId, subjectId) => {

    const subjectDimensionDomain = {
      dimension: { id: dimensionId },
      subject: { id: subjectId },
    }

    try {
      const response = await request("PUT",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.DIMENSIONS.RELATION_SUBJECTS.UPDATE_BY_ID(relationId),
        subjectDimensionDomain);
      return response.data;
    } catch (error) {
      console.error("Error updating subject:", error);
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

  getValidationPercentagePeriodByYear: async (year) => {
    try {
      const response = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.PERIODS.GET_PERCENTAGE_VALIDATION_BY_YEAR(year),
        {});
      return response.data;
    } catch (error) {
      console.error("Error al obtener períodos:", error);
      throw error;
    }
  },

  getPeriodsBySettingId: async (settingId, year) => {
    try {
      const response = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.PERIODS.GET_ALL_BY_SETTING_AND_YEAR(settingId, year),
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
        apiEndpoints.API_ENDPOINTS.PERIODS.CREATE,
        periodData);
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
        apiEndpoints.API_ENDPOINTS.PERIODS.UPDATE_BY_ID(periodId),
        periodData);
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



  createGradeSettings: async (schemaData) => {
    try {
      const response = await request("POST",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.GRADE_SETTINGS.CREATE,
        schemaData);
      return response.data;
    } catch (error) {
      console.error("Error al crear esquema de calificación:", error);
      throw error;
    }
  },

  updateGradeSettings: async (schemaId, schemaData) => {
    try {
      const response = await request("PUT",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.GRADE_SETTINGS.UPDATE_BY_ID(schemaId),
        schemaData);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar esquema de calificación:", error);
      throw error;
    }
  },

  deleteGradeSettings: async (schemaId) => {
    try {
      await request("DELETE",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.GRADE_SETTINGS.DELETE_BY_ID(schemaId));
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
        apiEndpoints.API_ENDPOINTS.SUBJECTS.SUBJECTS_BY_GROUPS_LEVEL(periodId, levelId)
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener materias por grupo y nivel:", error);
      throw error;
    }
  },

  createEducationalLevel: async (levelData) => {
    try {
      const response = await request("POST",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EDUCATIONAL_LEVELS.CREATE,
        levelData);
      return response.data;
    } catch (error) {
      console.error("Error al crear el nivel educativo:", error);
      throw error;
    }
  },

  updateEducationalLevel: async (levelId, levelData) => {
    try {
      const response = await request("PUT",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EDUCATIONAL_LEVELS.UPDATE_BY_ID(levelId),
        levelData);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar el nivel educativo:", error);
      throw error;
    }
  },

  deleteEducationalLevel: async (levelId) => {
    try {
      await request("DELETE",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EDUCATIONAL_LEVELS.DELETE_BY_ID(levelId));
      return true;
    } catch (error) {
      console.error("Error al eliminar el nivel educativo:", error);
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

  getSubjectKnowledgeBySubject: async (subjectId) => {
    try {
      const response = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.
          KNOWLEDGES.SUBJECTS.GET_ALL_BY_SUBJECT(subjectId)
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
        apiEndpoints.API_ENDPOINTS.EVALUATION.KNOWLEDGES.SUBJECTS.GET_ALL_BY_PERIOD_AND_GROUP(periodId, groupId)
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener materias por grupo y nivel:", error);
      throw error;
    }
  },

  updateAchievementGroupsKnowledge: async (achievementGroupDataId, achievementGroupData) => {
    try {
      const response = await request("PUT",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.KNOWLEDGES.
          SUBJECTS.UPDATE_ACHIEVEMENT_GROUP_BY_ID(achievementGroupDataId),
        achievementGroupData);
      return response.data;
    } catch (error) {
      console.error("Error al crear el saber:", error);
      throw error;
    }
  },

  createAchievementGroupsKnowledge: async (achievementGroupData) => {
    try {
      const response = await request("POST",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.KNOWLEDGES.SUBJECTS.CREATE_ACHIEVEMENT_GROUP,
        achievementGroupData);
      return response.data;
    } catch (error) {
      console.error("Error al crear el saber:", error);
      throw error;
    }
  },

  createKnowledges: async (knowledgeData) => {
    try {
      const response = await request("POST",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.KNOWLEDGES.CREATE,
        knowledgeData);
      return response.data;
    } catch (error) {
      console.error("Error al crear el saber:", error);
      throw error;
    }
  },

  updateKnowledges: async (knowledgeId, knowledgeData) => {
    try {
      const response = await request("PUT",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.KNOWLEDGES.UPDATE_BY_ID(knowledgeId),
        knowledgeData);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar el saber", error);
      throw error;
    }
  },

  deleteKnowledges: async (knowledgeId) => {
    try {
      await request("DELETE",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.KNOWLEDGES.DELETE_BY_ID(knowledgeId));
      return true;
    } catch (error) {
      console.error("Error al eliminar el saber:", error);
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

  createGroups: async (groupData) => {
    try {
      const response = await request("POST",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.GROUPS.CREATE,
        groupData);
      return response.data;
    } catch (error) {
      console.error("Error al crear el grupo:", error);
      throw error;
    }
  },

  updateGroups: async (groupId, groupData) => {
    try {
      const response = await request("PUT",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.GROUPS.UPDATE_BY_ID(groupId),
        groupData);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar el saber", error);
      throw error;
    }
  },

  deleteGroups: async (groupId) => {
    try {
      const response = await request("DELETE",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.GROUPS.DELETE_BY_ID(groupId)
      );
      return response.data;
    } catch (error) {
      console.error("Error al crear el grupo:", error);
      throw error;
    }
  },

  createSubjectGroups: async (subjectGroupsData) => {
    try {
      const response = await request("POST",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.KNOWLEDGES.SUBJECTS.GROUP.CREATE,
        subjectGroupsData);
      return response.data;
    } catch (error) {
      console.error("Error al crear el saber:", error);
      throw error;
    }
  },

  updateSubjectGroups: async (subjectGroupsId, subjectGroupsData) => {
    try {
      const response = await request("PUT",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.KNOWLEDGES.SUBJECTS.GROUP.UPDATE_BY_ID(subjectGroupsId),
        subjectGroupsData);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar el saber", error);
      throw error;
    }
  },

  getAllSubjectGroupsByPeriodAndGroup: async (periodId, groupId) => {
    try {
      const response = await request(
        'GET',
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.KNOWLEDGES.
          SUBJECTS.GROUP.GET_ALL_BY_PERIOD_AND_GROUP(periodId, groupId)
      );

      if (response.status !== 200) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      console.error("Error al obtener grupos activos:", error);
      throw error;
    }
  },

  getAllSubjectGroupsByPeriodAndSubjectAndGroup: async (periodId, subjectId, groupId) => {
    try {
      const response = await request(
        'GET',
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.KNOWLEDGES.
          SUBJECTS.GET_ALL_BY_PERIOD_AND_SUBJECT_AND_GROUP(periodId, subjectId, groupId)
      );

      if (response.status !== 200) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      console.error("Error al obtener grupos activos:", error);
      throw error;
    }
  },

  //Users

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

  //Relación subjectProfessor

  getSubjectProfessors: async () => {
    try {
      const response = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.SUBJECTS.PROFESSORS.GET_ALL,
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

  deleteSubjectProfessor: async (id) => {
    try {
      await request(
        "DELETE",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.SUBJECTS.PROFESSORS.UPDATE_BY_ID(id)
      );
      return true;
    } catch (error) {
      console.error("Error al eliminar la relación profesor-asignatura:", error);
      throw error;
    }
  },
  
  createSubjectProfessors: async (subjectProfessorsData) => {
    try {
      const response = await request("POST",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.SUBJECTS.PROFESSORS.CREATE,
        subjectProfessorsData);
      return response.data;
    } catch (error) {
      console.error("Error al crear el saber:", error);
      throw error;
    }
  },

  updateSubjectProfessors: async (subjectProfessorsId, subjectProfessorsData) => {
    try {
      const response = await request("PUT",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.SUBJECTS.PROFESSORS.UPDATE_BY_ID(subjectProfessorsId),
        subjectProfessorsData);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar el saber", error);
      throw error;
    }
  },


};






export default configurationService;
