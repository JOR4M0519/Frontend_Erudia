import { Roles } from "./roles";


export const SideBarRoles = {
    DASHBOARD:      [Roles.ADMIN,Roles.TEACHER,Roles.STUDENT,Roles.USER],
    PROFILE:        [Roles.ADMIN,Roles.TEACHER,Roles.STUDENT,Roles.USER],
    GRADES:         [Roles.ADMIN,Roles.STUDENT],
    //SUBJECTS:       [Roles.ADMIN,Roles.USER],
    ACTIVITIES:     [Roles.ADMIN,Roles.STUDENT],
    STUDENTTRACKING:[Roles.ADMIN,Roles.TEACHER,Roles.STUDENT],
    ADMIN:          [Roles.ADMIN,],
    SETTINGS:       [Roles.ADMIN,]
    //SEARCH:         [Roles.ADMIN,Roles.USER],
  };
