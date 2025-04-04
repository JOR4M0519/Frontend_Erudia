import React, { useState, useEffect } from "react";
import { Grid, ChevronDown, List, Filter, Plus, Edit } from "lucide-react";
import { AchievementsTab, 
  AssociationsTab, 
  configurationService, 
  KnowledgesTab } from "../";
import Swal from "sweetalert2";

const MainKnowledgesTab = () => {
  // Estados para datos
  const [allKnowledges, setAllKnowledges] = useState([]);
  const [subjectKnowledges, setSubjectKnowledges] = useState([]);
  
  // Estados para filtros principales
  const [periods, setPeriods] = useState([]);
  const [levels, setLevels] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  
  // Estados para UI
  const [initialLoading, setInitialLoading] = useState(true);
  
  // "achievements", "associations", "knowledges"
  const [viewMode, setViewMode] = useState("knowledges"); 
  
  const [showFilters, setShowFilters] = useState(false);
  
  // Nuevo estado para controlar el modo de edición
  const [editMode, setEditMode] = useState(false);
  
  // Lista de materias únicas (para filtros)
  const [uniqueSubjects, setUniqueSubjects] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true);
        const [periodsData, levelsData, groupsData, knowledgesData, subjectKnowledgesData] = await Promise.all([
          configurationService.getPeriods(),
          configurationService.getEducationalLevels(),
          configurationService.getAllGroups(),
          configurationService.getKnowledges(),
          configurationService.getSubjectKnowledge()
        ]);
        
        setPeriods(periodsData);
        setLevels(levelsData);
        setAllGroups(groupsData);
        setAllKnowledges(knowledgesData);
        setSubjectKnowledges(subjectKnowledgesData);
        
        // Extraer materias únicas para filtros
        const subjects = [...new Map(subjectKnowledgesData.map(item => 
          [item.idSubject.id, item.idSubject])).values()];
        setUniqueSubjects(subjects);
        
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos iniciales'
        });
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Función para actualizar la lista de saberes
  const handleKnowledgeUpdated = async () => {
    try {
      const knowledgesData = await configurationService.getKnowledges();
      setAllKnowledges(knowledgesData);
      
      // También actualizar los saberes por materia
      const subjectKnowledgesData = await configurationService.getSubjectKnowledge();
      setSubjectKnowledges(subjectKnowledgesData);
      
      // Actualizar materias únicas
      const subjects = [...new Map(subjectKnowledgesData.map(item => 
        [item.idSubject.id, item.idSubject])).values()];
      setUniqueSubjects(subjects);
    } catch (error) {
      console.error("Error al actualizar saberes:", error);
    }
  };

  // Función para actualizar las asociaciones de saberes con materias
  const handleSubjectKnowledgeUpdated = async () => {
    try {
      const subjectKnowledgesData = await configurationService.getSubjectKnowledge();
      setSubjectKnowledges(subjectKnowledgesData);
      
      // Actualizar materias únicas
      const subjects = [...new Map(subjectKnowledgesData.map(item => 
        [item.idSubject.id, item.idSubject])).values()];
      setUniqueSubjects(subjects);
    } catch (error) {
      console.error("Error al actualizar asociaciones:", error);
    }
  };

  // Función para cargar saberes por materia
  const loadKnowledgesBySubject = async (subjectId, periodId) => {
    try {
      const data = await configurationService.getKnowledgesBySubject(subjectId, periodId);
      setSubjectKnowledges(data);
    } catch (error) {
      console.error("Error al cargar saberes por materia:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los saberes para esta materia'
      });
    }
  };

  // Renderizar contenido según el modo de vista
  const renderContent = () => {
    if (initialLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (viewMode) {
      case "knowledges":
        return (
          <KnowledgesTab 
            allKnowledges={allKnowledges} 
            showFilters={showFilters}
            onKnowledgeUpdated={handleKnowledgeUpdated}
          />
        );
      case "achievements":
        return (
          <AchievementsTab 
            periods={periods}
            levels={levels}
            allGroups={allGroups}
            initialLoading={initialLoading}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
        );
      case "associations":
        return (
          <AssociationsTab 
            subjectKnowledges={subjectKnowledges}
            allKnowledges={allKnowledges}
            uniqueSubjects={uniqueSubjects}
            showFilters={showFilters}
            editMode={editMode}
            onSubjectKnowledgeUpdated={handleSubjectKnowledgeUpdated}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Gestión de Saberes y Logros</h1>
        
        <div className="flex space-x-2">
          {viewMode === "associations" && (
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 ${editMode ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} rounded-md flex items-center`}
            >
              <Edit size={18} className="mr-1" />
              {editMode ? "Finalizar edición" : "Editar asociaciones"}
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center"
          >
            <Filter size={18} className="mr-1" />
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </button>
        </div>
      </div>

      {/* Pestañas de navegación */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-4">
          <button
            onClick={() => {
              setViewMode("knowledges");
              setEditMode(false);
            }}
            className={`py-2 px-4 flex items-center ${
              viewMode === "knowledges"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Grid size={18} className="mr-1" />
            Saberes
          </button>
          
          <button
            onClick={() => {
              setViewMode("associations");
              setEditMode(false);
            }}
            className={`py-2 px-4 flex items-center ${
              viewMode === "associations"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <ChevronDown size={18} className="mr-1" />
            Asociaciones
          </button>
          <button
            onClick={() => {
              setViewMode("achievements");
              setEditMode(false);
            }}
            className={`py-2 px-4 flex items-center ${
              viewMode === "achievements"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List size={18} className="mr-1" />
            Logros
          </button>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow-sm">
        {renderContent()}
      </div>
    </div>
  );
};

export default MainKnowledgesTab;
