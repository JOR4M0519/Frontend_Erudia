// src/models/AttendanceModel.js

export const AttendanceStatus = {
    PRESENT: "P",
    ABSENT: "A",
    TARDY: "T"
};

export const AttendanceStatusLabels = {
    [AttendanceStatus.PRESENT]: "Presente",
    [AttendanceStatus.ABSENT]: "Ausente",
    [AttendanceStatus.TARDY]: "Tarde"
};

export const AttendanceStatusColors = {
    [AttendanceStatus.PRESENT]: "bg-green-100 text-green-800",
    [AttendanceStatus.ABSENT]: "bg-red-100 text-red-800",
    [AttendanceStatus.TARDY]: "bg-yellow-100 text-yellow-800"
};

// Modelo para procesar los datos de asistencia
export class AttendanceProcessor {
    // Procesa los datos del API y los organiza por estudiante y fecha
    static processAttendanceData(rawData) {
        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
            return { students: [], dates: [], attendanceMap: {} };
        }

        // Extraer estudiantes únicos
        const uniqueStudents = [];
        const studentMap = new Map();

        // Extraer fechas únicas y ordenarlas
        const uniqueDates = [...new Set(rawData.map(item => item.attendanceDate))].sort();

        // Crear mapa de asistencia: studentId -> date -> status
        const attendanceMap = {};

        rawData.forEach(item => {
            const student = item.student;
            const date = item.attendanceDate;
            const status = item.status;

            // Agregar estudiante si no existe en el mapa
            if (!studentMap.has(student.id)) {
                studentMap.set(student.id, true);
                uniqueStudents.push({
                    id: student.id,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    username: student.username
                });
            }

            // Inicializar el mapa de asistencia para este estudiante si no existe
            if (!attendanceMap[student.id]) {
                attendanceMap[student.id] = {};
            }

            // Guardar el estado de asistencia para esta fecha
            attendanceMap[student.id][date] = status;
        });

        // Ordenar estudiantes por apellido
        uniqueStudents.sort((a, b) => a.lastName.localeCompare(b.lastName));

        return {
            students: uniqueStudents,
            dates: uniqueDates,
            attendanceMap: attendanceMap
        };
    }

    // Calcula estadísticas de asistencia para un estudiante
    static calculateStudentStats(studentId, attendanceMap, dates) {
        if (!attendanceMap || !attendanceMap[studentId]) {
            return { present: 0, absent: 0, tardy: 0, total: 0, percentage: 0 };
        }

        const studentAttendance = attendanceMap[studentId];
        let present = 0;
        let absent = 0;
        let tardy = 0;

        dates.forEach(date => {
            const status = studentAttendance[date];
            if (status === AttendanceStatus.PRESENT) present++;
            else if (status === AttendanceStatus.ABSENT) absent++;
            else if (status === AttendanceStatus.TARDY) tardy++;
        });

        const total = dates.length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        return { present, absent, tardy, total, percentage };
    }
}
