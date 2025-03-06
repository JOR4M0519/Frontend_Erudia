import React, { useEffect, useState, useMemo } from "react";
import { Download, Plus } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { studentDataService, StudentModal, teacherDataService } from "../Dashboard/StudentLayout";
import { BackButton } from "../../../components";

import { TrackingHeader } from "./";
import { ObservationModal } from "./";
import StudentList from "./StudenList";
import { PrivateRoutes, Roles, StudentTrackingModel } from "../../../models";
import { decodeRoles, hasAccess } from "../../../utilities";

export default function StudentTracking() {
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [observations, setObservations] = useState([]);
  const [filteredObservations, setFilteredObservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Inicializamos dateFilter como objeto con startDate y endDate
  const [dateFilter, setDateFilter] = useState({ startDate: null, endDate: null });
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

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
      .filter((date) => date instanceof Date && !isNaN(date)); // Filtrar fechas inválidas
  
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
      .filter((date) => date instanceof Date && !isNaN(date)); // Filtrar fechas inválidas
  
    if (dates.length === 0) return new Date().toISOString().split("T")[0];
  
    const maxDate = new Date(Math.max(...dates.map(date => date.getTime())));
    return maxDate.toISOString().split("T")[0];
  };
  

  useEffect(() => {
    if (!userState.id) return;
    const fetchObservations = async () => {
      try {
        let data = [];
       
        if (isTeacher) {
          data = await teacherDataService.getStudentListObservations(userState.id);
        } else {
          data = await studentDataService.getStudentObservations(userState.id);
        }
        
        if (data && Array.isArray(data)) {
          setObservations(data);
          setFilteredObservations(data);
        } else {
          console.warn("Los datos recibidos no son un array:", data);
        }
      } catch (error) {
        console.error("Error al obtener las observaciones:", error);
      }
    };

    fetchObservations();
  }, [userState, isTeacher]);

  // Cuando se cargan las observaciones, calculamos la fecha mínima y, si no está definida, la seteamos en dateFilter.startDate
  useEffect(() => {
    if (observations.length > 0) {
      const minDate = computeMinObservationDate(observations);
      if (!dateFilter.startDate && minDate) {
        setDateFilter(prev => ({ ...prev, startDate: minDate }));
      }
    }
  }, [observations]);

  // Actualizamos los filtros cada vez que searchTerm, dateFilter o observations cambien
  useEffect(() => {
    let filtered = [...observations];

    // Función para normalizar texto (eliminar acentos)
    const normalizeText = (text) => {
      return text
        .normalize("NFD")           // Descompone los caracteres acentuados
        .replace(/[\u0300-\u036f]/g, "") // Elimina los diacríticos (acentos)
        .toLowerCase();             // Convierte a minúsculas
    };

    // Filtrar por término de búsqueda (mínimo 3 caracteres)
    if (searchTerm && searchTerm.length >= 3) {
      const normalizedSearchTerm = normalizeText(searchTerm);
      
      filtered = filtered.filter((obs) => {
        if (isTeacher && obs.student) {
          const studentName = `${obs.student.firstName} ${obs.student.lastName}`;
          const normalizedStudentName = normalizeText(studentName);
          return normalizedStudentName.includes(normalizedSearchTerm);
        }
        
        if (!obs.situation) return false;
        const normalizedSituation = normalizeText(obs.situation);
        return normalizedSituation.includes(normalizedSearchTerm);
      });
    }

    // Filtrar por rango de fechas
    if (dateFilter.startDate || dateFilter.endDate) {
      filtered = filtered.filter((obs) => {
        // Usamos obs.date o, de lo contrario, obs.period.startDate
        const dateToUse = obs.date ? new Date(obs.date) : (obs.period && obs.period.startDate ? new Date(obs.period.startDate) : null);
        if (!dateToUse) return true; // Si no hay fecha, mostramos la observación
        const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
        const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;
        const passesStartDate = !startDate || dateToUse >= startDate;
        const passesEndDate = !endDate || dateToUse <= endDate;
        return passesStartDate && passesEndDate;
      });
    }

    setFilteredObservations(filtered);

    // Guardar las observaciones filtradas en sessionStorage
    sessionStorage.setItem('filteredObservations', JSON.stringify(filtered));

  }, [searchTerm, dateFilter, observations, isTeacher]);

  // Actualiza el searchTerm
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Actualiza el dateFilter (se reciben nuevos valores y se fusionan con los existentes)
  const handleDateFilter = (newDateFilter) => {
    setDateFilter({
      startDate: newDateFilter.startDate || null,
      endDate: newDateFilter.endDate || null,
    });
  };
  

  const handleEditObservation = (observation, e) => {
    e.stopPropagation();
    
    // Encontrar el índice de la observación seleccionada
    const currentIndex = filteredObservations.findIndex(obs => obs.id === observation.id);
    
    navigate(PrivateRoutes.STUDENTTRACKING + PrivateRoutes.STUDENTTRACKINGDETAILS, { 
      state: { 
        observation,
        currentIndex,
        totalObservations: filteredObservations.length
      }
    });
  };

  const handleDeleteObservation = (observation, e) => {
    e.stopPropagation();
    // Implementar lógica de eliminación
  };

  const handleItemClick = (observation) => {
    if (isTeacher) {
      setSelectedStudent(observation.student);
      setShowStudentModal(true);
    } else {
      console.log(observation);
      setSelectedObservation(observation);
    }
  };

  const handleCreateObservation = () => {
    navigate(`${PrivateRoutes.STUDENTTRACKING}${PrivateRoutes.STUDENTTRACKINGDETAILS}?nuevo=true`);
    // Implementar la lógica para crear observación
  };

  const handleExport = () => {
    
    // Lógica para exportar datos (CSV/PDF)
  };

   // Calcula la fecha mínima y máxima para pasar al header
   const minDate = useMemo(() => computeMinObservationDate(observations), [observations]);
   const maxDate = useMemo(() => computeMaxObservationDate(observations), [observations]);
   return (
    <div className="space-y-4">
      <TrackingHeader 
        isTeacher={isTeacher}
        userState={userState}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onDateFilter={handleDateFilter}
        onCreateObservation={handleCreateObservation}
        minDate={minDate}  // Se pasa la fecha mínima permitida para el filtro
        maxDate={maxDate}
      />

      <StudentList
        observations={filteredObservations}
        isTeacher={isTeacher}
        onEditObservation={handleEditObservation}
        onDeleteObservation={handleDeleteObservation}
        onItemClick={handleItemClick}
      />

      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Exportar observador</span>
        </button>
      </div>

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

      <BackButton onClick={() => navigate(PrivateRoutes.DASHBOARD)} />

      {selectedObservation && (
        <ObservationModal
          isOpen={!!selectedObservation}
          observationData={selectedObservation}
          onClose={() => setSelectedObservation(null)}
        />
      )}

      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          isOpen={showStudentModal}
          onClose={() => {
            setShowStudentModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
      <Outlet />
    </div>
  );
}
