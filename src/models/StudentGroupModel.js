export class StudentGroupModel {
    constructor(data) {
      this.group = {
        id: data.group?.id || null,
        groupCode: data.group?.groupCode || "",
        groupName: data.group?.groupName || "",
        level: {
          id: data.group?.level?.id || null,
          levelName: data.group?.level?.levelName || "",
        },
        mentor: {
          id: data.group?.mentor?.id || null,
          firstName: data.group?.mentor?.firstName || "Desconocido",
          lastName: data.group?.mentor?.lastName || "Desconocido",
        },
      };
  
      // Lista vacía de materias, la llenaremos después
      this.subjects = [];
    }
  
    // Método para agregar materias después de instanciar el objeto
    addSubjects(subjectsData) {
      this.subjects = subjectsData.map(item => ({
        id: item.subject.id,
        subjectName: item.subject.subjectName,
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
  