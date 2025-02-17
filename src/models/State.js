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
  }

  