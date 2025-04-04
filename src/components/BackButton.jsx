import { motion } from "framer-motion";
import { Undo2 } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";

/**
 * 📌 Botón reutilizable para regresar a la página anterior.
 * @param {Function} onClick - Función que se ejecuta al hacer clic en el botón.
 * @param {boolean} confirmExit - Si es `true`, muestra una alerta antes de salir.
 */
export default function BackButton({ onClick, confirmExit = false, className}) {
  
  const handleBackClick = async () => {
    if (confirmExit) {
      const isConfirmed = await ConfirmDialog({
        title: "¿Salir de la ventana?",
        text: "Si sales, perderás cualquier progreso no guardado.",
        confirmButtonText: "Sí, salir",
        cancelButtonText: "Cancelar",
        type: "warning",
      });

      if (!isConfirmed) return; // 🔹 Si el usuario cancela, no ejecuta `onClick`
    }

    if (onClick) onClick(); // 🔹 Ejecuta la acción original si no hay confirmación o si el usuario acepta
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }} // 🔹 Animación al pasar el mouse
      whileTap={{ scale: 0.95 }} // 🔹 Efecto al hacer clic
      className="flex cursor-pointer items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-white px-5 py-2.5 rounded-lg shadow-md transition duration-200"
      onClick={handleBackClick} // 🔹 Llama a la nueva función con confirmación opcional
    >
      <Undo2 className="w-5 h-5" />
      <span>Regresar</span>
    </motion.button>
  );
}
