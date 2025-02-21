import { BehaviorSubject } from "rxjs";
import { request } from "./config/axios_helper";
import { Roles } from "../models";
import { encryptData } from "../utilities";

/**
 * Servicio para manejar datos de usuarios y roles.
 */
const userData$ = new BehaviorSubject(null);

/**
 * Almacena y gestiona datos de usuario en sesión.
 */
const storedUserData = sessionStorage.getItem("userData");
const initialUserData = storedUserData ? JSON.parse(storedUserData) : null;
const userSessionData$ = new BehaviorSubject(initialUserData);


/**
 * Obtiene los grupos de roles de un usuario.
 * @param {string} username - Nombre de usuario.
 * @returns {Promise<string[]>} - Lista de grupos de roles del usuario.
 */
const getRoleGroups = async (username) => {
  try {
    const response = await request(
      "GET",
      "gtw", // Ajusta el servicio si es necesario
      `/private/users/${username}/roles`,
      {}
    );

    if (response.status === 200) {
        const userRoles = response.data

       // Filtrar los roles válidos
        const assignedRoles = userRoles.filter(role => Object.values(Roles).includes(role));
      
        // Encriptar los roles antes de almacenarlos
        const encryptedRoles = assignedRoles.map(role => encryptData(role));
       
      return encryptedRoles || [];
    }

    return [];
  } catch (error) {
    console.error(`Error al obtener los roles del usuario ${username}:`, error);
    return [];
  }
};

export const userDataService = {
  getRoleGroups,
  getUserData: () => userData$.asObservable(),
  getUserDataValue: () => userData$.value,

  setUserData: (data) => {
    userData$.next(data);
    sessionStorage.setItem("userData", JSON.stringify(data));
  },

  clearUserData: () => {
    userData$.next(null);
    sessionStorage.removeItem("userData");
  },
};





export default { userDataService };