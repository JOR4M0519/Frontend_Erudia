export const PublicRoutes = {
  LOGIN: 'login'
};

export const PrivateRoutes = {
PRIVATE:          '/private',

DASHBOARD:        '/dashboard',
HOME:             '/home',
ACTIVITIES_SUBJECT:'/materia-actividades',
ASISTANCE:        '/asistencia',
ACTIVITIES_GRADING:'/actividad-calificaciones',

SEARCH:           '/search',

PROFILE:          '/perfil',

SUBJECTS:         '/materias',
DIRECTOR_GROUP_SUBJECTS: '/direccion-grupo',

ACTIVITIES:       '/actividades',
STUDENTTRACKING:  '/observador',
STUDENTTRACKINGDETAILS:  '/detaller-observador',

ADMIN:            '/admin',  
GRADES:           '/notas',
SETTINGS:         '/configuracion',

};

export const AdminRoutes = {
// Rutas principales
ROOT:             '/admin',
INSTITUTION:      '/admin/institucion',
STUDENTS:         '/admin/usuarios/estudiantes',
EMPLOYEES:        '/admin/usuarios/empleados',
ACADEMY:          '/admin/academia',
SYSTEM:           '/admin/sistema',

// Institución
INSTITUTION_CONFIG: '/admin/institucion/configuracion',
INSTITUTION_REPORTS: '/admin/institucion/reportes',

// Estudiantes
STUDENTS_REPORTS: '/admin/usuarios/estudiantes/reportes',
STUDENTS_PROCESSES: '/admin/usuarios/estudiantes/procesos',

// Empleados
EMPLOYEES_CONSOLIDATED: '/admin/usuarios/empleados/consolidado',
EMPLOYEES_ADD: '/admin/usuarios/empleados/agregar',

// Academia
ACADEMY_REPORTS: '/admin/academia/reportes',
ACADEMY_CONFIG: '/admin/academia/configuracion',
ACADEMY_PROCESSES: '/admin/academia/procesos',
ACADEMY_SCHEDULE: '/admin/academia/horario',

// Sistema
SYSTEM_USER: '/admin/sistema/usuario',
SYSTEM_REGISTER: '/admin/sistema/registro',
SYSTEM_MAINTENANCE: '/admin/sistema/mantenimiento',
SYSTEM_APPEARANCE: '/admin/sistema/apariencias',
};