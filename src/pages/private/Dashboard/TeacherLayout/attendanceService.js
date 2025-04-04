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

    
  // Método para guardar un solo registro de asistencia
  async saveAttendanceRecord(record) {
    try {
      const response = await request(
        'POST',
        'academy',
        '/attendance',
        [record] // Enviamos como array de un solo elemento para mantener consistencia con la API
      );
      
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return response.data;
    } catch (error) {
      console.error("Error saving single attendance record:", error);
      throw error;
    }
  },
    
    // Método para guardar múltiples registros (nuevo)
    async saveAttendanceBatch(attendanceRecords, groupId, subjectId, professorId, periodId) {
        try {
            console.log('Enviando registros:', {
                attendanceRecords,
                groupId,
                subjectId,
                professorId,
                periodId
            });
            
            const response = await request(
                'POST',
                'academy',
                `/attendance/groups/${groupId}/subjects/${subjectId}/professors/${professorId}/periods/${periodId}/batch`,
                attendanceRecords
            );
            
            if (response.status !== 200 && response.status !== 201) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            return response.data;
        } catch (error) {
            console.error("Error saving attendance batch:", error);
            throw error;
        }
    },
    
      // Método para actualizar múltiples registros
      async updateAttendanceBatch(attendanceRecords) {
        try {
          const response = await request(
            'PUT',
            'academy',
            '/attendance/batch',
            attendanceRecords
          );
          
          if (response.status !== 200) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          return response.data;
        } catch (error) {
          console.error("Error updating attendance batch:", error);
          throw error;
        }
      },
    
      // Método para eliminar registros de un día específico
     // Método para eliminar registros por IDs
async deleteAttendanceByDate(attendanceIds) {
    try {
        const response = await request(
            'DELETE',
            'academy',
            `/attendance/batch`,
            attendanceIds // Enviamos directamente el array de IDs
        );
        
        if (response.status !== 200) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        return response.data;
    } catch (error) {
        console.error("Error deleting attendance records:", error);
        throw error;
    }
},

}

