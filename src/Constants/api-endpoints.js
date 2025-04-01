const API_ENDPOINTS = {
    AUTH: {
       LOGIN: "/public/login",
       REFRESH_TOKEN: '/public/refresh-token',
    },
    USER: {
        GET_ALL: "/users",
        GET_BY_ID: (id) => `/users/${id}`,
        GET_DETAIL: (id) => `/users/detail/${id}`,
        UPDATE_FULL: (id) => `/users/${id}/full`,
        UPDATE_STATUS: (id) => `/users/${id}/status`,
        GET_ADMINISTRATIVE: "/roles/users/administrative",
        GET_STUDENTS: "/roles/users/students",
        CREATE_ADMINISTRATIVE: "/users/administrative",

        CREATE_STUDENT_GTW: '/private/users/students/register',

    },

    GROUPS: {
        GET_ALL: '/groups',
        ACTIVE_ALL: '/groups/active',
        STUDENT_GROUPS_ALL: '/student-groups/active',
        STUDENT_GROUPS_BY_GROUPID: (groupId) => `/student-groups/groups/${groupId}/users`,

    },

    SUBJECTS:{
        UPDATE_BY_ID: (id) => `/subjects/${id}`,
        SUBJECTS_BY_GROUPS_LEVEL: (periodId,levelId) => `/subjects-groups/periods/${periodId}/edu-level/${levelId}`,
    },
    

    EVALUATION: {
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

                GET_ALL_BY_SUBJECT: (subjectId) => `/subject_knowledge/subjects/${subjectId}`,
                
                CREATE_ACHIEVEMENT_GROUP: `/achievements-group`,

                UPDATE_ACHIEVEMENT_GROUP_BY_ID: (id) =>  `/achievements-group/${id}`,

                GET_ALL_BY_PERIOD_AND_GROUP: (periodId,groupId) =>
                    `/achievements-group/periods/${periodId}/groups/${groupId}`,
                
                GET_ALL_BY_PERIOD_AND_SUBJECT_AND_GROUP: 
                (periodId,subjectId,groupId) =>
                `/achievements-group/periods/${periodId}/subjects/${subjectId}/groups/${groupId}`,

                GROUP:{
                    GET_ALL_BY_PERIOD_AND_GROUP: (periodId,groupId) =>
                        `/subjects-groups/groups/${groupId}/periods/${periodId}`,
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
            UPDATE_BY_ID: (id) => `/subjects-dimensions/${id}`,
        },
    },

    ID_TYPE: {
        GET_ALL: "/id-types"
    },

    ROLE:{
        GET_ALL: '/roles',
    },

    

}

const SERVICES={
    ACADEMY: '/academy',

    GATEAWAY: '/gtw',
}

export default { SERVICES , API_ENDPOINTS}



