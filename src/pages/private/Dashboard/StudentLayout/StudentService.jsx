import { BehaviorSubject, filter, firstValueFrom, identity } from "rxjs";
import { request } from "../../../../services/config/axios_helper"; // Importamos el request para las peticiones
import { State, StudentGroupModel, StudentTrackingModel } from "../../../../models";
import { TeacherGroupModel } from "../../../../models/TeacherGroupModel";
import { StudentTracking } from "../../StudentTracking";
import { studentTrackingService } from "../../StudentTracking/studentTrackingService";
import apiEndpoints from "../../../../Constants/api-endpoints";


  /**
 * Obtiene las notas de todos los estudiantes de un grupo para una actividad específica.
 * @param {number} activityId - ID de la actividad
 * @param {number} groupId - ID del grupo
 * @returns {Promise<Array>} - Lista de calificaciones con información del estudiante
 */
  const getActivitiesScoresForGroup =  async (activityId, groupId) => {
    try {
      const response = await request(
        "GET",
        "academy",
        `/activity-grade/activities/${activityId}/groups/${groupId}`,
        {}
      );
  
      if (response.status === 200 && Array.isArray(response.data)) {
        return response.data.map((grade) => ({
          id: grade.id,
          studentId: grade.student.id,
          firstName: grade.student.firstName,
          lastName: grade.student.lastName,
          score: grade.score ?? "-",
          comment: grade.comment ?? "-",
        }));
      }
  
      return [];
    } catch (error) {
      console.error(`Error al obtener las notas del grupo ${groupId} para la actividad ${activityId}:`, error);
      return [];
    }
  }

  /**
   * Actividades
   * obtiene los detalles de una actividad 
   * en especifico sin importar si esta o no calificada
   * 
  */
const getActivityDetails = async(activityId,studentId) =>{
  try {

    const response = await request(
      "GET",
      "academy",
      `/activity-group/activities/${activityId}`,
      {}
    );

    //Posteriormente obtiene la calificación si la tiene
    if (response.status === 200) {
      const data = response.data;
      const grade = await getActivityScore(data.id, studentId);
      return {
        id:          activityId,
        name:        data.activity.activityName,
        description: data.activity.description,
        knowledge:   data.activity.achievementGroup?.subjectKnowledge?.idKnowledge ?? "-",
        achievement: data.activity.achievementGroup?.achievement ?? "-",
        startDate:   data.startDate,
        endDate:     data.endDate,
        score:       grade?.score ?? "-",   // Verifica si `grade` existe antes de acceder a `score`
        comment:     grade?.comment ?? "-",
        status:      data.activity.status ?? "Sin estado",
      };
    }

    return [];
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    return [];
  }
}

/**
 * Función genérica para obtener actividades de una materia en un período
 * @param {string} subjectId - ID de la materia
 * @param {string} periodId - ID del período
 * @param {string} groupId - ID del grupo
 * @param {string} userId - ID del usuario
 * @param {boolean} isTeacher - Indica si es profesor
 */
const fetchActivities = async (subjectId, periodId, groupId, userId, isTeacher=false) => {
  try {
    let response;
    if(!!isTeacher){
      response = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.ACTIVITIES.GET_ALL_BY_PERIOD_AND_SUBJECT_PROFESSOR_AND_GROUP(periodId,subjectId,groupId),
        {}
      );
      }else{
        response = await request(
          "GET",
          apiEndpoints.SERVICES.ACADEMY,
          apiEndpoints.API_ENDPOINTS.ACTIVITIES.GET_ALL_BY_PERIOD_AND_SUBJECT_AND_GROUP(periodId,subjectId,groupId),
          {}
        );
      }
    if (response.status !== 200) return [];
    console.log(response);
    const activities = await Promise.all(
      response.data.map(async (data) => {
        let grades;

        if (!!isTeacher) {
          
          // Si es profesor, obtiene las notas de todos los estudiantes del grupo
          grades = await getActivitiesScoresForGroup(data.activity.id, groupId);
        } else {
          // Si es estudiante, obtiene solo su nota personal
          grades = await getActivityScore(data.id, userId);
        }
        console.log(grades);

        return {
          id:          data.activity.id,
          activityGroupId: data.id,
          groupId: data.activity.achievementGroup.group.id,
          achievementGroupId: data.activity.achievementGroup.id,
          subjectKnowledgeId: data.activity?.achievementGroup?.subjectKnowledge?.id,
          name:        data.activity.activityName,
          description: data.activity.description,
          startDate:   data.startDate,
          endDate:     data.endDate,
          score:       isTeacher ? grades : grades?.score ?? "-",
          comment:     isTeacher ? "-" : grades?.comment ?? "-",
          status:      data.activity.status ?? "Sin estado",
          subject:{
            id:         data.activity?.achievementGroup?.subjectKnowledge?.idSubject.id,
            name:       data.activity?.achievementGroup?.subjectKnowledge?.idSubject.subjectName
          },
          knowledge:   data.activity?.achievementGroup?.subjectKnowledge?.idKnowledge,
          achievement: data.activity?.achievementGroup?.achievement
        };
      })
    );

    return activities;
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    return [];
  }
};


  /**
   * Actividades
   * obtiene los detalles de la calificación de una actividad en especifico
  */
const getActivityScore = async(activityId,studentId) =>{
  try {
    const response = await request(
      "GET",
      "academy",
      `/activity-grade/activities/${activityId}/students/${studentId}`,
      {}
    );

    if (response.status === 200) {
      const data = response.data;

      return {
        id: activityId,
        score: data.score,
        comment: data.comment,
      };
    }

    return [];
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    return [];
  }
}

const studentData$ = new BehaviorSubject(null);
//  Gestión de datos almacenados en sessionStorage
const storedStudentData = sessionStorage.getItem("studentData");
const initialStudentSubjects = storedStudentData ? JSON.parse(storedStudentData) : null;
const subjectsStudent = new BehaviorSubject(initialStudentSubjects);

export const studentDataService = {
  getSubjects: () => subjectsStudent.asObservable(),
  getSubjectsValue: () => subjectsStudent.value,
  setSubjects: (data) => {
    subjectsStudent.next(data);
  },
  clearSubjects: () => {
    subjectsStudent.next(null);
  },

  getStudentData: () => studentData$.asObservable(),
  getStudentDataValue: () => studentData$.value,
  setStudentData: (data) => {
    studentData$.next(data);
  },
  clearStudentData: () => {
    studentData$.next(null);
  },


/**
 * Actualiza la información personal de un usuario
 * @param {number} userId - ID del usuario a actualizar
 * @param {object} personalInfo - Objeto con la información personal actualizada
 */
updateUserPersonalInfo: async (userId, personalInfo) => {
  try {
    const response = await request(
      "PUT", 
      apiEndpoints.SERVICES.ACADEMY, 
      apiEndpoints.API_ENDPOINTS.USER.UPDATE_DETAIL_BY_ID(userId),
      personalInfo
    );

    if (response.status === 200 || response.status === 201) {
      return response.data;
    }
    throw new Error(`Error al actualizar: ${response.statusText}`);
  } catch (error) {
    console.error("Error actualizando información personal:", error);
    throw error;
  }
},



  /**
   * Obtener la nota del período de una materia de un estudiante
  */
  getPeriodGrade: async (subjectId, periodId, studentId) => {
    try {
      const response = await request(
        "GET",
        "academy",
        `/subject-grade/subjects/${subjectId}/periods/${periodId}/users/${studentId}`,
        {}
      );

      if (response.status === 200 && response.data.length > 0) {
        return response.data[0].totalScore ?? "-";
      }

      return "-"; // Si no hay calificación, devolvemos "-"
    } catch (error) {
      console.error("Error al obtener la nota del período:", error);
      return "-";
    }
  },

  /**
   * Obtener todas las calificaciones del estudiante en un periodo
  */
  getGrades: async (periodId, studentId, subjects) => {
    const storageKey = `grades_${studentId}_${periodId}`;


    try {
      
      const grades = [];
      for (const subject of subjects) {
        const response = await request(
          "GET",
          "academy",
          `/subject-grade/subjects/${subject.id}/periods/${periodId}/users/${studentId}`,
          {}
        );

        if (response.status === 200 && response.data.length > 0) {
          grades.push({
            subjectId: subject.id,
            subjectName: subject.subjectName,
            grade: response.data[0].totalScore ?? 0,
          });
        } else {
          grades.push({
            subjectId: subject.id,
            subjectName: subject.subjectName,
            grade: 0,
          });
        }
      }

      sessionStorage.setItem(storageKey, JSON.stringify(grades));
      return grades;
    } catch (error) {
      console.error("Error al obtener calificaciones:", error);
      return [];
    }
  },

  /**
   *Obtener las actividades de una materia en un periodo de un estudiante en particular
   * Corregir a Obtener las actividades de una materia en un periodo de un grupo de estudiantes
  */
  // getActivities: async (subjectId, periodId, groupId, studentId) => {
  //   return fetchActivities(subjectId, periodId, groupId, studentId, false);
  // },

  getActivities: async (subjectId, periodId, groupId, user,isTeacher=false) => {
    return fetchActivities(subjectId, periodId, groupId, user, isTeacher);
  },

  /**
   * Actividades
   * obtiene los detalles de una actividad en especifico
  */
  getActivityDetailsStudent: async (activityId,studentId) => {
    return getActivityDetails(activityId,studentId)
  },

  /**
   * Recibe todas las actividades de un estudiante en general
   * 
  */
  getAllActivities: async (periodId, studentId) => {
    
    try {
      const response = await request(
        "GET",
        "academy",
        `/activity-group/periods/${periodId}/users/${studentId}`,
        {}
      );

      if (response.status === 200) {
        const activities = await Promise.all(
          response.data.map(async (data) => {
            const grade = await getActivityScore(data.id, studentId); // Esperamos la promesa
            console.log()
            return {
              id:          data.activity.id,
              name:        data.activity.activityName,
              description: data.activity.description,
              startDate:   data.startDate,
              endDate:     data.endDate,
              subject:     data.activity?.achievementGroup?.subjectKnowledge?.idSubject?.subjectName,
              score:       grade?.score ?? "-",   // Verifica si `grade` existe antes de acceder a `score`
              comment:     grade?.comment ?? "-",
              status:      data.activity.status ?? "Sin estado",
            };
          })
        );
      
        return activities;
      }

      return activities;
    } catch (error) {
      console.error("Error al obtener todas las actividades:", error);
      return [];
    }
  },



  /**
   * Obtener lista de familiares de un usuario
  */
  getListRelativeFamily: async (userId) => {
    try {
      const response = await request("GET", "academy", `/users/detail/family/${userId}`, {});

      if (response.status === 200) {
        return response.data.map((relative) => ({
          id: relative.user.id,
          name: `${relative.user.firstName ?? ""} ${relative.user.lastName ?? ""}`.trim(),
          email: relative.user.email ?? "No disponible",
          relationship: relative.relationship.relationshipType,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error obteniendo los detalles de la familia:", error);
      return [];
    }
  },


  /**
    * Obtener detalles de un usuario específico
   */
  getUserDetails: async (familyMemberId) => {
    try {
      const response = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.USER.GET_DETAIL(familyMemberId),
        {});

      if (response.status === 200) {

        console.log(response)

        return {
          id: response.data.id,
          name: `${response.data.firstName ?? ""} ${response.data.middleName ?? ""} ${response.data.lastName ?? ""} ${response.data.secondLastName ?? ""}`.trim(),
          
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          middleName: response.data.middleName,
          secondLastName: response.data.secondLastName,
          status: response.data.user.status,
          avatar: "avatar.png",
          personalInfo: {
            codigo: response.data.id,
            identity: `${response.data.dni} - ${response.data.idType?.name ?? "Desconocido"}`,
            numberIdentity: `${response.data.dni  ?? "Desconocido"}`,
            typeIdentity: `${response.data.idType?.name ?? "Desconocido"}`,
            direccion: response.data.address ?? "No disponible",
            barrio: response.data.neighborhood ?? "No disponible",
            ciudad: response.data.city ?? "No disponible",
            telefono: response.data.phoneNumber ?? "No disponible",
            email: response.data.user.email ?? "No disponible",
            fechaNacimiento: response.data.dateOfBirth ? new Date(response.data.dateOfBirth).toLocaleDateString() : "No disponible",
            position: response.data.positionJob ?? "No disponible",
          },
        };
      }
      return null;
    } catch (error) {
      console.error("Error obteniendo detalles personales del familiar:", error);
      return null;
    }
  },
  /**
 * Obtiene la lista de tipos de identificación disponibles
 * @returns {Promise<Array>} Lista de tipos de ID
 */
getIdTypes: async () => {
  try {
    const response = await request(
      "GET", 
      "academy", 
      "/id-types"
    );

    if (response.status === 200) {
      return response.data;
    }
    throw new Error(`Error al obtener tipos de ID: ${response.statusText}`);
  } catch (error) {
    console.error("Error obteniendo tipos de ID:", error);
    throw error;
  }
},


  /**
    * Obtiene los estudiantes que esta relacionado un familiar para accder a la info de ellos. 
    * Se usa en el componente "UserTopBar"
  */
  getFamilyStudents: async (familyId) => {
    try {
      const response = await request(
        "GET",
        "academy",
        `/users/detail/family/${familyId}/students`,
        {}
      );

      if (response.status === 200) {
        return response.data.map((student) => ({
          id: student.user.id,
          name: `${student.user.firstName} ${student.user.lastName}`,
          username: student.user.username
        }));
      }

      return [];
    } catch (error) {
      console.error("Error obteniendo estudiantes del familiar:", error);
      return [];
    }
  },

  /**
    * Obtener los datos del estudiante seleccionado de sus materias y grupo asignado !!! Falta poner el año lectivo
  */
  fetchStudentData: async (studentId,periodId) => {
    try {

      studentDataService.clearStudentData(); // * Limpiar antes de cargar nuevos datos

      // * Obtener el grupo del estudiante
      //const responseGroups = await request("GET", "academy", `/subjects-groups/students-groups/students/${studentId}?year=${(new Date).getFullYear()}`, {});
      const responseGroups = await request("GET", "academy", `/subjects-groups/students-groups/periods/${periodId}/students/${studentId}`);
      if (responseGroups.status === 200 && responseGroups.data.length > 0) {
        const studentGroup = new StudentGroupModel(responseGroups.data[0]);
        console.log(responseGroups)
        studentGroup.addSubjects(responseGroups.data);
        studentDataService.setStudentData(studentGroup.toJSON()); // * Guardamos en RxJS
      }
    } catch (error) {
      console.error("Error cargando datos del estudiante:", error);
    }
  },



/**
 * Obtiene información académica de un estudiante usando métodos existentes
 * @param {number} studentId - ID del estudiante
 * @returns {Promise<Object>} - Datos académicos del estudiante
 */
getStudentAcademicProfile: async (studentId,periodId) => {
  try {
    // Utilizamos Promise.all para ejecutar todas las peticiones en paralelo
    const [
      userDetails,
      familyList,
      observations
    ] = await Promise.all([
      studentDataService.getUserDetails(studentId),
      studentDataService.getListRelativeFamily(studentId),
      studentTrackingService.getStudentObservations(studentId)
    ]);

    // Intentamos obtener el grupo del estudiante
    await studentDataService.fetchStudentData(studentId,periodId);
    const studentGroupData = studentDataService.getStudentDataValue();

    // Extraer el nombre completo y dividirlo en nombre y apellido
    const fullName = userDetails?.name || "";
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || "";
    // Asumimos que el resto son apellidos
    const lastName = nameParts.slice(1).join(" ") || "";

    // Construir objeto con la información disponible
    const studentInfo = {
      id: studentId,
      firstName: firstName,
      lastName: lastName,
      email: userDetails?.personalInfo?.celular || "", // El email está en el campo celular según el ejemplo
      course: studentGroupData?.group?.groupName || "No asignado",
      academicLevel: studentGroupData?.group?.level?.levelName || "No especificado",
      observationsCount: observations?.length || 0,
      family: Array.isArray(familyList) && familyList.length > 0 
    ? familyList.map(relative => ({
        id: relative.id,
        name: relative.name || `${relative.user?.firstName || ""} ${relative.user?.lastName || ""}`.trim(),
        email: relative.email || "",
        relationship: relative.relationship || ""
      }))
    : [],
      mentor: studentGroupData?.group?.mentor 
        ? {
            id: studentGroupData.group.mentor.id,
            name: `${studentGroupData.group.mentor.firstName} ${studentGroupData.group.mentor.lastName}`,
            email: studentGroupData.group.mentor.email
          } 
        : null
    };

    return studentInfo;
  } catch (error) {
    console.error("Error al obtener información académica del estudiante:", error);
    return null;
  }
},


};

const teacherData$ = new BehaviorSubject({ subjects: [], studentGroupList: null, directionGroupList: [] });

export const teacherDataService = {
  getSubjects: () => teacherData$.asObservable(),
  getSubjectsValue: () => teacherData$.value?.subjects || [],

  setSubjects: (data) => {
    teacherData$.next({
      ...(teacherData$.value || {}), //  Mantiene los valores actuales del estado
      subjects: data || [], //  Solo actualiza `subjects`, evitando que sea `undefined`
    });
  },

  clearSubjects: () => {
    teacherData$.next({
      ...(teacherData$.value || {}), //  Mantiene `studentGroupList`, solo borra `subjects`
      subjects: [], 
    });
  },

  getStudentGroupListData: () => teacherData$.asObservable(),
  getStudentGroupListValue: () => teacherData$.value?.studentGroupList || null,

  setStudentGroupListData: (data) => {
    teacherData$.next({
      ...(teacherData$.value || {}), //  Mantiene `subjects`, solo actualiza `studentGroupList`
      studentGroupList: data || null, 
    });
  },

  clearStudentGroupListData: () => {
    teacherData$.next({
      ...(teacherData$.value || {}), //  Mantiene `subjects`, solo borra `studentGroupList`
      studentGroupList: null,
    });
  },

  getDirectionGroupsListValue: () => teacherData$.value?.directionGroupList || null,
   /**
   *  Borra `directionGroupList`, manteniendo `subjects`
   */
   clearDirectionGroups: () => {
    teacherData$.next({
      ...teacherData$.value,
      directionGroupList: [],
    });
  },

  /**
   *  Guarda `directionGroupList`, manteniendo `subjects`
   */
  setDirectionGroups: (data) => {
    teacherData$.next({
      ...teacherData$.value,
      directionGroupList: data || [],
    });
  },

  getActivities: async (subjectId, periodId, groupId, user,isTeacher=false) => {
    return fetchActivities(subjectId, periodId, groupId, user, isTeacher);
  },

  
  getActivitiesScoresForGroup: async (activityId, groupId) => {
    return getActivitiesScoresForGroup(activityId, groupId);
  },


  /**
   *  Obtiene los grupos de materias que dicta el profesor en un año específico.
   *  Guarda solo el array de `subjects` para que `SubjectGrid` lo use correctamente.
   */
  fetchGroupsData: async (teacherId, year) => {
    try {
      teacherDataService.clearSubjects(); //  Limpia las materias anteriores

      const responseGroupsTeacher = await request(
        "GET",
        "academy",
        `/subjects-groups/teacher-groups/teachers/${teacherId}/subjects?year=${year}`,
        {}
      );

      if (responseGroupsTeacher.status === 200 && Array.isArray(responseGroupsTeacher.data)) {
        const teacherData = new TeacherGroupModel(responseGroupsTeacher.data).toJSON();
        
        teacherDataService.setSubjects(teacherData.subjects || []); //  Guarda solo subjects
        
      }
    } catch (error) {
      console.error("Error cargando datos del profesor:", error);
    }
  },

  getActiveStudentGroups: async () => {
    try {
      const response = await request(
        "GET", 
        apiEndpoints.SERVICES.ACADEMY, 
        apiEndpoints.API_ENDPOINTS.GROUPS.STUDENT_GROUPS_ALL
      );
      
      // La función request ya maneja la conversión de la respuesta a JSON
      return response.data;
    } catch (error) {
      console.error('Error al obtener grupos de estudiantes activos:', error);
      throw error;
    }
  },



  /**
   * Obtiene los grupos de los que el profesor es director de curso,
   * y actualiza sólo directionGroupList manteniendo el resto del estado
   */
  fetchDirectionSubjectsData: async (teacherId, year) => {
    try {
      // Limpiamos la lista de dirección de grupo antes de cargar los nuevos
      teacherDataService.clearDirectionGroups();
      
      const responseGroupsTeacher = await request(
        "GET",
        "academy",
        `/student-groups/mentors/${teacherId}/students`,
        {}
      );

      if (responseGroupsTeacher.status === 200 && Array.isArray(responseGroupsTeacher.data)) {
        const teacherData = new TeacherGroupModel([]);
        
        // Agrupar estudiantes en sus respectivos grupos
        teacherData.addStudentDirectionGroup(responseGroupsTeacher.data);
        
        // IMPORTANTE: Solo actualizamos directionGroupList, sin modificar subjects
        teacherDataService.setDirectionGroups(teacherData.directionGroupList || []);
      } else {
        console.warn("La respuesta no contiene datos válidos.");
      }
    } catch (error) {
      console.error("Error cargando datos del profesor:", error);
    }
  },



  /**
   *  Obtiene la lista de estudiantes en un grupo específico.
   *  Mantiene `subjects` y solo actualiza `studentGroupList`.
   */
  fetchListUsersGroupData: async (periodId,subjectId) => {
    try {
      //  NO se limpia `subjects`, solo obtenemos estudiantes
      const responseGroupsTeacher = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.SUBJECTS.GROUPS.GET_ALL_BY_PERIOD_AND_SUBJECT(periodId,subjectId),
        {}
      );

      if (responseGroupsTeacher.status === 200 && responseGroupsTeacher.data.length > 0) {
        const studentGroupList = new StudentGroupModel(responseGroupsTeacher.data[0]); //  Instancia base
        studentGroupList.addStudents(responseGroupsTeacher.data); //  Agrega estudiantes

        teacherDataService.setStudentGroupListData(studentGroupList.toJSON()); //  Guarda en el estado
      }
    } catch (error) {
      console.error("Error cargando lista de estudiantes:", error);
    }
  },

  /**
   *  Obtiene la lista de estudiantes en un grupo específico.
   *  Mantiene `subjects` y solo actualiza `studentGroupList`.
   */
  fetchListUsersGroupDataBySubject: async (periodId,subjectId,groupId) => {
    try {
      //  NO se limpia `subjects`, solo obtenemos estudiantes
      const responseGroupsTeacher = await request(
        "GET",
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.SUBJECTS.GROUPS.GET_ALL_BY_PERIOD_AND_SUBJECT_PROFESSOR_AND_GROUP(periodId,subjectId,groupId),
        {}
      );

      if (responseGroupsTeacher.status === 200 && responseGroupsTeacher.data.length > 0) {
        const studentGroupList = new StudentGroupModel(responseGroupsTeacher.data[0]); //  Instancia base
        studentGroupList.addStudents(responseGroupsTeacher.data); //  Agrega estudiantes

        teacherDataService.setStudentGroupListData(studentGroupList.toJSON()); //  Guarda en el estado
      }
    } catch (error) {
      console.error("Error cargando lista de estudiantes:", error);
    }
  },

    /**
   *  Obtiene la lista de estudiantes en un grupo específico.
   *  Mantiene `subjects` y solo actualiza `studentGroupList`.
   */
    fetchListUsersGroupDataByGroupId: async (groupId) => {
      try {
        //  NO se limpia `subjects`, solo obtenemos estudiantes
        const responseGroupsTeacher = await request(
          "GET",
          apiEndpoints.SERVICES.ACADEMY,
          apiEndpoints.API_ENDPOINTS.GROUPS.STUDENT_GROUPS_BY_GROUPID(groupId),
          {}
        );
  
        if (responseGroupsTeacher.status === 200 && responseGroupsTeacher.data.length > 0) {
          const studentGroupList = new StudentGroupModel(responseGroupsTeacher.data[0]); //  Instancia base
          studentGroupList.addStudents(responseGroupsTeacher.data); //  Agrega estudiantes
  
          teacherDataService.setStudentGroupListData(studentGroupList.toJSON()); //  Guarda en el estado
        }
      } catch (error) {
        console.error("Error cargando lista de estudiantes:", error);
      }
    },
    
  

};




//  Exportar todo en un solo archivo
export default {studentDataService,teacherDataService};
