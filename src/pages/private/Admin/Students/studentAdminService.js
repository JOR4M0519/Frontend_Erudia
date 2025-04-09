import apiEndpoints from "../../../../Constants/api-endpoints";
import { request } from "../../../../services/config/axios_helper";


export const studentAdminService = {

    async getAcademicLevelReport() {
        try {
            const response = await request(
                'GET',
                'academy',
                `/groups/students/status`
            );

            if (response.status !== 200) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return response.data;
        } catch (error) {
            console.error("Error getting data info:", error);
            throw error;
        }
    },

    async getAttendanceGroupReport() {
        try {
            const response = await request(
                'GET',
                'academy',
                `/groups/students/attendance`
            );

            if (response.status !== 200) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return response.data;
        } catch (error) {
            console.error("Error getting data info:", error);
            throw error;
        }
    },

    async getRepeatingStudentsReport() {
        try {
            const response = await request(
                'GET',
                'academy',
                `/groups/students/repeating`
            );

            if (response.status !== 200) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return response.data;
        } catch (error) {
            console.error("Error getting data info:", error);
            throw error;
        }
    },

    async getStudentsByGroups() {
        try {
            const response = await request(
                'GET',
                apiEndpoints.SERVICES.ACADEMY,
                apiEndpoints.API_ENDPOINTS.GROUPS.STUDENT_GROUPS_ALL
            );

            if (response.status !== 200) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return response.data;
        } catch (error) {
            console.error("Error getting data info:", error);
            throw error;
        }
    },

    async updatePromotionStatus(user) {
        try {
            const response = await request(
                'PATCH',
                apiEndpoints.SERVICES.ACADEMY,
                `/users/detail/${user.id}/promotion-status?promotionStatus=${user.promotionStatus}`
            );
    
            if (response.status !== 200) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
    
            return response.data;
        } catch (error) {
            console.error("Error al actualizar el estado de promoción:", error);
            throw error;
        }
    },
    
    async updateBulkPromotionStatus(users) {
        try {
            const response = await request(
                'PATCH',
                'academy',
                `/users/detail/bulk-promotion-status`,
                users
            );
    
            if (response.status !== 200) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
    
            return response.data;
        } catch (error) {
            console.error("Error al actualizar estados de promoción en masa:", error);
            throw error;
        }
    },

    async getActiveGroups() {
        try {
            const response = await request(
                'GET',
                apiEndpoints.SERVICES.ACADEMY,
                apiEndpoints.API_ENDPOINTS.GROUPS.ACTIVE_ALL
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

    // Crear estudiante y asignarlo a un grupo
    async createStudentFetchingGroup(userData) {
        try {
            const response = await request(
                'POST',
                'academy',
                '/users/detail/students/register',
                userData
            );
            // const response = await request(
            //     'POST',
            //     apiEndpoints.SERVICES.GATEAWAY,
            //     apiEndpoints.API_ENDPOINTS.USER.CREATE_STUDENT_GTW,
            //     userData
            // );
            if (response.status !== 200) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
    
            return response.data;
        } catch (error) {
            console.error("Error al crear estudiante:", error);
            throw error;
        }
    },

     // Crear estudiante y asignarlo a un grupo
     async getIdTypes() {
        try {
            const response = await request(
                'GET',
                'academy',
                '/id-types'
            );
    
            if (response.status !== 200) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
    
            return response.data;
        } catch (error) {
            console.error("Error al crear estudiante:", error);
            throw error;
        }
    },

/**
 * Promueve un grupo de estudiantes al grupo destino especificado
 * @param {Object} promotionData - Datos de promoción
 * @param {Array<number>} promotionData.studentIds - IDs de los estudiantes a promover
 * @param {number} promotionData.targetGroupId - ID del grupo destino
 * @returns {Promise<Object>} - Resultado de la operación de promoción
 */
async promoteStudents(promotionData) {
    try {
        // Validaciones del lado del cliente
        if (!promotionData.studentIds || promotionData.studentIds.length === 0) {
            return {
                success: false,
                message: "Debe seleccionar al menos un estudiante para promover"
            };
        }

        if (!promotionData.targetGroupId) {
            return {
                success: false,
                message: "Debe seleccionar un grupo destino"
            };
        }

        const response = await request(
            'POST',
            'academy',
            '/student-groups/promote',
            promotionData
        );

        return {
            success: true,
            data: response.data,
            message: `Se han promovido ${response.data.length} estudiantes exitosamente`
        };
    } catch (error) {
        // Manejo detallado de errores según el tipo
        if (error.response) {
            const status = error.response.status;
            let errorMessage = error.response.data?.message || "Error en la promoción de estudiantes";
            
            // Personalizar mensajes según el código de estado
            switch (status) {
                case 409: // CONFLICT
                    errorMessage = "Uno o más estudiantes ya están asignados al grupo destino";
                    break;
                case 426: // UPGRADE_REQUIRED
                    errorMessage = "Uno o más estudiantes no están activos para promoción";
                    break;
                case 400: // BAD_REQUEST
                    errorMessage = "Datos de promoción inválidos";
                    break;
            }
            
            console.error(`Error ${status}: ${errorMessage}`);
            
            return {
                success: false,
                message: errorMessage,
                errorCode: status,
                details: error.response.data
            };
        } else if (error.request) {
            console.error("No se recibió respuesta del servidor");
            return {
                success: false,
                message: "No se pudo conectar con el servidor. Verifique su conexión a internet."
            };
        } else {
            console.error("Error al configurar la solicitud:", error.message);
            return {
                success: false,
                message: "Error al procesar la solicitud de promoción"
            };
        }
    }
}

    
  
  // 
  

}