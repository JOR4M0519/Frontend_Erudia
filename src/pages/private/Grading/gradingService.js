
import apiEndpoints from "../../../Constants/api-endpoints";
import { request } from "../../../services/config/axios_helper";

export const gradingService = {

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

};

export default gradingService;
