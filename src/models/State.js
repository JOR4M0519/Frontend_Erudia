export class State {
    constructor() {
      this.estados = {
        "A": "Activo",
        "I": "Inactivo",
        "P": "Pendiente",
        "S": "Suspendido",
        "C": "Cancelado",
        "F": "Finalizado"
      };
    } 
  
    getName(codigo) {
      return this.estados[codigo] || "Desconocido";
    }

    getStatusClass(status) {
      const statusColors = {
        "A": "bg-green-100 text-green-700 border border-green-400",      // Activo
        "I": "bg-gray-100 text-gray-700 border border-gray-400",         // Inactivo
        "P": "bg-yellow-100 text-yellow-700 border border-yellow-400",   // Pendiente
        "S": "bg-red-100 text-red-700 border border-red-400",            // Suspendido
        "C": "bg-orange-100 text-orange-700 border border-orange-400",   // Cancelado
        "F": "bg-blue-100 text-blue-700 border border-blue-400"          // Finalizado
      };
    
      return statusColors[status] || "bg-gray-100 text-gray-600 border border-gray-400"; // Si no hay coincidencia
    }
    
  }

  