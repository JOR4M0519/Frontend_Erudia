import apiEndpoints from "../../../../../Constants/api-endpoints";
import { StudentGroupModel } from "../../../../../models";
import { request } from "../../../../../services/config/axios_helper";

export const processesService = {

      getActivePeriodsByYear: async (year) => {
        try {
           const response = await request(
                    "GET",
                    apiEndpoints.SERVICES.ACADEMY,
                    apiEndpoints.API_ENDPOINTS.PERIODS.GET_ALL_BY_YEAR_ACTIVE(year),
                    {});
          return response.data;
        } catch (error) {
          console.error("Error al obtener períodos:", error);
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

};

export default processesService;
