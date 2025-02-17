import { BehaviorSubject } from "rxjs";
import { request } from "../../../../services/config/axios_helper"; // Importamos el request para las peticiones

// 🔹 Estado de la vista (home / grades / otra pantalla que quieras)
const viewSubject = new BehaviorSubject("home");
const selectedSubject = new BehaviorSubject(sessionStorage.getItem("selectedSubject") || null);
const activityModalState = new BehaviorSubject({ isOpen: false, activityData: null })


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

// 🔹 Gestión de datos almacenados en sessionStorage
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
  getGrades: async (periodId, studentId) => {
    const storageKey = `grades_${studentId}_${periodId}`;
    const storedGrades = sessionStorage.getItem(storageKey);

    if (storedGrades) {
      console.log("Obteniendo calificaciones desde sessionStorage...");
      return JSON.parse(storedGrades);
    }

    try {
      console.log("Consultando calificaciones desde la API...");
      const subjects = subjectsStudent.value?.subjects || [];
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
          subjectName: task.activity.activity.subject.subjectName,
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

  setSubjects: (data) => {
    sessionStorage.setItem("studentData", JSON.stringify(data));
    subjectsStudent.next(data);
  },

  clearSubjects: () => {
    sessionStorage.removeItem("studentData");
    subjectsStudent.next(null);
  },
};

// ✅ Exportar todo en un solo archivo
export default {
  studentService,
  studentDataService,
};
