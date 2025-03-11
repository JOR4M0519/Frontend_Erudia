export class IdTypeModel {
    /**
     * @param {number} id - ID único del tipo de identificación
     * @param {string} name - Nombre del tipo de identificación (CC, TI, etc.)
     */
    constructor(id, name) {
      this.id = id;
      this.name = name;
    }
  }