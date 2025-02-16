import { BehaviorSubject } from "rxjs";
import { request } from "../../../../services/config/axios_helper"; // Importamos el request para las peticiones

// 🔹 Estado de la vista (home / grades / otra pantalla que quieras)
const viewSubject = new BehaviorSubject("home");
const selectedSubject = new BehaviorSubject(sessionStorage.getItem("selectedSubject") || null);

export const studentService = {
  getView: () => viewSubject.asObservable(),
  setView: (view) => viewSubject.next(view),
  getSelectedSubject: () => selectedSubject.asObservable(),
  setSelectedSubject: (subjectId) => {
    selectedSubject.next(subjectId);
    sessionStorage.setItem("selectedSubject", subjectId);
  },
};

// 🔹 Gestión de datos almacenados en sessionStorage
const storedData = sessionStorage.getItem("studentData");
const initialSubjects = storedData ? JSON.parse(storedData) : null;

// 🔹 Estado de los datos de materias del estudiante
const subjectsStudent = new BehaviorSubject(initialSubjects);

// 🔹 Gestión de materias con RxJS y sessionStorage
export const studentDataService = {
  getSubjects: () => subjectsStudent.asObservable(),
  getSubjectsValue: () => subjectsStudent.value,

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

  getTasks: async (subjectId, periodId, studentId) => {
    try {
      const response = await request(
        "GET",
        "academy",
        `/tasks/subjects/${subjectId}/periods/${periodId}/users/${studentId}`,
        {}
      );
      if (response.status === 200) {
        return response.data;
      }
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



//  Exportar todo en un solo archivo
export default {
  studentService,
  studentDataService,
};
