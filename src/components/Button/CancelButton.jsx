import BaseButton from "./BaseButton";

import { ConfirmDialog } from "../index";
/**
 * 📌 Botón para cancelar con confirmación opcional.
 * @param {Function} onClick - Acción al cancelar.
 * @param {boolean} confirmExit - Si `true`, pregunta antes de cancelar.
 */
export default function CancelButton({ onClick, confirmExit = false }) {
  const handleCancel = async () => {
    if (confirmExit) {
      const isConfirmed = await ConfirmDialog({
        title: "¿Cancelar cambios?",
        text: "Perderás cualquier progreso no guardado.",
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "Volver",
        type: "warning",
      });

      if (!isConfirmed) return;
    }

    if (onClick) onClick();
  };

  return (
    <BaseButton
      onClick={handleCancel}
      className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
    >
      Cancelar
    </BaseButton>
  );
}
