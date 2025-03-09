import { request } from "../../../services/config/axios_helper";

export const activityService = {
  /**
   * Obtiene el esquema de evaluación para un grupo, periodo y materia específicos
   * @param {string} periodId - ID del periodo académico
   * @param {string} subjectId - ID de la materia
   * @param {string} groupId - ID del grupo
   * @returns {Promise} - Promesa con los datos del esquema de evaluación
   */
  getEvaluationScheme: async (periodId, subjectId, groupId,) => {
    try {
      const response = await request(
        "GET",
        "academy",
        `/achievements-group/periods/${periodId}/subjects/${subjectId}/groups/${groupId}`
      );

      if (response.status === 200 && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data.map(transformSchemeData)
        };
      }
      return {
        success: false,
        data: [],
        message: "No se encontraron datos del esquema de evaluación"
      };
    } catch (error) {
      console.error("Error obteniendo esquema de evaluación:", error);
      return {
        success: false,
        data: [],
        message: "Error al cargar el esquema de evaluación",
        error
      };
    }
  },

  /**
   * Actualiza un logro específico
   * @param {string} achievementId - ID del logro a actualizar
   * @param {Object} achievementData - Datos completos del logro
   * @returns {Promise} - Promesa con el resultado de la actualización
   */
  updateAchievement: async (achievementId, achievementData) => {
    try {
      const response = await request(
        "PUT",
        "academy",
        `/achievements-group/${achievementId}`,
        achievementData
      );

      return {
        success: response.status === 200,
        data: response.data,
        message: "Logro actualizado correctamente"
      };
    } catch (error) {
      console.error("Error al actualizar el logro:", error);
      return {
        success: false,
        message: "No se pudo actualizar el logro",
        error
      };
    }
  },
  /**
   * Creates a new activity
   * @param {Object} activityData - The activity data
   * @returns {Promise} - Promise with the created activity data
   */
  createActivity: async (activityData) => {
    try {
      const response = await request(
        "POST",
        "academy",
        "/activities",
        {
          activityName: activityData.name,
          description: activityData.description,
          startDate: activityData.startDate,
          endDate: activityData.endDate,
          group: {
            id: activityData.groupId
          },
          achievementGroup: {
            id: activityData.achievementId
          },
          status: activityData.status || "A"
        }
      );

      // Transformar la respuesta para que coincida con el formato esperado por ActivitiesList
      const transformedData = {
        id: response.data.id,
        name: response.data.activityName,
        description: response.data.description,
        startDate: response.data.startDate,
        endDate: response.data.endDate,
        status: response.data.status,
        group: response.data.group,
        achievementGroup: response.data.achievementGroup,
        score: response.data.score || []
      };
      return {
        success: response.status === 201 || response.status === 200,
        data: transformedData,
        message: "Actividad creada correctamente"
      };
    } catch (error) {
      console.error("Error al crear la actividad:", error);
      return {
        success: false,
        message: "No se pudo crear la actividad",
        error
      };
    }
  },

  /**
   * Updates an existing activity
   * @param {Object} activityData - The activity data to update
   * @returns {Promise} - Promise with the updated activity data
   */
  updateActivity: async (activityData) => {
    try {
      console.log("Datos enviados al servidor:", activityData); // Para debugging

      const response = await request(
        "PUT",
        "academy",
        `/activities/${activityData.id}`,
        {
          activityName: activityData.name,
          description: activityData.description,
          startDate: activityData.startDate,
          endDate: activityData.endDate,
          status: activityData.status,
          group: {
            id: activityData.groupId
          },
          achievementGroup: activityData.achievementGroup
        }
      );

      // Transformar la respuesta para mantener consistencia con el formato
      const transformedData = {
        id: response.data.id,
        name: response.data.activityName || activityData.name,
        description: response.data.description,
        startDate: response.data.startDate || activityData.startDate,
        endDate: response.data.endDate || activityData.endDate,
        status: response.data.status,
        group: response.data.group || activityData.group,
        achievementGroup: response.data.achievementGroup,
        achievementGroupId: response.data.achievementGroup?.id,
        score: response.data.score || []
      };

      console.log("Datos transformados:", transformedData); // Para debugging

      return {
        success: response.status === 200,
        data: transformedData,
        message: "Actividad actualizada correctamente"
      };
    } catch (error) {
      console.error("Error al actualizar la actividad:", error);
      return {
        success: false,
        message: "No se pudo actualizar la actividad",
        error
      };
    }
  },

  

  /**
   * Deletes an activity
   * @param {string|number} activityId - The ID of the activity to delete
   * @returns {Promise} - Promise with the deletion result
   */
  deleteActivity: async (activityId) => {
    try {
      const response = await request(
        "DELETE",
        "academy",
        `/activities/${activityId}`
      );

      return {
        success: response.status === 204,
        message: "Actividad eliminada correctamente"
      };
    } catch (error) {
      console.error("Error al eliminar la actividad:", error);
      return {
        success: false,
        message: "No se pudo eliminar la actividad",
        error
      };
    }
  },

  getKnowledgesBySubject: async (periodId,subjectId) =>{
    
    const response = await request(
      "GET",
      "academy",
      `/subject_knowledge/periods/${periodId}/subjects/${subjectId}`,
      {}
    );
    try{
      if (response.status === 200 ) {
        return  response.data.map((knowledge) => ({
          subjectKnowledgeId: knowledge.id,
          knowledge:{
            id:         knowledge.idKnowledge.id,
            name:       knowledge.idKnowledge.name,
            percentage: knowledge.idKnowledge.percentage
          }
        }));
        
      }
    } catch (error) {
    console.error("Error cargando datos del profesor:", error);
  }

    return []
  },

    /**
   * Updates the knowledge associated with a subject
   * @param {string} subjectKnowledgeId - ID of the subject knowledge relationship
   * @param {string} subjectId - ID of the subject
   * @param {string} knowledgeId - ID of the knowledge
   * @returns {Promise} - Promise with the update result
   */
    updateActivityAchievement: async (achievementGroupId,subjectKnowledgeId,groupId,periodId,achievement ) => {
      try {
        const response = await request(
          "PUT",
          "academy",
          `/achievements-group/${achievementGroupId}`,
          {
            id: achievementGroupId,
            subjectKnowledge: {id: subjectKnowledgeId},
            group : {id: groupId}, 
            period : {id: periodId},
            achievement
          }
        );
  
        return {
          success: response.status === 200,
          data: response.data,
          message: "Conocimiento de la materia actualizado correctamente"
        };
      } catch (error) {
        console.error("Error al actualizar el conocimiento de la materia:", error);
        return {
          success: false,
          message: "No se pudo actualizar el conocimiento de la materia",
          error
        };
      }
    },
  
    /**
 * Saves activity scores for multiple students
 * @param {string} activityId - ID of the activity
 * @param {Array} gradesData - Array of student grades data
 * @returns {Promise} - Promise with the save result
 */
    saveActivityScores: async (activityId, gradesData) => {
      try {
          const results = [];
          const errors = [];
  
          // Procesar cada calificación de estudiante de forma secuencial
          for (const gradeData of gradesData) {
              try {
                  const requestData = {
                      id: gradeData.id || null, // Incluimos el ID si existe
                      activity: gradeData.activity,
                      student: {
                          id: gradeData.studentId
                      },
                      score: gradeData.score ? parseFloat(gradeData.score) : null,
                      comment: gradeData.comment || ""
                  };
  
                  const response = await request(
                      "PUT", // Si hay ID usamos PUT, si no POST
                      "academy",
                       `/activity-grade/${gradeData.id}`,
                      requestData
                  );
  
                  if (response.status === 200 || response.status === 201) {
                      results.push({
                          studentId: gradeData.studentId,
                          success: true,
                          data: response.data
                      });
                  } else {
                      errors.push({
                          studentId: gradeData.studentId,
                          message: "Error al guardar la calificación"
                      });
                  }
              } catch (error) {
                  console.error(`Error guardando calificación para estudiante ${gradeData.studentId}:`, error);
                  errors.push({
                      studentId: gradeData.studentId,
                      message: error.message || "Error desconocido"
                  });
              }
          }
  
          // Si hay errores, lanzar una excepción con el detalle
          if (errors.length > 0) {
              throw new Error(`Errores al guardar calificaciones: ${errors.length} de ${gradesData.length} fallaron.`);
          }
  
          return {
              success: true,
              message: "Todas las calificaciones fueron guardadas correctamente",
              data: results
          };
      } catch (error) {
          console.error("Error en el proceso de guardado de calificaciones:", error);
          return {
              success: false,
              message: error.message || "Error al guardar las calificaciones",
              error
          };
      }
  },

};




/**
 * Transforma los datos del esquema de evaluación al formato requerido por el componente
 * @param {Object} data - Datos crudos del esquema de evaluación
 * @returns {Object} - Datos transformados
 */
const transformSchemeData = (data) => ({
  id: data.id,
  subjectKnowledgeId: data.subjectKnowledge.id,
  groupId: data.group.id,
  periodId: data.period.id,
  knowledge: {
    id: data.subjectKnowledge?.idKnowledge?.id || "N/A",
    name: data.subjectKnowledge?.idKnowledge?.name || "Desconocido",
    percentage: data.subjectKnowledge?.idKnowledge?.percentage || "0",
  },
  achievement: {
    id: data.id,
    description: data.achievement || "Sin descripción",
  },
}
);

