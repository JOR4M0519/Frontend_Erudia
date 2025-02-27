import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Download, ArrowLeft, Edit, Trash2, MessageCircle } from "lucide-react";
import { studentDataService, teacherDataService } from "../Dashboard/StudentLayout";
import { BackButton } from "../../../components";
import TrackingHeader from "./TrackingHeader";
import { PrivateRoutes, Roles } from "../../../models";
import { decodeRoles, hasAccess } from "../../../utilities";

const DetailStudentTracking = () => {
  const { studentId, observationId } = useParams();
  const [student, setStudent] = useState(null);
  const [observations, setObservations] = useState([]);
  const [filteredObservations, setFilteredObservations] = useState([]);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({ startDate: null, endDate: null });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const userState = useSelector((store) => store.selectedUser);
  const storedRole = decodeRoles(userState.roles) || [];
  const isTeacher = hasAccess(storedRole, [Roles.TEACHER]);

  // Función para calcular la fecha mínima entre las observaciones
  const computeMinObservationDate = (observationsList) => {
    if (!observationsList.length) return null;
  
    const dates = observationsList
      .map((obs) => {
        const dateValue = obs.date || (obs.period && obs.period.startDate);
        return dateValue ? new Date(dateValue) : null;
      })
      .filter((date) => date instanceof Date && !isNaN(date));
  
    if (dates.length === 0) return null;
  
    const minDate = new Date(Math.min(...dates.map(date => date.getTime())));
    return minDate.toISOString().split("T")[0];
  };
  
  const computeMaxObservationDate = (observationsList) => {
    if (!observationsList.length) return new Date().toISOString().split("T")[0];
  
    const dates = observationsList
      .map((obs) => {
        const dateValue = obs.date || (obs.period && obs.period.startDate);
        return dateValue ? new Date(dateValue) : null;
      })
      .filter((date) => date instanceof Date && !isNaN(date));
  
    if (dates.length === 0) return new Date().toISOString().split("T")[0];
  
    const maxDate = new Date(Math.max(...dates.map(date => date.getTime())));
    return maxDate.toISOString().split("T")[0];
  };

  // Cargar datos del estudiante y sus observaciones
  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        let studentData;
        let observationsData = [];
        
        if (isTeacher) {
          studentData = await teacherDataService.getStudentById(studentId);
          observationsData = await teacherDataService.getStudentObservations(studentId);
        } else {
          studentData = await studentDataService.getStudentById(userState.id);
          observationsData = await studentDataService.getStudentObservations(userState.id);
        }
        
        setStudent(studentData);
        setObservations(observationsData);
        setFilteredObservations(observationsData);
        
        // Si hay un observationId en los parámetros, seleccionar esa observación
        if (observationId) {
          const foundObservation = observationsData.find(obs => obs.id === observationId);
          if (foundObservation) {
            setSelectedObservation(foundObservation);
          }
        }
      } catch (error) {
        console.error("Error al cargar datos del estudiante:", error);
      } finally {
        setLoading(false);
      }
    };

    if (studentId || userState.id) {
      fetchStudentData();
    }
  }, [studentId, observationId, userState.id, isTeacher]);

  // Actualiza los filtros cuando cambia searchTerm, dateFilter o observations
  useEffect(() => {
    let filtered = [...observations];

    // Función para normalizar texto (eliminar acentos)
    const normalizeText = (text) => {
      return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    };

    // Filtrar por término de búsqueda (mínimo 3 caracteres)
    if (searchTerm && searchTerm.length >= 3) {
      const normalizedSearchTerm = normalizeText(searchTerm);
      
      filtered = filtered.filter((obs) => {
        if (!obs.situation) return false;
        const normalizedSituation = normalizeText(obs.situation);
        return normalizedSituation.includes(normalizedSearchTerm);
      });
    }

    // Filtrar por rango de fechas
    if (dateFilter.startDate || dateFilter.endDate) {
      filtered = filtered.filter((obs) => {
        const dateToUse = obs.date ? new Date(obs.date) : (obs.period && obs.period.startDate ? new Date(obs.period.startDate) : null);
        if (!dateToUse) return true;
        const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
        const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;
        const passesStartDate = !startDate || dateToUse >= startDate;
        const passesEndDate = !endDate || dateToUse <= endDate;
        return passesStartDate && passesEndDate;
      });
    }

    setFilteredObservations(filtered);
  }, [searchTerm, dateFilter, observations]);

  // Manejadores de eventos
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateFilter = (newDateFilter) => {
    setDateFilter({
      startDate: newDateFilter.startDate || null,
      endDate: newDateFilter.endDate || null,
    });
  };

  const handleEditObservation = (observation) => {
    // Implementar edición de observación
    console.log("Editar observación:", observation);
  };

  const handleDeleteObservation = (observation) => {
    // Implementar eliminación de observación
    console.log("Eliminar observación:", observation);
  };

  const handleCreateObservation = () => {
    // Implementar creación de observación
    console.log("Crear nueva observación para el estudiante:", student);
  };

  const handleExport = () => {
    // Implementar exportación de datos
    console.log("Exportar observaciones del estudiante:", student);
  };

  const handleBack = () => {
    navigate(PrivateRoutes.STUDENT_TRACKING);
  };

  // Calcular fechas mínima y máxima para el filtro
  const minDate = computeMinObservationDate(observations);
  const maxDate = computeMaxObservationDate(observations);

  if (loading) {
    return <div className="flex justify-center p-8">Cargando información del estudiante...</div>;
  }

  if (!student) {
    return <div className="p-8">No se encontró información del estudiante.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Botón de regreso */}
      <button 
        onClick={handleBack} 
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span>Volver a la lista de seguimiento</span>
      </button>
      
      {/* Header con el nombre del estudiante */}
      <TrackingHeader 
        isTeacher={isTeacher}
        userState={userState}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onDateFilter={handleDateFilter}
        onCreateObservation={handleCreateObservation}
        minDate={minDate}
        maxDate={maxDate}
        title={`Detalle de ${student.firstName} ${student.lastName}`}
      />

      {/* Información del estudiante */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del estudiante</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nombre completo</p>
            <p className="font-medium">{student.firstName} {student.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Curso</p>
            <p className="font-medium">{student.group?.name || "No asignado"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Documento</p>
            <p className="font-medium">{student.documentNumber || "No disponible"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Correo electrónico</p>
            <p className="font-medium">{student.email || "No disponible"}</p>
          </div>
        </div>
      </div>

      {/* Lista de observaciones */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Observaciones</h3>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>

        {filteredObservations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay observaciones para mostrar.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredObservations.map((observation) => (
              <div 
                key={observation.id} 
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {new Date(observation.date || observation.period?.startDate).toLocaleDateString('es-ES')}
                      </span>
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {observation.type || "Observación general"}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-800 mb-1">{observation.situation}</h4>
                    <p className="text-gray-600 text-sm line-clamp-2">{observation.description}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditObservation(observation)}
                      className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteObservation(observation)}
                      className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {observation.comments && observation.comments.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>{observation.comments.length} comentario(s)</span>
                    </div>
                    <div className="space-y-2">
                      {observation.comments.slice(0, 2).map((comment, idx) => (
                        <div key={idx} className="bg-gray-50 rounded p-2 text-sm">
                          <div className="font-medium text-gray-700">{comment.author}</div>
                          <div className="text-gray-600">{comment.text}</div>
                        </div>
                      ))}
                      {observation.comments.length > 2 && (
                        <button className="text-sm text-blue-600 hover:underline">
                          Ver todos los comentarios
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón flotante para crear observación (solo para profesores) */}
      {isTeacher && (
        <div className="fixed bottom-8 right-8">
          <button
            onClick={handleCreateObservation}
            className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailStudentTracking;