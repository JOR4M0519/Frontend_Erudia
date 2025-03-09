import Swal from "sweetalert2";
import { request } from "../../../../services/config/axios_helper";


export const attendanceService = {
  // Obtener todos los seguimientos de estudiantes
   // Nuevo método para obtener el historial de asistencia para un grupo y materia
   async getAttendanceHistoryForGroup(group, subject, period) {
    try {
      const response = await request(
        'GET', 
        'academy', 
        `/attendance/groups/${group}/subjects/${subject}/periods/${period}/users`
      );
      
      if (response.status !== 200) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      throw error;
    }
  },

    
  // Método para guardar/actualizar la asistencia
  async saveAttendanceRecords(attendanceData) {
    try {
      const response = await request(
        'POST',
        'academy',
        '/attendance/save',
        attendanceData
      );
      
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return response.data;
    } catch (error) {
      console.error("Error saving attendance records:", error);
      throw error;
    }
  },

}

