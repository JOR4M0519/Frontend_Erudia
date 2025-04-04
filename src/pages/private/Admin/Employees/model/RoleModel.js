// src/models/RoleModel.js

export class RoleModel {
    /**
     * @param {number} id - ID del rol
     * @param {string} roleName - Nombre del rol
     * @param {boolean} status - Estado del rol (activo/inactivo)
     * @param {Array} rolePerms - Permisos asociados al rol
     * @param {Array} userRoles - Usuarios asociados al rol
     */
    constructor(id, roleName, status, rolePerms = [], userRoles = []) {
        this.id = id;
        this.roleName = roleName;
        this.status = status;
        this.rolePerms = rolePerms;
        this.userRoles = userRoles;
    }

    /**
     * Crea una instancia de RoleModel a partir de un objeto JSON
     * @param {Object} json - Objeto JSON con datos del rol
     * @returns {RoleModel} Instancia de RoleModel
     */
    static fromJson(json) {
        return new RoleModel(
            json.id,
            json.roleName,
            json.status,
            json.rolePerms || [],
            json.userRoles || []
        );
    }

    /**
     * Convierte la instancia de RoleModel a un objeto JSON
     * @returns {Object} Objeto JSON con datos del rol
     */
    toJson() {
        return {
            id: this.id,
            roleName: this.roleName,
            status: this.status,
            rolePerms: this.rolePerms,
            userRoles: this.userRoles
        };
    }
}
