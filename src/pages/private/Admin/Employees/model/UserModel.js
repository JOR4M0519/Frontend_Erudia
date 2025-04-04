export class UserModel {
    /**
     * @param {number} id - ID único del usuario
     * @param {string} username - Nombre de usuario
     * @param {string} email - Correo electrónico
     * @param {string} password - Contraseña (hash)
     * @param {string} status - Estado (A: Activo, I: Inactivo)
     * @param {string} lastName - Apellido
     * @param {string} firstName - Nombre
     * @param {string} uuid - Identificador único universal
     * @param {string|null} promotionStatus - Estado de promoción (P: Pendiente, null: No aplica)
     */
    constructor(
      id,
      username,
      email,
      password,
      status,
      lastName,
      firstName,
      uuid,
      promotionStatus
    ) {
      this.id = id;
      this.username = username;
      this.email = email;
      this.password = password;
      this.status = status;
      this.lastName = lastName;
      this.firstName = firstName;
      this.uuid = uuid;
      this.promotionStatus = promotionStatus;
    }
  
    /**
     * Obtiene el nombre completo del usuario
     * @returns {string} Nombre completo
     */
    get fullName() {
      return `${this.firstName} ${this.lastName}`;
    }
  
    /**
     * Obtiene el estado legible del usuario
     * @returns {string} Estado en formato legible
     */
    get statusText() {
      return this.status === 'A' ? 'Activo' : 'Inactivo';
    }
  }