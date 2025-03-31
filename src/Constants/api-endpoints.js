const API_ENDPOINTS = {
    AUTH: {
       LOGIN: "/public/login",
    },
    USER: {
        GET_ALL: "/users",
        GET_BY_ID: (id) => `/users/${id}`,
        GET_DETAIL: (id) => `/users/detail/${id}`,
        UPDATE_FULL: (id) => `/users/${id}/full`,
        UPDATE_STATUS: (id) => `/users/${id}/status`,
        GET_ADMINISTRATIVE: "/roles/users/administrative",
        GET_STUDENTS: "/roles/users/students",
        CREATE_ADMINISTRATIVE: "/users/administrative"
    },

    GROUPS: {
        GET_ALL: '/groups',
        ACTIVE_ALL: '/groups/active',
        STUDENT_GROUPS_ALL: '/student-groups/active',
        STUDENT_GROUPS_BY_GROUPID: (groupId) => `/student-groups/groups/${groupId}/users`,

    },

    SUBJECTS:{
        SUBJECTS_BY_GROUPS_LEVEL: (periodId,levelId) => `/subjects-groups/periods/${periodId}/edu-level/${levelId}`,
        GET_GROUP_BY_DIMENSIONS: "/subjects-dimensions",
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
            GET_ALL: '/grade-settings'

        },

        KNOWLEDGES:{
            GET_ALL: `/knowledge`,
            SUBJECTS:{
                GET_ALL: `/subject_knowledge`,
                GET_ALL_BY_PERIOD_AND_GROUP: (periodId,groupId) =>
                    `/achievements-group/periods/${periodId}/groups/${groupId}`
            },
            
        },

    },
    
    PERIODS:{
        GET_ALL: `/periods`,
        GET_ALL_BY_YEAR: (year) => `/periods/years/${year}`,
        GET_ALL_BY_YEAR_ACTIVE: (year) => `/periods/active/${year}`,
        GET_ALL_BY_SETTING_AND_YEAR: (settingId,year) => 
            `/periods/settings/${settingId}/active/${year}`
    },
    
    EDUCATIONAL_LEVELS:{
        GET_ALL: `/educational-levels`,
        GET_BY_ID: (levelId) => `/educational-levels/${levelId}`,
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



