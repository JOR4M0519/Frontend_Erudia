import Swal from "sweetalert2";
import { StudentTrackingModel } from "../../../models";
import { request } from "../../../services/config/axios_helper";

export const studentTrackingService = {
  // Obtener todos los seguimientos de estudiantes
  getAllStudentTrackings: async () => {
    try {
      const response = await request("GET", "academy", "/student-tracking");
      return response.data;
    } catch (error) {
      console.error('Error al obtener seguimientos de estudiantes:', error);
      throw error;
    }
  },


  // Crear un nuevo seguimiento de estudiante
  createStudentTracking: async (trackingData) => {
    try {
      const response = await request(
        "POST",
        "academy",
        "/student-tracking",
        trackingData
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al crear seguimiento de estudiante:', error);
      throw error;
    }
  },

  getStudentListObservations: async (teacherId) => {
    try {
      const responseObservations = await request(
        "GET",
        "academy",
        `/student-tracking/teachers/${teacherId}`,
        {}
      );

      if (responseObservations.status === 200 && Array.isArray(responseObservations.data)) {
        return responseObservations.data.map((obs) => new StudentTrackingModel(obs).toJSON());
      }
    } catch (error) {
      console.error("Error cargando datos del profesor:", error);
    }
  },

    /**
   *  Obtiene todas las observaciones de un estudiante  
  */
    getStudentObservations: async (studentId) => {
        try {
          const response = await request(
            "GET",
            "academy",
            `/student-tracking/students/${studentId}`,
            {}
          );
    
          if (response.status === 200) {
            return response.data.map((data) => ({
              
              id: data.id,
              title: "Observador",
              date: data.date ? new Date(data.date).toLocaleDateString() : "-",
              teacher: data.professor ?? "Desconocido",
              situation: data.situation ?? "Sin información",
              commitment: data.compromise ?? "Sin compromiso",
              followUp: data.followUp ?? "Sin seguimiento",
              status: data.status ?? "Pendiente",
            }));
          }
    
          return [];
        } catch (error) {
          console.error("Error al obtener observaciones:", error);
          return [];
        }
      },

  // Actualizar un seguimiento existente
  updateStudentTracking: async (id, trackingData) => {
    try {
      const response = await request(
        "PUT", 
        "academy", 
        `/student-tracking/${id}`, 
        trackingData
      );
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar seguimiento de estudiante con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un seguimiento
  deleteStudentTracking: async (id) => {
    try {
      const response = await request("DELETE", "academy", `/student-tracking/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar seguimiento de estudiante con ID ${id}:`, error);
      throw error;
    }
  },

  handleDelete: async (id,routeBefore = null) => {
      if (!id) {
        console.error("ID de seguimiento no proporcionado");
        return;
      }
    
      // Usar SweetAlert2 para confirmar la eliminación
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede revertir",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });
    
      if (result.isConfirmed) {
        try {
          // Mostrar spinner durante la eliminación usando el componente predeterminado de SweetAlert
          Swal.fire({
            title: 'Eliminando seguimiento',
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });
    
          // Llamar al método de eliminación
          await studentTrackingService.deleteStudentTracking(id);
          
          // Mostrar mensaje de éxito
          Swal.fire({
            title: 'Eliminado',
            text: 'El seguimiento ha sido eliminado correctamente',
            icon: 'success',
            confirmButtonText: 'Continuar'
          }).then(() => {
            // Volver a la lista
            if(routeBefore){
              routeBefore();  
            }
            
          });
        } catch (error) {
          console.error("Error al eliminar el seguimiento:", error);
          
          Swal.fire({
            title: 'Error',
            text: `Error al eliminar el seguimiento: ${error.message || 'Intenta nuevamente'}`,
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
        }
      }
    },

  // Obtener tipos de seguimiento
  getTrackingTypes: async () => {
    try {
      const response = await request("GET", "academy", "/tracking-types");
      return response.data || [];
    } catch (error) {
      console.error("Error al cargar tipos de seguimiento:", error);
      throw error;
    }
  }
};
