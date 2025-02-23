import { BehaviorSubject, filter, firstValueFrom } from "rxjs";
import { request } from "../../../../services/config/axios_helper"; // Importamos el request para las peticiones
import { State, StudentGroupModel } from "../../../../models";
import { TeacherGroupModel } from "../../../../models/TeacherGroupModel";

  /**
   * Actividades
   * obtiene los detalles de una actividad en especifico
   * !!! Falta recibir correctamente los datos en startDate-Endate y aotros porbablemente
   * !!! Toca arreglar el endpoint 'activity-grade'
  */
const getActivityDetails = async(activityId,studentId) =>{
  try {
    const response = await request(
      "GET",
      "academy",
      `/activity-grade/activities/${activityId}`,
      {}
    );

    if (response.status === 200) {
      const data = response.data;
      const grade = await getActivityScore(data.activity.id, studentId);
      return {
        id:          data.activity.id,
        name:        data.activity.activity.activityName,
        knowledge:   data.activity.activity.achievementGroup?.subjectKnowledge?.idKnowledge ?? "-",
        description: data.activity.activity.description,
        startDate:   data.activity.startDate,
        endDate:     data.activity.endDate,
        score:       grade?.score ?? "-",   // Verifica si `grade` existe antes de acceder a `score`
        comment:     grade?.comment ?? "-",
        status:      data.activity.activity.status ?? "Sin estado",
      };
    }

    return [];
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    return [];
  }
}

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
    console.error("Error al obtener tareas:", error);
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
   *Obtener las tareas de una materia en un periodo de un estudiante en particular
   * 
  */
   getActivities: async (subjectId, periodId, studentId) => {
    console.log("actividades: "+ studentId)
    try {
      const response = await request(
        "GET",
        "academy",
        `/activity-group/subjects/${subjectId}/periods/${periodId}/users/${studentId}`,
        {}
      );

      if (response.status === 200) {
        const activities = await Promise.all(
          response.data.map(async (data) => {
            const grade = await getActivityScore(data.activity.id, studentId); // Esperamos la promesa
      
            return {
              id:          data.activity.id,
              name:        data.activity.activityName,
              description: data.activity.description,
              startDate:   data.startDate,
              endDate:     data.endDate,
              score:       grade?.score ?? "-",   // Verifica si `grade` existe antes de acceder a `score`
              comment:     grade?.comment ?? "-",
              status:      data.activity.status ?? "Sin estado",
            };
          })
        );
      
        return activities;
      }

      return [];
    } catch (error) {
      console.error("Error al obtener tareas:", error);
      return [];
    }
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
            const grade = await getActivityScore(data.activity.id, studentId); // Esperamos la promesa
      
            return {
              id:          data.activity.id,
              name:        data.activity.activityName,
              description: data.activity.description,
              startDate:   data.startDate,
              endDate:     data.endDate,
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
      console.error("Error al obtener todas las tareas:", error);
      return [];
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
          date: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "-",
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
      const response = await request("GET", "academy", `/users/detail/${familyMemberId}`, {});

      if (response.status === 200) {
        return {
          id: response.data.id,
          name: `${response.data.firstName ?? ""} ${response.data.middleName ?? ""} ${response.data.lastName ?? ""} ${response.data.secondLastName ?? ""}`.trim(),
          status: response.data.user.status,
          avatar: "avatar.png",
          personalInfo: {
            codigo: response.data.id,
            rc: `${response.data.dni} - ${response.data.idType?.name ?? "Desconocido"}`,
            direccion: response.data.address ?? "No disponible",
            barrio: response.data.neighborhood ?? "No disponible",
            ciudad: response.data.city ?? "No disponible",
            telefono: response.data.phoneNumber ?? "No disponible",
            celular: response.data.user.email ?? "No disponible",
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
    * Obtiene los estudiantes que esta relacionado un familiar para accder a la info de ellos. 
    * Se usa en el componente "StudentTopBar"
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
          id: student.relativeUser.id,
          name: `${student.relativeUser.firstName} ${student.relativeUser.lastName}`,
          username: student.relativeUser.username
        }));
      }

      return [];
    } catch (error) {
      console.error("Error obteniendo estudiantes del familiar:", error);
      return [];
    }
  },

  /**
    * Obtener los datos del estudiante seleccionado de sus materias y grupo asignado
  */
  fetchStudentData: async (studentId) => {
    try {

      studentDataService.clearStudentData(); // * Limpiar antes de cargar nuevos datos

      // * Obtener el grupo del estudiante
      const responseGroups = await request("GET", "academy", `/subjects-groups/students-groups/${studentId}`, {});
      if (responseGroups.status === 200 && responseGroups.data.length > 0) {
        const studentGroup = new StudentGroupModel(responseGroups.data[0]);
        studentGroup.addSubjects(responseGroups.data);
        studentDataService.setStudentData(studentGroup.toJSON()); // * Guardamos en RxJS
      }
    } catch (error) {
      console.error("Error cargando datos del estudiante:", error);
    }
  },
  

};

const teacherData$ = new BehaviorSubject(null);

export const teacherDataService ={
  getSubjects: () => teacherData$.asObservable(),
  getSubjectsValue: () => teacherData$.value,

  setSubjects: (data) => {
    teacherData$.next(data);
  },

  clearSubjects: () => {
    teacherData$.next(null);
  },

  /**
    * Obtener los datos de los grupos de acuerdo con las materias que dicta el profesor
    * !!Hace falta por desarrollar
  */
  fetchGroupsData: async (teacherId, year) => {
    try {
      // Limpiar los datos previos del profesor
      teacherDataService.clearSubjects();
  
      // Realizar la petición al endpoint correspondiente
      const responseGroupsTeacher = await request(
        "GET",
        "academy",
        `/subjects-groups/teacher-groups/teacher/${teacherId}/subjects?year=${year}`,
        {}
      );
  
      // Validar la respuesta y almacenar los datos
      if (responseGroupsTeacher.status === 200 && Array.isArray(responseGroupsTeacher.data)) {
        const studentGroup = new TeacherGroupModel(responseGroupsTeacher.data);
        teacherDataService.setSubjects(studentGroup.toJSON());
      }
      
    } catch (error) {
      console.error("Error cargando datos del profesor:", error);
    }
  },
} 

//  Exportar todo en un solo archivo
export default {studentDataService,teacherDataService};
