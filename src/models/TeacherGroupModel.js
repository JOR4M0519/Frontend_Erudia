export class TeacherGroupModel {
  constructor(data) {
    // Lista vacía de materias, la llenaremos después
    this.subjects = data.map(item => ({
      id: item.subjectProfessor?.subject?.id || null,
      subjectName: item.subjectProfessor?.subject?.subjectName || "Sin nombre",
      group: {
        id:         item.groups?.id || null,
        level:      item.groups?.level || null,
        groupCode:  item.groups?.groupCode || "Sin código",
        groupName:  item.groups?.groupName || "Sin nombre",
      },
    }));

    //  Filtrar el grupo donde el profesor es mentor
    this.groupMentor = data.find(
      item => item.groups?.mentor?.id === item.subjectProfessor?.professor?.id
    )?.groups || null;
  }

  // Método para obtener el objeto en formato JSON
  toJSON() {
    return {
      groupMentor: this.groupMentor, //  Agregamos groupMentor al JSON
      subjects: this.subjects,
    };
  }
}
