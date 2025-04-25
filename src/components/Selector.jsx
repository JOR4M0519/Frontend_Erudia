import { Calendar, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Importamos motion

export default function Selector({
  selectedItem,
  setSelectedItem,
  items = [],
  itemKey = "id",
  itemLabel = "name",
  placeholder = "Seleccione una opción",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Mantener la lógica original intacta
  useEffect(() => {
    if (!selectedItem && items.length > 0) {
      setSelectedItem(items[0][itemKey]);
    }
  }, [items, selectedItem, setSelectedItem, itemKey]);

  // Encuentra el item seleccionado para mostrar su nombre
  const selectedItemObject = items.find(item => item[itemKey] === selectedItem);
  const displayText = selectedItemObject ? selectedItemObject[itemLabel] : placeholder;

  // Manejar el clic fuera del selector para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.selector-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Manejar la selección de un ítem
  const handleSelectItem = (item) => {
    setSelectedItem(item[itemKey]);
    setIsOpen(false);
  };

  return (
    <div className="selector-container relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center justify-between min-w-[180px] px-4 py-2 rounded-lg 
                   bg-white border border-gray-300 shadow-sm hover:border-gray-400 
                   focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors cursor-pointer ${className}`}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium text-gray-800 truncate">
            {displayText}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="max-h-48 overflow-y-auto py-1">
              {items.map((item) => (
                <motion.div
                  key={item[itemKey]}
                  onClick={() => handleSelectItem(item)}
                  whileHover={{ backgroundColor: "#f3f4f6" }}
                  className={`px-4 py-2 cursor-pointer text-sm transition-colors
                             ${selectedItem === item[itemKey] ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-700'}`}
                >
                  {item[itemLabel]}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
