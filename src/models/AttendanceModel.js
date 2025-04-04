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
// En AttendanceModel.js
export class AttendanceProcessor {
    static processAttendanceData(rawData) {
        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
            return { students: [], dates: [], schedules: [], attendanceMap: {}, originalData: [] };
        }

        // Obtener fechas únicas ordenadas
        const uniqueDates = [...new Set(rawData.map(record => record.attendanceDate))].sort();
        
        // Obtener horarios únicos
        const scheduleMap = new Map();
        rawData.forEach(record => {
            const scheduleId = record.schedule.id;
            if (!scheduleMap.has(scheduleId)) {
                scheduleMap.set(scheduleId, {
                    id: scheduleId,
                    startTime: record.schedule.startTime,
                    endTime: record.schedule.endTime,
                    dayOfWeek: record.schedule.dayOfWeek,
                    subjectName: record.schedule.subjectGroup.subjectProfessor.subject.subjectName
                });
            }
        });
        const uniqueSchedules = Array.from(scheduleMap.values());

        // Agrupar estudiantes
        const studentMap = new Map();
        rawData.forEach(record => {
            const student = record.student;
            if (!studentMap.has(student.id)) {
                studentMap.set(student.id, student);
            }
        });

        // Crear mapa de asistencia con IDs de registro
        const attendanceMap = {};
        rawData.forEach(record => {
            const studentId = record.student.id;
            const date = record.attendanceDate;
            const scheduleId = record.schedule.id;
            
            if (!attendanceMap[studentId]) {
                attendanceMap[studentId] = {};
            }
            
            if (!attendanceMap[studentId][date]) {
                attendanceMap[studentId][date] = {};
            }
            
            // Si ya existe un registro para esta fecha y horario, mantener el más reciente
            const existingRecord = attendanceMap[studentId][date][scheduleId];
            if (!existingRecord || new Date(record.recordedAt) > new Date(existingRecord.recordedAt)) {
                attendanceMap[studentId][date][scheduleId] = {
                    id: record.id,
                    status: record.status,
                    recordedAt: record.recordedAt
                };
            }
        });

        return {
            dates: uniqueDates,
            students: Array.from(studentMap.values()),
            schedules: uniqueSchedules,
            attendanceMap: attendanceMap,
            originalData: rawData
        };
    }

    static calculateStudentStats(studentId, attendanceMap, dates) {
        if (!attendanceMap || !attendanceMap[studentId]) {
            return { present: 0, absent: 0, tardy: 0, total: 0, percentage: 0 };
        }

        const studentAttendance = attendanceMap[studentId];
        let present = 0;
        let absent = 0;
        let tardy = 0;
        let total = 0;

        dates.forEach(date => {
            if (studentAttendance[date]) {
                Object.values(studentAttendance[date]).forEach(record => {
                    if (record && record.status) {
                        total++;
                        if (record.status === AttendanceStatus.PRESENT) present++;
                        else if (record.status === AttendanceStatus.ABSENT) absent++;
                        else if (record.status === AttendanceStatus.TARDY) tardy++;
                    }
                });
            }
        });

        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        return { present, absent, tardy, total, percentage };
    }
}
