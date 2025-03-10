// models/Institution.js

/**
 * Clase que representa una institución educativa
 */
export class Institution {
    constructor({
      id = 0,
      name = "",
      nit = "",
      address = "",
      phoneNumber = "",
      email = "",
      city = "",
      department = "",
      country = "",
      postalCode = "",
      legalRepresentative = "",
      incorporationDate = ""
    } = {}) {
      this.id = id;
      this.name = name;
      this.nit = nit;
      this.address = address;
      this.phoneNumber = phoneNumber;
      this.email = email;
      this.city = city;
      this.department = department;
      this.country = country;
      this.postalCode = postalCode;
      this.legalRepresentative = legalRepresentative;
      this.incorporationDate = incorporationDate;
    }
  
    /**
     * Convierte los datos del backend (snake_case) a formato de la clase (camelCase)
     */
    static fromBackend(data) {
      if (!data) return new Institution();
      
      return new Institution({
        id: data.id,
        name: data.name,
        nit: data.nit,
        address: data.address,
        phoneNumber: data.phoneNumber,
        email: data.email,
        city: data.city,
        department: data.department,
        country: data.country,
        postalCode: data.postalCode,
        legalRepresentative: data.legalRepresentative,
        incorporationDate: data.incorporationDate?.slice(0, 10) || ""
      });
    }
  
    /**
     * Convierte los datos de la clase (camelCase) a formato del backend (snake_case)
     */
    toBackend() {
      return {
        id: this.id,
        name: this.name,
        nit: this.nit,
        address: this.address,
        phoneNumber: this.phoneNumber,
        email: this.email,
        city: this.city,
        department: this.department,
        country: this.country,
        postalCode: this.postalCode,
        legalRepresentative: this.legalRepresentative,
        incorporationDate: this.incorporationDate
      };
    }
  }
  
  // Instancia por defecto para usar como estado inicial
  export const defaultInstitution = new Institution();
  