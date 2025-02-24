import ConfirmDialog from "../ConfirmDialog";
import { X } from "lucide-react";
import BaseButton from "./BaseButton";

/**
 * 📌 Botón para cerrar con confirmación opcional.
 * @param {Function} onClick - Función al cerrar.
 * @param {boolean} confirmExit - Si `true`, pregunta antes de cerrar.
 */
export default function XButton({ onClick, confirmExit = false }) {
  const handleClose = async () => {
    if (confirmExit) {
      const isConfirmed = await ConfirmDialog({
        title: "¿Cerrar ventana?",
        text: "Perderás los cambios no guardados.",
        confirmButtonText: "Sí, cerrar",
        cancelButtonText: "Cancelar",
        type: "warning",
      });

      if (!isConfirmed) return;
    }

    if (onClick) onClick();
  };

  return (
    <BaseButton
      onClick={handleClose}
      className="text-gray-500 hover:text-gray-700"
    >
      <X className="w-5 h-5" />
    </BaseButton>
  );
}
