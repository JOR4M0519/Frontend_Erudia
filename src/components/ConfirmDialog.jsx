import Swal from "sweetalert2";

/**
 * 📌 Función que muestra un cuadro de diálogo reutilizable con diferentes tipos de alertas.
 * @param {string} title - Título de la alerta.
 * @param {string} text - Texto descriptivo.
 * @param {string} confirmButtonText - Texto del botón de confirmar.
 * @param {string} cancelButtonText - Texto del botón de cancelar.
 * @param {"warning" | "success" | "error" | "info" | "question"} type - Tipo de alerta.
 * @returns {Promise<boolean>} - Retorna `true` si el usuario confirma, `false` si cancela.
 */
export const ConfirmDialog = async ({
  title = "¿Estás seguro?",
  text = "Esta acción no se puede deshacer.",
  confirmButtonText = "Sí, continuar",
  cancelButtonText = "Cancelar",
  type = "warning", //  Tipo de alerta por defecto
}) => {
  
  //  Definir colores según el tipo de alerta
  const colorMap = {
    warning: { confirm: "#f39c12", cancel: "#d33" },
    success: { confirm: "#28a745", cancel: "#6c757d" },
    error: { confirm: "#dc3545", cancel: "#6c757d" },
    info: { confirm: "#17a2b8", cancel: "#6c757d" },
    question: { confirm: "#007bff", cancel: "#6c757d" },
  };

  const result = await Swal.fire({
    title,
    text,
    icon: type, //  Usa el tipo dinámico de icono
    showCancelButton: true,
    confirmButtonColor: colorMap[type]?.confirm || "#3085d6",
    cancelButtonColor: colorMap[type]?.cancel || "#d33",
    confirmButtonText,
    cancelButtonText,
  });

  return result.isConfirmed; //  Retorna `true` si confirmó, `false` si canceló.
};

export default ConfirmDialog;