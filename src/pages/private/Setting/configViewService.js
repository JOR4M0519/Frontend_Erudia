import { BehaviorSubject } from "rxjs";
import { request } from "../../../services/config/axios_helper";
import apiEndpoints from "../../../Constants/api-endpoints";
//import { request } from "../utilities/api"; // Ajusta la ruta según corresponda

//  BehaviorSubject para manejar períodos de manera reactiva
const periodsSubject = new BehaviorSubject([]);
const selectedPeriodSubject = new BehaviorSubject(null);

export const configViewService = {
  // Obtener el stream de períodos
  getPeriods: () => periodsSubject.asObservable(),

  // Obtener el período seleccionado como observable
  getSelectedPeriod: () => selectedPeriodSubject.asObservable(),

  // Actualizar el período seleccionado
  setSelectedPeriod: (periodId) => {
    selectedPeriodSubject.next(periodId);
  },

  // Cargar los períodos desde la API y actualizar el Subject
  loadPeriods: async () => {
    let year = new Date().getFullYear();
    try {
      const response = await request(
        "GET", 
        apiEndpoints.SERVICES.ACADEMY,
        apiEndpoints.API_ENDPOINTS.PERIODS.GET_ALL_BY_YEAR_ACTIVE(year), {});
      if (response.status === 200 && response.data.length > 0) {
        periodsSubject.next(response.data);
        selectedPeriodSubject.next(response.data[0].id); // Seleccionar el primer período por defecto
      }
    } catch (error) {
      console.error("Error durante la carga de períodos:", error);
    }
  },


 // Método para actualizar la contraseña del usuario
 updateUserPassword: async (username, loginDomain) => {
  const loginData = {
    username: username,
    lastPassword: loginDomain.lastPassword,
    password: loginDomain.password
  }

  try {
    const response = await request(
      "PUT", 
      apiEndpoints.SERVICES.GATEAWAY,
      apiEndpoints.API_ENDPOINTS.USER.UPDATE_USER_PASSWORD_BY_USERNAME,
      loginData);
    
    if (response.status === 200) {
      return response.data;
    }
    
    throw new Error("No se pudo actualizar la contraseña");
  } catch (error) {
    console.error("Error al actualizar la contraseña:", error);
    throw error; // Propagamos el error para manejarlo en el componente
  }
},


};

export default configViewService;