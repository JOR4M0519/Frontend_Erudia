import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Roles } from '../../models/index';
import { encryptData, config, getStorage } from "../../utilities/index";
import { UserKey } from "../../redux/states/user";
import { toast } from "react-toastify";
import apiEndpoints from "../../Constants/api-endpoints";

// Flag to track if a token refresh is in progress
let isRefreshing = false;
// Queue of pending requests waiting for token refresh
let pendingRequests = [];

/**
 * Parses JWT token and returns expiration time in milliseconds
 * @param {string} token - JWT token
 * @returns {number} Expiration time in milliseconds
 */
export const getTokenExpiration = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000; // Convert from seconds to milliseconds
  } catch (error) {
    console.error("Error decoding token:", error);
    return 0;
  }
};

/**
 * Checks if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  try {
    const expTime = getTokenExpiration(token);
    return expTime <= Date.now();
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true; // Assume expired on error
  }
};

/**
 * Refreshes the access token using stored refresh token
 * @returns {Promise<boolean>} Success status
 */
export const refreshToken = async () => {
  try {
    // Si ya está refrescando, esperar
    if (isRefreshing) {
      return new Promise(resolve => {
        pendingRequests.push(() => resolve(true));
      });
    }
    
    isRefreshing = true;
    console.log("Attempting to refresh token...");
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || !userData.refreshToken) {
      console.log("No refresh token available");
      isRefreshing = false;
      return false;
    }
    
    // Llamada directa a axios sin usar request() para evitar bucles
    const response = await axios({
      method: 'POST',
      url: apiEndpoints.SERVICES.GATEAWAY + apiEndpoints.API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      data: {
        refreshToken: userData.refreshToken
      },
      // No usar interceptores para esta llamada
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.accessToken) {
      console.log("Token refreshed successfully");
      // Update the access token in localStorage
      userData.token = response.data.accessToken;
      // También actualizar el refreshToken si viene en la respuesta
      if (response.data.refreshToken) {
        userData.refreshToken = response.data.refreshToken;
      }
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Procesar solicitudes pendientes
      pendingRequests.forEach(cb => cb());
      pendingRequests = [];
      
      isRefreshing = false;
      return true;
    }
    
    console.log("Invalid response from refresh token endpoint");
    isRefreshing = false;
    return false;
  } catch (error) {
    console.error("Error refreshing token:", error);
    isRefreshing = false;
    return false;
  }
};

/**
 * Establece de acuerdo con el token de autenticación la decodificación
 * de los datos del usuario y encripta los roles del usuario.
 */
export const encodeUserInfo = (id, accessToken, refreshToken) => {
  try {
    const decodedToken = jwtDecode(accessToken);
    // Obtener los roles del token -> elimina el "/" y filtra solo los válidos
    const userRoles = decodedToken.roles_group && Array.isArray(decodedToken.roles_group)
      ? decodedToken.roles_group.map(role => role.replace("/", "").toLowerCase())
      : [];
    // Filtrar los roles válidos
    const assignedRoles = userRoles.filter(role => Object.values(Roles).includes(role));
    // Encriptar los roles antes de almacenarlos
    const encryptedRoles = assignedRoles.map(role => encryptData(role));
    // Retornar el usuario con datos
    return {
      id: id,
      token: accessToken,
      refreshToken: refreshToken,
      name: decodedToken.name || "",
      username: decodedToken.username || "",
      email: decodedToken.email || "",
      roles: encryptedRoles,
    };
  } catch (error) {
    console.error("Error encoding user info:", error);
    // Devolver un objeto básico para evitar errores
    return {
      id: id,
      token: accessToken,
      refreshToken: refreshToken,
      roles: []
    };
  }
};

// Configuración global de axios
axios.defaults.baseURL = config.apiBaseUrl;
axios.defaults.headers.post["Content-Type"] = "application/json";

/**
 * Sets up axios interceptors for request and response handling
 */
export const setupAxiosInterceptors = () => {
  // Eliminar cualquier interceptor anterior para evitar duplicados
  if (axios.interceptors.request.handlers.length) {
    axios.interceptors.request.handlers = [];
  }
  if (axios.interceptors.response.handlers.length) {
    axios.interceptors.response.handlers = [];
  }

  // Request interceptor
  axios.interceptors.request.use(async (config) => {
    // Skip token handling for login or refresh token requests
    if (config.url?.includes("/public/login") || config.url?.includes("/refresh-token")) {
      return config;
    }

    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      
      if (userData && userData.token) {
        // Comprobar si el token ha expirado
        if (isTokenExpired(userData.token) && !isRefreshing) {
          console.log("Token expired, attempting refresh before request");
          // Token expirado, intentar refrescar
          const refreshed = await refreshToken();
          if (refreshed) {
            // Obtener el token actualizado
            const updatedUserData = JSON.parse(localStorage.getItem("user"));
            config.headers.Authorization = `Bearer ${updatedUserData.token}`;
          } else {
            // Si no se pudo refrescar, redirigir a login
            console.log("Token refresh failed, redirecting to login");
            throw new Error("Token refresh failed");
          }
        } else {
          // Token válido o refresh en progreso, añadir a headers
          config.headers.Authorization = `Bearer ${userData.token}`;
        }
      }
    } catch (error) {
      console.error("Error in request interceptor:", error);
      // No redirigir aquí, dejar que lo maneje el interceptor de respuesta
    }
    
    return config;
  }, error => {
    return Promise.reject(error);
  });

  // Response interceptor - Mejorado para manejar token refresh
  axios.interceptors.response.use(
    response => response,
    async (error) => {
      // Obtener la configuración original de la solicitud
      const originalRequest = error.config;
      
      // Solo manejar 401 si no estamos en login o refresh y no está marcada como retry
      if (error.response && 
          error.response.status === 401 && 
          !originalRequest._retry &&
          !originalRequest.url?.includes("/public/login") && 
          !originalRequest.url?.includes("/refresh-token")) {
        
        // Marcar la solicitud como retry para evitar bucles
        originalRequest._retry = true;
        
        // Intentar refrescar el token si no está ya en proceso
        if (!isRefreshing) {
          console.log("401 error, attempting to refresh token");
          try {
            const refreshed = await refreshToken();
            if (refreshed) {
              // Reintentar la solicitud original con el nuevo token
              const userData = JSON.parse(localStorage.getItem("user"));
              originalRequest.headers.Authorization = `Bearer ${userData.token}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error("Error refreshing token after 401:", refreshError);
          }
        } else {
          // Si ya se está refrescando, encolar esta solicitud
          return new Promise(resolve => {
            pendingRequests.push(() => {
              // Reintentar con el nuevo token
              const userData = JSON.parse(localStorage.getItem("user"));
              if (userData && userData.token) {
                originalRequest.headers.Authorization = `Bearer ${userData.token}`;
                resolve(axios(originalRequest));
              } else {
                // Redirigir a login si no hay token
                redirectToLogin();
                resolve(Promise.reject(error));
              }
            });
          });
        }
        
        // Si llegamos aquí, el refresh falló o no estamos en proceso de refresh
        redirectToLogin();
      }
      
      return Promise.reject(error);
    }
  );
};

// Función auxiliar para redirigir a login
const redirectToLogin = () => {
  // Evitar redirigir si ya estamos en login
  if (window.location.href.includes("/login")) return;
  
  console.log("Redirecting to login page");
  toast.error("Sesión expirada. Por favor, inicie sesión nuevamente.");
  
  // Limpiar datos
  localStorage.removeItem("user");
  sessionStorage.clear();
  
  // Redirigir después de un pequeño retraso para mostrar el toast
  setTimeout(() => {
    window.location.href = "/login";
  }, 1000);
};

/**
 * Realiza una petición HTTP al backend utilizando Axios.
 */
export const request = (method, serviceType = "academy", url, data = {}) => {
  let withCredentials = false;
  let headers = {};

  // Obtener el token solo si no es una petición de login
  let token = null;
  if (!url.includes("/public/login")) {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData && userData.token) {
        token = userData.token;
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.log("No existe token ", e);
    }
  }

  // Lista de endpoints que requieren credenciales
  const endpointsWithCredentials = ["/public/login", "/user/session"];
  if (endpointsWithCredentials.some(endpoint => url.includes(endpoint))) {
    withCredentials = true;
  }
  return axios({
    method: method,
    url: serviceType + url,
    headers: headers,
    data: data,
    withCredentials: withCredentials,
  });
};
