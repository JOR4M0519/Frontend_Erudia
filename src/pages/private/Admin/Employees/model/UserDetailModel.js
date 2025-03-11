// src/models/UserDetailModel.js

import { UserModel } from './UserModel';
import { IdTypeModel } from './IdTypeModel';

/**
 * Modelo para representar los detalles completos de un usuario
 */
export class UserDetailModel {
  /**
   * @param {number} id - ID único del detalle de usuario
   * @param {UserModel} user - Usuario asociado
   * @param {string} firstName - Primer nombre
   * @param {string} middleName - Segundo nombre
   * @param {string} lastName - Primer apellido
   * @param {string} secondLastName - Segundo apellido
   * @param {string} address - Dirección
   * @param {string} phoneNumber - Número de teléfono
   * @param {string} dateOfBirth - Fecha de nacimiento
   * @param {string} dni - Documento de identidad
   * @param {IdTypeModel} idType - Tipo de documento
   * @param {string} neighborhood - Barrio
   * @param {string} city - Ciudad
   * @param {string} positionJob - Cargo laboral
   * @param {Array} relatives - Familiares asociados (opcional)
   */
  constructor(
    id,
    user,
    firstName,
    middleName,
    lastName,
    secondLastName,
    address,
    phoneNumber,
    dateOfBirth,
    dni,
    idType,
    neighborhood,
    city,
    positionJob,
    relatives = null
  ) {
    this.id = id;
    this.user = user;
    this.firstName = firstName;
    this.middleName = middleName;
    this.lastName = lastName;
    this.secondLastName = secondLastName;
    this.address = address;
    this.phoneNumber = phoneNumber;
    this.dateOfBirth = dateOfBirth;
    this.dni = dni;
    this.idType = idType;
    this.neighborhood = neighborhood;
    this.city = city;
    this.positionJob = positionJob;
    this.relatives = relatives;
  }

  /**
   * Obtiene el nombre completo del usuario
   * @returns {string} Nombre completo
   */
  get fullName() {
    let name = this.firstName;
    if (this.middleName) name += ` ${this.middleName}`;
    name += ` ${this.lastName}`;
    if (this.secondLastName) name += ` ${this.secondLastName}`;
    return name;
  }
}
