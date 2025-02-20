import { BehaviorSubject, filter, firstValueFrom } from "rxjs";
import { request } from "../../../../services/config/axios_helper"; // Importamos el request para las peticiones
import { State, StudentGroupModel } from "../../../../models";

// 🔹 Estado de la vista (home / grades / otra pantalla que quieras)
const viewSubject = new BehaviorSubject("home");
const selectedSubject = new BehaviorSubject(sessionStorage.getItem("selectedSubject") || null);
const activityModalState = new BehaviorSubject({ isOpen: false, activityData: null })
const studentData$ = new BehaviorSubject(null);

export const studentService = {
  getView: () => viewSubject.asObservable(),
  setView: (view) => viewSubject.next(view),
  getSelectedSubject: () => selectedSubject.asObservable(),
  setSelectedSubject: (subjectId) => {
    selectedSubject.next(subjectId);
    sessionStorage.setItem("selectedSubject", subjectId);
  },

  getTaskModal: () => activityModalState.asObservable(),
  openTaskModal: (activityData) => activityModalState.next({ isOpen: true, activityData }),
  closeTaskModal: () => activityModalState.next({ isOpen: false, activityData: null }),

};

//  Gestión de datos almacenados en sessionStorage
const storedData = sessionStorage.getItem("studentData");
const initialSubjects = storedData ? JSON.parse(storedData) : null;
const subjectsStudent = new BehaviorSubject(initialSubjects);

export const studentDataService = {
  getSubjects: () => subjectsStudent.asObservable(),
  getSubjectsValue: () => subjectsStudent.value,

  // 🔹 Obtener la nota del período de una materia
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

  // 🔹 Obtener todas las calificaciones del estudiante en un periodo
  getGrades: async (periodId, studentId,subjects) => {
    const storageKey = `grades_${studentId}_${periodId}`;
    

    try {
      console.log("Consultando calificaciones desde la API...");
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

  // Obtener las tareas de una materia en un periodo
  getTasks: async (subjectId, periodId, studentId) => {
    try {
      const response = await request(
        "GET",
        "academy",
        `/activity-grade/subjects/${subjectId}/periods/${periodId}/users/${studentId}`,
        {}
      );

      if (response.status === 200) {
        return response.data.map((task) => ({
          id: task.activity.id,
          name: task.activity.activity.activityName,
          description: task.activity.activity.description,
          startDate: task.activity.startDate,
          endDate: task.activity.endDate,
          subjectName: task.activity.activity.achievementGroup.subjectKnowledge.idSubject.subjectName,
          score: task.score ?? "-",
          status: task.comment ?? "Sin estado",
        }));
      }

      return [];
    } catch (error) {
      console.error("Error al obtener tareas:", error);
      return [];
    }
  },

  getTaskDetails: async (activityId) => {
    try {
      const response = await request(
        "GET",
        "academy",
        `/activity-grade/${activityId}`,
        {}
      );

      if (response.status === 200) {
        const task = response.data; 

        return {
          id: activityId,
          name: task.activity.activity.activityName,
          knowledge: task.activity.activity.achievementGroup.subjectKnowledge.idKnowledge.name,
          description: task.activity.activity.description,
          startDate: task.activity.startDate ?? "-",  //No se tiene aun
          endDate: task.activity.endDate ?? "-",      //No se tiene aun
          score: task.score ?? "-",
          comment: task.comment ?? "Sin estado",
          status: (new State()).getName(task.activity.activity.status),
        };
      }

      return [];
    } catch (error) {
      console.error("Error al obtener tareas:", error);
      return [];
    }
  },

  getAllTasks: async (periodId, studentId) => {
    try {
      const response = await request(
        "GET",
        "academy",
        `/activity-grade/periods/${periodId}/users/${studentId}`,
        {}
      );

      if (response.status === 200) {
        return response.data.map((task) => ({
          id: task.activity.id,
          name: task.activity.activity.activityName,
          description: task.activity.activity.description,
          startDate: task.activity.startDate,
          endDate: task.activity.endDate,
          subjectName: task.activity.activity.achievementGroup.subjectKnowledge.idSubject.subjectName,
          score: task.score ?? "-",
          status: task.comment ?? "Sin estado",
        }));
      }

      return [];
    } catch (error) {
      console.error("Error al obtener todas las tareas:", error);
      return [];
    }
  },
  // 🔹 Obtener observaciones del estudiante
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
  
  // Obtener lista de familiares
getFamilyDetails: async (userId) => {
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


// XXX Se debe cambiar el nombre a getUserDetails
// 🔹 Obtener detalles de un familiar específico cuando se abre el modal
getFamilyMemberDetails: async (familyMemberId) => {
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
      }));
    }

    return [];
  } catch (error) {
    console.error("Error obteniendo estudiantes del familiar:", error);
    return [];
  }
},


  setSubjects: (data) => {
    sessionStorage.setItem("studentData", JSON.stringify(data));
    subjectsStudent.next(data);
  },

  clearSubjects: () => {
    sessionStorage.removeItem("studentData");
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

  // 🔹 Obtener los datos del estudiante seleccionado
  fetchStudentData: async (studentId) => {
    try {
      
      studentDataService.clearStudentData(); // 🔹 Limpiar antes de cargar nuevos datos

      // 🔹 Obtener el grupo del estudiante
      const responseGroups = await request("GET", "academy", `/student-groups/user/${studentId}`, {});
      if (responseGroups.status === 200 && responseGroups.data.length > 0) {
        const studentGroup = new StudentGroupModel(responseGroups.data[0]);

        // 🔹 Obtener materias del estudiante
        const responseSubjects = await request("GET", "academy", `/subjects-groups/students-groups/${studentGroup.group.id}`, {});
        if (responseSubjects.status === 200) {
          studentGroup.addSubjects(responseSubjects.data);
          studentDataService.setStudentData(studentGroup.toJSON()); // 🔹 Guardamos en RxJS
        }
      }
    } catch (error) {
      console.error("Error cargando datos del estudiante:", error);
    }
  }

};

//  Exportar todo en un solo archivo
export default {
  studentService,
  studentDataService,
};
