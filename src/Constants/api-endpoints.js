const API_ENDPOINTS = {
    AUTH: {
       LOGIN: "/public/login",
       REFRESH_TOKEN: '/public/refresh-token',
    },
    USER: {
        GET_ALL: "/users",
        UPDATE_USER_PASSWORD_BY_USERNAME: `/private/users/password`,
        GET_BY_ID: (id) => `/users/${id}`,
        
        GET_DETAIL: (id) => `/users/detail/${id}`,
        UPDATE_DETAIL_BY_ID: (id) => `/users/detail/${id}`,
        UPDATE_ALL_DETAIL_BY_ID: (id) => `/users/detail/${id}/all`,

        UPDATE_FULL: (id) => `/users/${id}/full`,
        UPDATE_STATUS: (id) => `/users/${id}/status`,
        GET_ADMINISTRATIVE: "/roles/users/administrative",
        GET_STUDENTS: "/roles/users/students",
        
        FAMILY: {
            // Endpoints del UserController
            //GET_ALL_USERS_WITH_RELATIONS: `/users/detail/family`,
            //GET_USER_RELATIVES: (userId) => `/users/detail/family/${userId}`,
            //GET_STUDENTS_BY_RELATIVE: (relativeId) => `/users/detail/family/${relativeId}/students`,
            //CREATE_FAMILY_RELATION: (userId) => `/users/detail/family/create/${userId}`,
            //GET_FAMILY_REPORTS: `/users/detail/families/report`,
            
            // Endpoints del nuevo FamilyControllerDetail
            ALL_USERS_WITH_RELATIONS: `/families/users`,
            CREATE_RELATIONS: `/families`,
            UPDATE_RELATION: (id) => `/families/${id}`,
            DELETE_RELATION: (id) => `/families/${id}`,
            GET_RELATIONS_BY_USER: (userId) => `/families/users/${userId}`,
            GET_REPORTS: `/families/reports`,
            RELATION_TYPE:{
                GET_ALL: "/relationship-types", 
                CREATE: '/relationship-types',
                DELETE_BY_ID: (id) => `/relationship-types/${id}`,
                GET_BY_ID: (id) => `/relationship-types/${id}`,
                UPDATE_BY_ID: (id) => `/relationship-types/${id}`,
            }
          },

        CREATE_ADMINISTRATIVE_GTW: "/private/users/register",
        CREATE_STUDENT_GTW: '/private/users/students/register',
    },

    GROUPS: {
        GET_ALL: '/groups',
        CREATE: '/groups',
        ACTIVE_ALL: '/groups/active',
        UPDATE_BY_ID: (id) => `/groups/${id}`,
        DELETE_BY_ID: (id) => `/groups/${id}`,
        STUDENT_GROUPS_ALL: '/student-groups/active',
        STUDENT_GROUPS_BY_GROUPID: (groupId) => `/student-groups/groups/${groupId}/users`,

    },
    
    SUBJECTS:{
        GET_ALL: '/subjects',
        CREATE: '/subjects',
        UPDATE_BY_ID: (id) => `/subjects/${id}`,
        DELETE_BY_ID: (id) => `/subjects/${id}`,
        SUBJECTS_BY_GROUPS_LEVEL: (periodId,levelId) => `/subjects-groups/periods/${periodId}/edu-level/${levelId}`,
    
        PROFESSORS:{
            GET_ALL:  `/subjects/professors`,
            CREATE: `/subjects/professors`,
            UPDATE_BY_ID:  (id) => `/subjects/professors/${id}`,
            DELETE_BY_ID: (id) => `/subjects/professors/${id}`,
        },

        GROUPS: {
            GET_ALL_BY_PERIOD_AND_SUBJECT: (periodId,subjectId) => `/subjects-groups/periods/${periodId}/subjects/${subjectId}`,
            GET_ALL_BY_PERIOD_AND_SUBJECT_PROFESSOR_AND_GROUP: (periodId,subjectId,groupId) => 
                `/subjects-groups/periods/${periodId}/subjects/${subjectId}/groups/${groupId}`
        },
    },
    

    EVALUATION: {

        REPORTS:{
             // Endpoints para descarga forzada como PDF (attachment)
             DOWNLOAD_GROUP_REPORT: (groupId, periodId) =>
                `/reports/pdf/group/${groupId}/period/${periodId}`,
            DOWNLOAD_STUDENT_REPORT: (studentId, groupId, periodId) =>
                `/reports/pdf/group/${groupId}/student/${studentId}/period/${periodId}`,
            
            // Endpoints para visualización online (sin attachment)
            VIEW_GROUP_REPORT_ONLINE: (groupId, periodId) =>
                `/reports/group/${groupId}/period/${periodId}`,
            VIEW_STUDENT_REPORT_ONLINE: (studentId, periodId) =>
                `/reports/student/${studentId}/period/${periodId}`,
        
        },

        GRADE_DISTRIBUTION: (year,periodId,levelId,subjectId) =>
        `/subject-grade/report/distribution?year=${year}&periodId=${periodId}&levelId=${levelId}&subjectId=${subjectId}`,
        RECOVERY:{
            REPORT: (subjectId, levelId, year) => 
                `/subject-grade/subjects/${subjectId}/edu-levels/${levelId}/recovery?year=${year}`,
            CREATE_RECOVER_SUBJECT_BY_STUDENT: (idStudent,idSubject,idPeriod,newScore) =>
                `/subject-grade/recover?idStudent=${idStudent}&idSubject=${idSubject}&idPeriod=${idPeriod}&newScore=${newScore}`,
            EDIT_RECOVER_SUBJECT_BY_STUDENT: (recoveryId,newScore,status) =>
                `/subject-grade/recover/${recoveryId}?newScore=${newScore}&status=${status}`,
            DELETE_RECOVER_SUBJECT_BY_STUDENT: (recoverId) =>
                `/subject-grade/recover/${recoverId}`,
        },

        GRADE_SETTINGS:{
            GET_ALL: '/grade-settings',
            CREATE: `/grade-settings`,
            UPDATE_BY_ID:  (id) => `/grade-settings/${id}`,
            DELETE_BY_ID:  (id) => `/grade-settings/${id}`,

        },

        KNOWLEDGES:{
            GET_ALL: `/knowledge`,
            CREATE: `/knowledge`,
            UPDATE_BY_ID:  (id) => `/knowledge/${id}`,
            DELETE_BY_ID:  (id) => `/knowledge/${id}`,
            
            SUBJECTS:{
                GET_ALL: `/subject_knowledge`,
                CREATE: `/subject_knowledge`,
                UPDATE_BY_ID:  (id) => `/subject_knowledge/${id}`,
                DELETE_BY_ID:  (id) => `/subject_knowledge/${id}`,

                GET_ALL_BY_SUBJECT: (subjectId) => `/subject_knowledge/subjects/${subjectId}`, //Eliminar, descontinuada
                GET_ALL_BY_SUBJECT_AND_GROUP: (subjectId,groupId) => `/subject_knowledge/subjects/${subjectId}/groups/${groupId}`,
                
                CREATE_ACHIEVEMENT_GROUP: `/achievements-group`,

                UPDATE_ACHIEVEMENT_GROUP_BY_ID: (id) =>  `/achievements-group/${id}`,

                GET_ALL_BY_PERIOD_AND_GROUP: (periodId,groupId) =>
                    `/achievements-group/periods/${periodId}/groups/${groupId}`,
                
                GET_ALL_BY_PERIOD_AND_SUBJECT_AND_GROUP: 
                (periodId,subjectId,groupId) =>
                `/achievements-group/periods/${periodId}/subjects/${subjectId}/groups/${groupId}`,

                GROUP:{
                    GET_ALL: `/subjects-groups`,
                    GET_ALL_BY_PERIOD_AND_GROUP: (periodId,groupId) =>
                        `/subjects-groups/groups/${groupId}/periods/${periodId}`,
                    CREATE: `/subjects-groups`,
                    UPDATE_BY_ID: (subjectGroupId) =>
                        `/subjects-groups/${subjectGroupId}`,
                    DELETE_BY_ID: (subjectGroupId) =>
                        `/subjects-groups/${subjectGroupId}`,
                },

            },
            
        },

    },
    
    PERIODS:{
        GET_ALL: `/periods`,
        GET_ALL_BY_YEAR: (year) => `/periods/years/${year}`,
        GET_ALL_BY_YEAR_ACTIVE: (year) => `/periods/active/${year}`,
        GET_ALL_BY_SETTING_AND_YEAR: (settingId,year) => 
            `/periods/settings/${settingId}/active/${year}`,
        GET_PERCENTAGE_VALIDATION_BY_YEAR: (year) => 
            `/periods/verify-year/${year}`,

        CREATE: `/periods`,
        UPDATE_BY_ID:  (id) => `/periods/${id}`,
    },
    
    EDUCATIONAL_LEVELS:{
        GET_ALL: `/educational-levels`,
        GET_BY_ID: (levelId) => `/educational-levels/${levelId}`,
        CREATE: `/educational-levels`,
        UPDATE_BY_ID:  (id) => `/educational-levels/${id}`,
        DELETE_BY_ID:  (id) => `/educational-levels/${id}`,
    },

    DIMENSIONS:{
        GET_ALL: `/dimensions`,
        UPDATE_BY_ID: (id) => `/dimensions/${id}`,
        CREATE_DIMENSION: `/dimensions`,
        DELETE_BY_ID: (id) => `/dimensions/${id}`,
        
        RELATION_SUBJECTS: {
            GET_GROUP_BY_DIMENSIONS: "/subjects-dimensions",
            CREATE: "/subjects-dimensions",
            UPDATE_BY_ID: (id) => `/subjects-dimensions/${id}`,
            DELETE_BY_ID: (id) => `/subjects-dimensions/${id}`,
        },
    },

    ID_TYPE: {
        GET_ALL: "/id-types"
    },

    ROLE:{
        GET_ALL: '/roles',
    },

    ACTIVITIES:{
        GET_ALL: '/activities',
        UPDATE_ACHIEVEMENT_BY_ID: (activityId,knowledgeId) => `/activities/${activityId}/knowledges/${knowledgeId}`,
        
    },

    

}

const SERVICES={
    ACADEMY: '/academy',

    GATEAWAY: '/gtw',
}

export default { SERVICES , API_ENDPOINTS}



