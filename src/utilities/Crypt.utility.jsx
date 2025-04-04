import CryptoJS from "crypto-js";
import { persistStorage } from "./webStorage.utility";
import { UserInfo } from "../models";
import {config} from "./";

/**
 * Encripta la Data.
 */
export const encryptData = (data) => {
    return CryptoJS.AES.encrypt(data, config.encryptionKey).toString();
};

/**
 * Desencripta la Data.
 */
export const decryptData = (encryptedData) => {
    return CryptoJS.AES.decrypt(encryptedData, config.encryptionKey).toString(CryptoJS.enc.Utf8);
};


/**
 * Codifica la Data.
 */
export const encodeData = (data) => {
    return CryptoJS.SHA256(data).toString();
};


/**
 * Obtiene los roles desencriptados desde sessionStorage.
 */
export const decodeRoles = (roles) => {
    try {
        // Si no hay roles, devolver array vacío
        if (!roles || roles.length === 0) {
            return [];
        }

        // Verificar si estamos recibiendo objetos UserRoleDomain
        if (typeof roles[0] === 'object') {
            // Extraer el nombre del rol de cada objeto y luego desencriptar
            return roles.map(roleObj => {
                // Verificar la estructura del objeto para acceder al nombre del rol
                const roleName = roleObj.role?.name || roleObj.name || roleObj.roleName || '';
                return decryptData(roleName);
            });
        } else {
            // Mantener la compatibilidad con el formato anterior (array de strings)
            return roles.map(role => decryptData(role));
        }
    } catch (error) {
        console.error("Error al desencriptar los roles:", error);
        return [];
    }
};


/**
* Guarda los roles encriptados en sessionStorage. Desuso
*/
export const storeEncryptedRoles = (roles) => {
    const encryptedRoles = roles.map(role => encryptData(role));
    persistStorage(UserInfo.rol, JSON.stringify(encryptedRoles));
};
