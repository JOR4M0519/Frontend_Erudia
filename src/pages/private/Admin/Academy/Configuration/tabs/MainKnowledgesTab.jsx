import React, { useState, useEffect } from "react";
import { Grid, ChevronDown, List, Filter, Plus } from "lucide-react";
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
  const [viewMode, setViewMode] = useState("achievements"); // "achievements", "associations", "knowledges"
  const [showFilters, setShowFilters] = useState(false);
  
  // Lista de materias únicas (para filtros)
  const [uniqueSubjects, setUniqueSubjects] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
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

  // Crear nuevo saber
  const handleCreateKnowledge = () => {
    Swal.fire({
      title: 'Crear nuevo saber',
      text: 'Esta funcionalidad estará disponible próximamente',
      icon: 'info'
    });
  };

  return (
    <div className="p-4">
      {/* Encabezado y opciones de vista */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold">Saberes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestión de saberes y logros por materias
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setViewMode("achievements")}
            className={`flex items-center gap-2 py-2 px-4 rounded transition-colors ${
              viewMode === "achievements" 
                ? "bg-amber-500 text-white" 
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            <Grid size={18} />
            Logros y saberes
          </button>
          <button 
            onClick={() => setViewMode("associations")}
            className={`flex items-center gap-2 py-2 px-4 rounded transition-colors ${
              viewMode === "associations" 
                ? "bg-amber-500 text-white" 
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            <ChevronDown size={18} />
            Asociaciones
          </button>
          <button 
            onClick={() => setViewMode("knowledges")}
            className={`flex items-center gap-2 py-2 px-4 rounded transition-colors ${
              viewMode === "knowledges" 
                ? "bg-amber-500 text-white" 
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            <List size={18} />
            Saberes
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
          >
            <Filter size={18} />
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </button>
          <button 
            onClick={handleCreateKnowledge}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            <Plus size={18} />
            Crear saber
          </button>
        </div>
      </div>
      
      {/* Renderizar la pestaña seleccionada */}
      {viewMode === "achievements" && (
        <AchievementsTab 
          periods={periods}
          levels={levels}
          allGroups={allGroups}
          initialLoading={initialLoading}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />
      )}
      
      {viewMode === "associations" && (
        <AssociationsTab 
          subjectKnowledges={subjectKnowledges}
          allKnowledges={allKnowledges}
          uniqueSubjects={uniqueSubjects}
          showFilters={showFilters}
        />
      )}
      
      {viewMode === "knowledges" && (
        <KnowledgesTab 
          allKnowledges={allKnowledges}
          showFilters={showFilters}
        />
      )}
    </div>
  );
};

export default MainKnowledgesTab;
