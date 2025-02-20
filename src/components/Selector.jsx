import { useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function Selector({
  selectedItem,
  setSelectedItem,
  items = [],
  itemKey = "id",
  itemLabel = "name",
  placeholder = "Seleccione una opción"
}) {
  
  //Selecciona el primer elemento automáticamente si no hay uno seleccionado
  useEffect(() => {
    if (!selectedItem && items.length > 0) {
      setSelectedItem(items[0][itemKey]);
    }
  }, [items, selectedItem, setSelectedItem]); // Se ejecuta cuando cambian `items` o `selectedItem`

  return (
    <div className="relative flex-grow">
      <select
        value={selectedItem ?? ""}
        onChange={(e) => setSelectedItem(e.target.value)}
        className="appearance-none w-full bg-gray-50 border border-gray-300 
          text-gray-700 px-4 py-1 pr-10 rounded-lg focus:ring-2 
          focus:ring-blue-400 focus:border-blue-500 transition 
          cursor-pointer hover:bg-gray-100"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {items.length > 0 &&
          items.map((item) => (
            <option key={item[itemKey]} value={item[itemKey]} className="py-2">
              {item[itemLabel]}
            </option>
          ))}
      </select>

      {/* 🔹 Icono de dropdown */}
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
    </div>
  );
}
