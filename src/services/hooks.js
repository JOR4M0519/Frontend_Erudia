import { useEffect } from "react";

/**
 * Hook reutilizable para suscribirse a un servicio de datos basado en RxJS.
 * @param {Object} selectedUser - Usuario seleccionado.
 * @param {Object} dataService - Servicio de datos (studentDataService o teacherDataService).
 * @param {Function} setData - Función para actualizar el estado del componente.
 * @param {Object} currentData - Estado actual de los datos.
 */
export  function useSubscribeToDataService(selectedUser, dataService, setData, currentData = null)  {
  useEffect(() => {
    if (!selectedUser?.id) return;

    const subscription = dataService.getSubjects().subscribe((newData) => {
      if (JSON.stringify(newData) !== JSON.stringify(currentData)) {
        setData(newData);
      }
    });

    return () => subscription.unsubscribe();
  }, [selectedUser, currentData]);
};

/**
 * Hook para suscribirse a un servicio de datos basado en RxJS.
 * @param {Function} dataServiceMethod - Método del servicio que devuelve un observable (Ej: `configViewService.getPeriods()`).
 * @param {Function} setData - Función para actualizar el estado del componente.
 * @param {any} currentData - Estado actual de los datos (opcional).
 */
export function useSubscribeToService (dataServiceMethod, setData, currentData = null)  {
  useEffect(() => {
    const subscription = dataServiceMethod().subscribe((newData) => {
      if (currentData === null || JSON.stringify(newData) !== JSON.stringify(currentData)) {
        setData(newData);
      }
    });

    return () => subscription.unsubscribe();
  }, [currentData]);
};

export default [useSubscribeToDataService,useSubscribeToService];