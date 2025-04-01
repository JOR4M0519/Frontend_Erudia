import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { setupAxiosInterceptors } from "./axios_helper";

// Token expiration configuration
const TOKEN_EXPIRY_THRESHOLD = 30; // seconds before expiration to show warning

/**
 * Checks if token is about to expire within threshold
 * @param {string} token - JWT token
 * @returns {boolean} True if token expires soon, false otherwise
 */
export const isTokenExpiringSoon = (token) => {
  try {
    const decoded = jwtDecode(token);
    const expTime = decoded.exp * 1000; // Convert from seconds to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiry = expTime - currentTime;
    
    // Return true if token expires within threshold (but not if already expired)
    return timeUntilExpiry > 0 && timeUntilExpiry < TOKEN_EXPIRY_THRESHOLD * 1000;
  } catch (error) {
    console.error("Error checking if token expires soon:", error);
    return false;
  }
};

/**
 * TokenRefreshAlert component - Shows a notification when token is about to expire
 * with option to extend session
 */
const TokenRefreshAlert = () => {
  const [show, setShow] = useState(false);
  const [countdown, setCountdown] = useState(TOKEN_EXPIRY_THRESHOLD);
  const [refreshing, setRefreshing] = useState(false);
  
  // Check token expiration periodically
  useEffect(() => {
    let isMounted = true;
    const checkTokenExpiration = () => {
      if (!isMounted) return;
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        
        if (userData && userData.token) {
          if (isTokenExpiringSoon(userData.token)) {
            setShow(true);
          } else {
            setShow(false);
            setCountdown(TOKEN_EXPIRY_THRESHOLD);
          }
        }
      } catch (error) {
        console.error("Error checking token expiration:", error);
      }
    };

    // Check immediately and then every 5 seconds (reduced frequency to avoid performance issues)
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 5000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Countdown timer when alert is shown
  useEffect(() => {
    let timer;
    
    if (show && !refreshing) {
      timer = setInterval(() => {
        setCountdown(prevCountdown => {
          if (prevCountdown <= 1) {
            // Time's up, initiate refresh as last attempt
            handleRefresh();
            clearInterval(timer);
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [show, refreshing]);
  const handleRefresh = async () => {
    if (refreshing) return; // Prevenir múltiples intentos simultáneos
    try {
      setRefreshing(true);
      const { refreshToken } = await import('./axios_helper');
      const success = await refreshToken();
      
      if (success) {
        setShow(false);
        setCountdown(TOKEN_EXPIRY_THRESHOLD);
        toast.success("Sesión extendida exitosamente");
      } else {
        // Solo cerrar sesión si no se pudo refrescar
        toast.error("No se pudo extender la sesión. Por favor, inicie sesión nuevamente.");
        setTimeout(() => {
          localStorage.removeItem("user");
          sessionStorage.clear();
          window.location.href = "/login";
        }, 1500);
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      toast.error("Error al extender la sesión");
    } finally {
      setRefreshing(false);
    }
  };
  
  // Only render if the alert should be shown
  if (!show) return null;
  
  // Use portal to render at the root level
  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50 bg-white border border-yellow-300 shadow-lg rounded-lg p-4 max-w-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-yellow-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">Su sesión está por expirar</h3>
          <p className="mt-1 text-sm text-gray-600">
            Su sesión expirará en <span className="font-bold">{countdown}</span> segundos.
          </p>
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center px-3 py-1.5 ${refreshing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white text-sm font-medium rounded-md`}
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Extendiendo...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  Extender sesión
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>,
    document.body
  );
};

/**
 * Initializes token refresh handling system
 * To be called once at app initialization
 */
export const setupTokenRefreshSystem = () => {
  // Set up axios interceptors for automatic token handling
  console.log("Setting up token refresh system");
  setupAxiosInterceptors();
};

// Exportar el componente para usarlo en Dashboard
export { TokenRefreshAlert as default, TokenRefreshAlert };