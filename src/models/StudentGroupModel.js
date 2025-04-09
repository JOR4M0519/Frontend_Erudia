export class StudentGroupModel {
  
    constructor(data) {
      const groupKey = data.group ? "group" : "groups"; // Detectar cuál existe
      const groupData = data[groupKey] || {}; // Usar la que esté disponible

      this.group = {
        id: groupData.id || null,
        groupCode: groupData.groupCode || "",
        groupName: groupData.groupName || "",
        level: {
          id: groupData.level?.id || null,
          levelName: groupData.level?.levelName || "",
        },
        mentor: {
          id: groupData.mentor?.id || null,
          firstName: groupData.mentor?.firstName || "Desconocido",
          lastName: groupData.mentor?.lastName || "Desconocido",
          email: groupData.mentor?.email || "Desconocido",
        },
      };
  
      // Lista vacía de materias, la llenaremos después
      this.subjects = [];
      this.students = [];
    }
  
    // Método para agregar materias después de instanciar el objeto
    addSubjects(subjectsData) {
      
      this.subjects = subjectsData.map(item => ({
        id: item.subjectProfessor?.subject?.id,
        subjectName: item.subjectProfessor?.subject?.subjectName,
        group: item.groups || "Desconocido", 
        teacher: {
          id: item.subjectProfessor?.professor?.id || null,
          firstName: item.subjectProfessor?.professor?.firstName || "Desconocido",
          lastName: item.subjectProfessor?.professor?.lastName || "Desconocido",
          email: item.subjectProfessor?.professor?.email || "Desconocido",
        },
      }));
    }

    addStudents(studentsGroupList) {
      this.students = studentsGroupList.map(item => ({
        id:           item.student?.id,
        firstName:   item.student?.firstName,
        lastName:   item.student?.lastName,
        name:       item.student?.firstName +" "+ item.student?.lastName,
        
      }));
    }
  
    // Método para obtener el objeto en formato JSON
    toJSON() {
      return {
        group: this.group,
        subjects: this.subjects,
        students: this.students,
      };
    }
  }
  