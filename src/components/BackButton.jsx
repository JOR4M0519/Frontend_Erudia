import { motion } from "framer-motion";
import { Undo2 } from "lucide-react";

export default function BackButton({onClick}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }} // Pequeña animación al pasar el mouse
      whileTap={{ scale: 0.95 }} // Efecto al hacer clic
      className="flex cursor-pointer items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg shadow-md transition duration-200"
      onClick={onClick} // Aseguramos que el evento se propague correctamente
    >
      <Undo2 className="w-5 h-5" />
      <span>Regresar</span>
    </motion.button>
  );
}
