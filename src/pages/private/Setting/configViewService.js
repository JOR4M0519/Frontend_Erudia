import { BehaviorSubject } from "rxjs";
import { request } from "../../../services/config/axios_helper";
//import { request } from "../utilities/api"; // Ajusta la ruta según corresponda

// 🔹 BehaviorSubject para manejar períodos de manera reactiva
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
      const response = await request("GET", "academy", `/periods/active/${year}`, {});
      if (response.status === 200 && response.data.length > 0) {
        periodsSubject.next(response.data);
        selectedPeriodSubject.next(response.data[0].id); // Seleccionar el primer período por defecto
      }
    } catch (error) {
      console.error("Error durante la carga de períodos:", error);
    }
  },
};

export default configViewService;