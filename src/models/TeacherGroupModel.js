export class TeacherGroupModel {
  constructor(data = []) {
    // Manejar el caso cuando data es undefined o null
    const safeData = Array.isArray(data) ? data : [];
    
    // Lista de materias
    this.subjects = safeData.map(item => ({
      id: item.subjectProfessor?.id || null,
      subjectName: item.subjectProfessor?.subject?.subjectName || "Sin nombre",
      subjectId: item.subjectProfessor?.subject?.id || null,
      group: {
        id: item.groups?.id || null,
        level: item.groups?.level || null,
        groupCode: item.groups?.groupCode || "Sin código",
        groupName: item.groups?.groupName || "Sin nombre",
      },
    }));
    
    // Filtrar el grupo donde el profesor es mentor
    this.groupMentor = safeData.find(
      item => item.groups?.mentor?.id === item.subjectProfessor?.professor?.id
    )?.groups || null;
    
    // Inicializar directionGroupList como array vacío
    this.directionGroupList = [];
  }
  
  addStudentDirectionGroup(groupData = []) {
    // Verificar que groupData sea un array
    if (!Array.isArray(groupData)) {
      console.error("groupData no es un array válido:", groupData);
      return;
    }
    
    // Crear un mapa para agrupar por `group.id`
    const groupedData = new Map();
  
    groupData.forEach(item => {
      const groupId = item.group?.id;
      
      if (!groupId) return; // Saltar si no hay grupo
  
      if (!groupedData.has(groupId)) {
        // Si el grupo aún no está en el mapa, lo creamos con su estructura
        groupedData.set(groupId, {
          id: groupId,
          groupName: item.group?.groupName || "Sin nombre",
          groupCode: item.group?.groupCode || "Sin código",
          level: item.group?.level?.levelName || "Sin nivel",
          mentor: {
            id: item.group?.mentor?.id || null,
            firstName: item.group?.mentor?.firstName || "Desconocido",
            lastName: item.group?.mentor?.lastName || "Desconocido",
            email: item.group?.mentor?.email || "Desconocido",
          },
          students: [] // Inicializamos la lista de estudiantes
        });
      }
  
      // Agregar el estudiante al grupo correspondiente si existe
      if (item.student) {
        groupedData.get(groupId).students.push({
          id: item.student?.id || null,
          firstName: item.student?.firstName || "Desconocido",
          lastName: item.student?.lastName || "Desconocido",
          email: item.student?.email || "Desconocido",
        });
      }
    });
  
    // Convertir el mapa en un array de grupos
    this.directionGroupList = Array.from(groupedData.values());
  }
  
  // Método para obtener el objeto en formato JSON
  toJSON() {
    return {
      groupMentor: this.groupMentor,
      subjects: this.subjects,
      directionGroupList: this.directionGroupList
    };
  }
}