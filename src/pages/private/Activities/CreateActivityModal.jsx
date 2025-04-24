import { useEffect, useState, useMemo,forwardRef} from "react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { request } from "../../../services/config/axios_helper";
import { BookOpen, ChevronDown, Calendar, Activity } from "lucide-react";
import { XButton } from "../../../components";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { activityService } from "./activityService";
import Swal from "sweetalert2";

// Registrar el idioma español para el DatePicker
registerLocale("es", es);

const CreateActivityModal = ({ isOpen, onClose, courseDataBefore, periodId, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schemeEvaluation, setSchemeEvaluation] = useState([]);
  const [selectedKnowledge, setSelectedKnowledge] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Obtener la fecha actual y el primer día del año actual
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const firstDayOfCurrentYear = new Date(currentYear, 0, 1); // 1 de enero del año actual
  
  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  const courseData = useMemo(() => ({
    subject: {
      id: courseDataBefore?.subjectId,
      name: courseDataBefore?.subjectName,
    },
    group: {
      id: courseDataBefore?.group?.id,
      groupCode: courseDataBefore?.group?.groupCode,
      name: courseDataBefore?.group?.groupName,
    },
    level: {
      id: courseDataBefore?.group?.level?.id,
      name: courseDataBefore?.group?.level?.levelName,
    },
  }), [courseDataBefore]);

  const [activityData, setActivityData] = useState({
    name: "",
    description: "",
    knowledgeId: "",
    achievementId: "",
  });

  const fetchSchemeEvaluation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await activityService.getEvaluationScheme(periodId, courseData?.subject?.id, courseData?.group?.id);

      if (response.success) {
        setSchemeEvaluation(response.data);
      } else {
        setSchemeEvaluation([]);
      }
    } catch (error) {
      console.error("Error obteniendo esquema de evaluación:", error);
      setError("No se pudo cargar el esquema de evaluación: " + (error.message || "Error de conexión"));
      setSchemeEvaluation([]);
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    if (isOpen) {
      fetchSchemeEvaluation();

      // Resetear estados
      setActivityData({
        name: "",
        description: "",
        knowledgeId: "",
        achievementId: "",
      });
      setStartDate(currentDate);
      setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      setSelectedKnowledge(null);
      setIsDropdownOpen(false);
    }
  }, [isOpen, periodId, courseData]);

  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('knowledge-dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKnowledgeSelect = (knowledge) => {
    setSelectedKnowledge(knowledge);
    setActivityData((prev) => ({
      ...prev,
      knowledgeId: knowledge.knowledge.id,
      achievementId: knowledge.achievement.id,
    }));
    setIsDropdownOpen(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setActivityData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    if (!activityData.knowledgeId || !activityData.achievementId) {
      throw new Error("Debe seleccionar un saber válido");
    }

    const selectedItem = schemeEvaluation.find((item) => item.knowledge.id === activityData.knowledgeId);
    if (!selectedItem) {
      throw new Error("Saber seleccionado no encontrado");
    }

    const response = await activityService.createActivity({
      name: activityData.name,
      description: activityData.description,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      groupId: courseData.group.id,
      achievementId: activityData.achievementId,
      status: 'A'
    });
    
    if (response.success) {
      // Asegurarse de que los datos estén completos antes de cerrar el modal
      const activityToSave = {
        ...response.data,
        group: courseData.group, // Incluir la información completa del grupo
        subject: courseData.subject, // Incluir la información de la materia si es necesaria
      };

      // Mostrar SweetAlert de éxito
      Swal.fire({
        title: '¡Éxito!',
        text: 'La actividad ha sido creada correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        onSave(activityToSave); // Pasar los datos completos
        onClose();
      });
    } else {
      setError("Error al crear la actividad: " + (response.message || "Respuesta inesperada del servidor"));
    }
  } catch (error) {
    console.error("Error creando actividad:", error);
    setError("No se pudo crear la actividad: " + (error.message || "Error desconocido"));
  } finally {
    setIsLoading(false);
  }
};

  if (!isOpen) return null;

  const courseName = [
    courseData?.group?.name,
    courseData?.level?.name,
    courseData?.subject?.name,
  ]
    .filter(Boolean)
    .join(" - ");

  // Personalización del DatePicker
  const CustomDatePickerInput = forwardRef(({ value, onClick, label }, ref) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div 
        className="w-full px-3 py-2 border border-gray-300 rounded-md flex justify-between items-center cursor-pointer"
        onClick={onClick}
        ref={ref}
      >
        <span>{value}</span>
        <Calendar className="w-5 h-5 text-gray-500" />
      </div>
    </div>
  ));
  
    // Opcionalmente, puedes asignar un nombre para mostrar para depuración
    CustomDatePickerInput.displayName = "CustomDatePickerInput";


  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Nueva Actividad</h2>
          <XButton onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {schemeEvaluation.length === 0 && !isLoading && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              No hay esquema de evaluación disponible. Verifique la configuración.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Actividad</label>
              <input
                type="text"
                name="name"
                value={activityData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Nombre de la actividad"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
              <input
                type="text"
                value={courseName || "No disponible"}
                className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-md"
                disabled
              />
            </div>

            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  minDate={firstDayOfCurrentYear} // Restricción: mínimo el primer día del año actual
                  locale="es"
                  dateFormat="dd/MM/yyyy"
                  customInput={
                    <CustomDatePickerInput 
                      label="Fecha de inicio" 
                    />
                  }
                  disabled={isLoading}
                />
              </div>
              <div>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate} // No puede ser anterior a la fecha de inicio
                  locale="es"
                  dateFormat="dd/MM/yyyy"
                  customInput={
                    <CustomDatePickerInput 
                      label="Fecha de entrega" 
                    />
                  }
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="description"
                value={activityData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Instrucciones para la actividad"
                required
                disabled={isLoading}
              />
            </div>

            <div className="col-span-2 relative" id="knowledge-dropdown">
              <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Saber</label>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-left flex justify-between items-center"
                disabled={isLoading || schemeEvaluation.length === 0}
              >
                <span>
                  {selectedKnowledge 
                    ? `${selectedKnowledge.knowledge.name} (${selectedKnowledge.knowledge.percentage}%)`
                    : "Seleccione un saber"}
                </span>
                <ChevronDown className="w-5 h-5" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {schemeEvaluation.map((item) => (
                    <div
                      key={item.knowledge.id}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                      onClick={() => handleKnowledgeSelect(item)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium text-gray-800">{item.knowledge.name}</h4>
                          <p className="text-xs text-gray-600 truncate">{item.achievement.description}</p>
                        </div>
                        <span className="text-sm font-semibold text-blue-600 ml-2">{item.knowledge.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedKnowledge && (
                <div className="mt-2 p-3 border border-gray-200 rounded-md bg-gray-50">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Logro:</span> {selectedKnowledge.achievement.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isLoading || schemeEvaluation.length === 0 || !selectedKnowledge}
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateActivityModal;
