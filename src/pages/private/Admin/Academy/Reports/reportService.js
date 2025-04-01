import apiEndpoints from "../../../../../Constants/api-endpoints";
import { StudentGroupModel } from "../../../../../models";
import { request } from "../../../../../services/config/axios_helper";

export const reportService = {

    getSubjectsByDimension: async () => {
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

    getPeriods: async (year) => {
      //let year = new Date().getFullYear();
      try {
        const response = await request(
          "GET",
          apiEndpoints.SERVICES.ACADEMY,
          apiEndpoints.API_ENDPOINTS.PERIODS.GET_ALL_BY_YEAR_ACTIVE(year),
          {});
        if (response.status === 200 && response.data.length > 0) {
          return response.data;
        }
      } catch (error) {
        console.error("Error durante la carga de períodos:", error);
      }
    },

      // Obtener reporte de recuperación
  getRecoveryReport: async (subjectId, levelId, year) => {
    try {
      const response = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.RECOVERY.REPORT(subjectId, levelId, year),
        {},
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener reporte de recuperación:", error);
      throw error;
    }
  },


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

    // Nuevo método para obtener la distribución de notas
    getGradeDistribution: async (year, periodId, levelId, subjectId) => {
      try {
          const response = await request(
              "GET",
              apiEndpoints.SERVICES.ACADEMY,
              apiEndpoints.API_ENDPOINTS.EVALUATION.GRADE_DISTRIBUTION(year,periodId,levelId,subjectId)
          );
          return response.data;
      } catch (error) {
          console.error("Error fetching grade distribution:", error);
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

  fetchListUsersGroupData: async (groupId) => {
    try {
     
      const responseGroupsStudents = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.GROUPS.STUDENT_GROUPS_BY_GROUPID(groupId),
        {}
      );

      if (responseGroupsStudents.status === 200 && responseGroupsStudents.data.length > 0) {
        const studentGroupList = new StudentGroupModel(responseGroupsStudents.data[0]); //  Instancia base
        studentGroupList.addStudents(responseGroupsStudents.data); //  Agrega estudiantes


        return studentGroupList.toJSON()
      }
    } catch (error) {
      console.error("Error cargando lista de estudiantes:", error);
    }
  },

  recoverStudent: async (idStudent, idSubject, idPeriod, newScore) => {
    try {
      const response = await request(
        "POST",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.RECOVERY.
        CREATE_RECOVER_SUBJECT_BY_STUDENT(
          idStudent,
          idSubject,
          idPeriod,
          newScore),
        {},
        {
          params: {
            idStudent,
            idSubject,
            idPeriod,
            newScore
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al registrar recuperación:", error);
      throw error;
    }
  },

  editRecoveryStudent: async (recoveryId, newScore, status) => {
    try {
      // Verificar que los parámetros no sean undefined
      if (newScore === undefined || status === undefined) {
        throw new Error("Los parámetros newScore y status son obligatorios");
      }
      
      const response = await request(
        "PUT",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.RECOVERY.EDIT_RECOVER_SUBJECT_BY_STUDENT(recoveryId, newScore, status),
        {},
        {
          params: {
            newScore,
            status
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al editar recuperación:", error);
      throw error;
    }
  },
  
  // Eliminar recuperación de estudiante
  deleteRecoveryStudent: async (recoveryId) => {
    try {
      const response = await request(
        "DELETE",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.EVALUATION.RECOVERY.DELETE_RECOVER_SUBJECT_BY_STUDENT(recoveryId),
        {}
      );
      return response.data;
    } catch (error) {
      console.error("Error al eliminar recuperación:", error);
      throw error;
    }
  },



};

export default reportService;
