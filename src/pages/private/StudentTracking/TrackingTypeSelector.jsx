// components/TrackingTypeSelector.jsx
import { useState, useEffect } from "react";

import { Spinner } from "../../../components";
import { studentTrackingService } from "./studentTrackingService";


export default function TrackingTypeSelector({ value, onChange }) {
  const [trackingTypes, setTrackingTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrackingTypes = async () => {
      setLoading(true);

      try {
        // Usando correctamente la función request según tu implementación
        const response = await studentTrackingService.getTrackingTypes();
        
        setTrackingTypes(response || []);
      } catch (error) {
        console.error("Error al cargar tipos de seguimiento:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingTypes();
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Tipo de Seguimiento</label>
      <div className="relative">
        <select 
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
        >
          <option value="">Seleccionar tipo de seguimiento</option>
          {trackingTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.type}
               {/* - {type.description || ''} */}
            </option>
          ))}
        </select>
        {loading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
