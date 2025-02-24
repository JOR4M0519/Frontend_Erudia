import { motion } from "framer-motion";

/**
 * 📌 Componente base para botones reutilizables.
 * @param {string} className - Clases adicionales de Tailwind para estilos.
 * @param {Function} onClick - Función que se ejecuta al hacer clic.
 * @param {ReactNode} children - Contenido del botón (texto, icono, etc.).
 * @param {boolean} confirmExit - Si es `true`, muestra confirmación antes de ejecutar `onClick`.
 */
export default function BaseButton({ className, onClick, children }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`cursor-pointer px-4 py-2 rounded-lg transition-colors ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
