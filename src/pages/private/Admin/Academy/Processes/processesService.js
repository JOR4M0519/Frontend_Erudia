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

        downloadGroupReport: async (groupId, periodId) => {
          try {
            const response = await request(
              "GET",
              apiEndpoints.SERVICES.ACADEMY,
              apiEndpoints.API_ENDPOINTS.EVALUATION.REPORTS.DOWNLOAD_GROUP_REPORT(groupId,periodId)
            );
        
            if (!response.ok) {
              throw new Error(`Error: ${response.status}`);
            }
        
            // Verificar el tipo de contenido para determinar si es un ZIP o un PDF
            const contentType = response.headers.get("Content-Type");
            const contentDisposition = response.headers.get("Content-Disposition");
            const filename = contentDisposition
              ? contentDisposition.split("filename=")[1].replace(/"/g, "")
              : "report";
        
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            
            return { success: true, message: "Reporte descargado exitosamente" };
          } catch (error) {
            console.error("Error downloading report:", error);
            return { success: false, message: `Error al descargar el reporte: ${error.message}` };
          }
        },
        
        downloadStudentReport: async (studentId, periodId) => {
          try {
            const response = await request(
              "GET",
              apiEndpoints.SERVICES.ACADEMY,
              apiEndpoints.API_ENDPOINTS.EVALUATION.REPORTS.DOWNLOAD_STUDENT_REPORT(groupId,periodId)
            );
        
            if (!response.ok) {
              throw new Error(`Error: ${response.status}`);
            }
        
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `student_${studentId}_report.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            
            return { success: true, message: "Reporte descargado exitosamente" };
          } catch (error) {
            console.error("Error downloading report:", error);
            return { success: false, message: `Error al descargar el reporte: ${error.message}` };
          }
        },
       // Corregido para manejar correctamente la respuesta del endpoint PDF
      // downloadGroupReport: async (groupId, periodId) => {
      //     try {
      //       const response = await request(
      //         "GET",
      //         apiEndpoints.SERVICES.ACADEMY,
      //         apiEndpoints.API_ENDPOINTS.EVALUATION.REPORTS.DOWNLOAD_GROUP_REPORT(groupId, periodId),
      //         {},
      //         { responseType: 'blob' }
      //       );
            
      //       // Crear una URL para el blob
      //       const blob = new Blob([response.data], { type: 'application/pdf' });
      //       const url = window.URL.createObjectURL(blob);
            
      //       // Crear enlace y simular clic para descargar
      //       const a = document.createElement("a");
      //       a.href = url;
      //       a.download = `group_${groupId}_report.pdf`;
      //       document.body.appendChild(a);
      //       a.click();
      //       a.remove();
      //       window.URL.revokeObjectURL(url);
            
      //       return { success: true, message: "Reporte descargado exitosamente" };
      //     } catch (error) {
      //       console.error("Error downloading report:", error);
      //       return { success: false, message: `Error al descargar el reporte: ${error.message}` };
      //     }
      // },
        
      // downloadStudentReport: async (studentId, groupId, periodId) => {
      //     try {
      //       const response = await request(
      //         "GET",
      //         apiEndpoints.SERVICES.ACADEMY,
      //         apiEndpoints.API_ENDPOINTS.EVALUATION.REPORTS.DOWNLOAD_STUDENT_REPORT(studentId, periodId),
      //         {},
      //         { responseType: 'blob' }
      //       );
            
      //       // Crear una URL para el blob
      //       const blob = new Blob([response.data], { type: 'application/pdf' });
      //       const url = window.URL.createObjectURL(blob);
            
      //       // Crear enlace y simular clic para descargar
      //       const a = document.createElement("a");
      //       a.href = url;
      //       a.download = `student_${studentId}_report.pdf`;
      //       document.body.appendChild(a);
      //       a.click();
      //       a.remove();
      //       window.URL.revokeObjectURL(url);
            
      //       return { success: true, message: "Reporte descargado exitosamente" };
      //     } catch (error) {
      //       console.error("Error downloading report:", error);
      //       return { success: false, message: `Error al descargar el reporte: ${error.message}` };
      //     }
      // },
      
      // viewReportOnline: async (id, periodId, reportType) => {
      //     try {
      //       // Determinar la URL según el tipo de reporte
      //       const endpoint = reportType === "group" 
      //         ? `${apiEndpoints.SERVICES.ACADEMY}${apiEndpoints.API_ACADEMIC_REPORTS.GROUP_REPORT_ONLINE}`
      //             .replace("{groupId}", id)
      //             .replace("{periodId}", periodId)
      //         : `${apiEndpoints.SERVICES.ACADEMY}${apiEndpoints.API_ACADEMIC_REPORTS.STUDENT_REPORT_ONLINE}`
      //             .replace("{studentId}", id)
      //             .replace("{periodId}", periodId);
            
      //       // Abrir en una nueva pestaña
      //       window.open(endpoint, '_blank');
            
      //       return { 
      //         success: true, 
      //         message: "Reporte abierto en una nueva pestaña" 
      //       };
      //     } catch (error) {
      //       console.error("Error viewing report online:", error);
      //       return { success: false, message: `Error al abrir el reporte: ${error.message}` };
      //     }
      // },
        
      downloadGroupReport: async (groupId, periodId) => {
        try {
            const response = await request(
                "GET",
                apiEndpoints.SERVICES.ACADEMY,
                apiEndpoints.API_ENDPOINTS.EVALUATION.REPORTS.DOWNLOAD_GROUP_REPORT(groupId, periodId),
                {},
                { responseType: 'blob' } // Especificar formato blob para archivos
            );
            
            // Crear blob y URL para descarga
            const blob = new Blob([response.data], { 
                type: response.headers['content-type'] || 'application/pdf' 
            });
            const url = window.URL.createObjectURL(blob);
            
            // Crear enlace y simular clic para descarga
            const a = document.createElement("a");
            a.href = url;
            a.download = `boletines_grupo_${groupId}_periodo_${periodId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            console.log(response)
            return { 
                success: true, 
                message: "Reporte descargado exitosamente",
                viewOption: "download"
            };
        } catch (error) {
            console.error("Error downloading group report:", error);
            return { 
                success: false, 
                message: `Error al descargar el reporte: ${error.message}` 
            };
        }
    },
    
    downloadStudentReport: async (studentId, groupId, periodId) => {
        try {
            const response = await request(
                "GET",
                apiEndpoints.SERVICES.ACADEMY,
                apiEndpoints.API_ENDPOINTS.EVALUATION.REPORTS.DOWNLOAD_STUDENT_REPORT(studentId, groupId, periodId),
                {},
                { responseType: 'blob' }
            );
            
            // Crear blob y URL para descarga
            const blob = new Blob([response.data], { 
                type: response.headers['content-type'] || 'application/pdf' 
            });
            const url = window.URL.createObjectURL(blob);
            
            // Crear enlace y simular clic para descarga
            const a = document.createElement("a");
            a.href = url;
            a.download = `boletin_estudiante_${studentId}_periodo_${periodId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            return { 
                success: true, 
                message: "Reporte descargado exitosamente",
                viewOption: "download"
            };
        } catch (error) {
            console.error("Error downloading student report:", error);
            return { 
                success: false, 
                message: `Error al descargar el reporte: ${error.message}` 
            };
        }
    },
    
    viewReportOnline: async (id, periodId, reportType) => {
        try {
            // Determinar la URL según el tipo de reporte
            let endpoint;
            
            if (reportType === "group") {
                endpoint = `${apiEndpoints.SERVICES.ACADEMY}${apiEndpoints.API_ENDPOINTS.EVALUATION.REPORTS.VIEW_GROUP_REPORT_ONLINE(id, periodId)}`;
            } else {
                endpoint = `${apiEndpoints.SERVICES.ACADEMY}${apiEndpoints.API_ENDPOINTS.EVALUATION.REPORTS.VIEW_STUDENT_REPORT_ONLINE(id, periodId)}`;
            }
            
            // Abrir en una nueva pestaña
            window.open(endpoint, '_blank');
            
            return { 
                success: true, 
                message: "Reporte abierto en una nueva pestaña",
                viewOption: "online"
            };
        } catch (error) {
            console.error("Error viewing report online:", error);
            return { 
                success: false, 
                message: `Error al abrir el reporte: ${error.message}` 
            };
        }
    },

};

export default processesService;
