export class StudentGroupModel {
    constructor(data) {
      this.group = {
        id: data.groups?.id || null,
        groupCode: data.groups?.groupCode || "",
        groupName: data.groups?.groupName || "",
        level: {
          id: data.groups?.level?.id || null,
          levelName: data.groups?.level?.levelName || "",
        },
        mentor: {
          id: data.groups?.mentor?.id || null,
          firstName: data.groups?.mentor?.firstName || "Desconocido",
          lastName: data.groups?.mentor?.lastName || "Desconocido",
          email: data.groups?.mentor?.email || "Desconocido",
        },
      };
  
      // Lista vacía de materias, la llenaremos después
      this.subjects = [];
    }
  
    // Método para agregar materias después de instanciar el objeto
    addSubjects(subjectsData) {
      this.subjects = subjectsData.map(item => ({
        id: item.subjectProfessor?.subject?.id,
        subjectName: item.subjectProfessor?.subject?.subjectName,
        teacher: {
          id: item.subjectProfessor?.professor?.id || null,
          firstName: item.subjectProfessor?.professor?.firstName || "Desconocido",
          lastName: item.subjectProfessor?.professor?.lastName || "Desconocido",
          email: item.subjectProfessor?.professor?.email || "Desconocido",
        },
      }));
    }
  
    // Método para obtener el objeto en formato JSON
    toJSON() {
      return {
        group: this.group,
        subjects: this.subjects,
      };
    }
  }
  