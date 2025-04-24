import React, { useState, useEffect } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import {processesService} from "../";


const ReportForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
    period: "",
    level: "",
    template: "Predeterminada",
    dynamicText: "",
    selectedGroup: "",
    selectedStudents: [],
    allStudents: true
  });
  
  const [years, setYears] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [levels, setLevels] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  

  // Cargar años (podría ser estático o dinámico)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setYears([
      // (currentYear - 1).toString(),
      currentYear.toString(),
      // (currentYear + 1).toString()
    ]);
    setFormData(prev => ({ ...prev, year: currentYear.toString() }));
  }, []);

  // Cargar períodos cuando cambia el año
  useEffect(() => {
    const fetchPeriods = async () => {
      if (!formData.year) return;
      
      setLoadingPeriods(true);
      try {
        const periodsData = await processesService.getActivePeriodsByYear(formData.year);
        setPeriods(periodsData);
        if (periodsData.length > 0 && !formData.period) {
          setFormData(prev => ({ ...prev, period: periodsData[0].id }));
        }
      } catch (error) {
        console.error("Error al cargar períodos:", error);
      } finally {
        setLoadingPeriods(false);
      }
    };
    
    fetchPeriods();
  }, [formData.year]);

  // Cargar niveles educativos
  useEffect(() => {
    const fetchLevels = async () => {
      setLoadingLevels(true);
      try {
        const levelsData = await processesService.getEducationalLevels();
        setLevels(levelsData);
      } catch (error) {
        console.error("Error al cargar niveles educativos:", error);
      } finally {
        setLoadingLevels(false);
      }
    };
    
    fetchLevels();
  }, []);

  // Cargar grupos cuando cambia el nivel y el período
  useEffect(() => {
    const fetchGroups = async () => {
      if (!formData.period || !formData.level) {
        setGroups([]);
        return;
      }
      
      setLoadingData(true);
      try {
        const subjectsData = await processesService.getSubjectsByGroupAndLevel(
          formData.period,
          formData.level
        );
        
        // Extraer grupos únicos de las materias
        const uniqueGroupsMap = new Map();
        
        subjectsData.forEach(item => {
          const group = item.groups;
          if (group && !uniqueGroupsMap.has(group.id)) {
            uniqueGroupsMap.set(group.id, {
              id: group.id,
              name: group.groupName,
              code: group.groupCode
            });
          }
        });
        
        const groupsData = Array.from(uniqueGroupsMap.values());
        setGroups(groupsData);
        
        // Limpiar el grupo seleccionado si no está en la nueva lista
        if (formData.selectedGroup && !groupsData.find(g => g.id === formData.selectedGroup)) {
          setFormData(prev => ({ 
            ...prev, 
            selectedGroup: "",
            selectedStudents: []
          }));
        }
      } catch (error) {
        console.error("Error al cargar grupos:", error);
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchGroups();
  }, [formData.period, formData.level]);

  // Cargar estudiantes cuando cambia el grupo seleccionado
  useEffect(() => {
    const fetchStudents = async () => {
      if (!formData.selectedGroup) {
        setStudents([]);
        return;
      }
      
      setLoadingData(true);
      try {
        const studentsData = await processesService.fetchListUsersGroupData(formData.selectedGroup);
        if (studentsData && studentsData.students) {
          setStudents(studentsData.students);
        }
      } catch (error) {
        console.error("Error al cargar estudiantes:", error);
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchStudents();
  }, [formData.selectedGroup]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "allStudents" && checked) {
      // Si se marca "todos los estudiantes", limpiar la selección individual
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        selectedStudents: []
      }));
    } else if (name === "allStudents" && !checked) {
      // Si se desmarca "todos los estudiantes", no hacer nada con la selección
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleStudentSelection = (studentId) => {
    setFormData(prev => {
      // Si el estudiante ya está seleccionado, quitarlo
      if (prev.selectedStudents.includes(studentId)) {
        return {
          ...prev,
          selectedStudents: prev.selectedStudents.filter(id => id !== studentId),
          // Si se quita un estudiante, desmarcar "todos los estudiantes"
          allStudents: false
        };
      } 
      // Si no está seleccionado, agregarlo
      else {
        return {
          ...prev,
          selectedStudents: [...prev.selectedStudents, studentId],
          // Si se selecciona un estudiante, desmarcar "todos los estudiantes"
          allStudents: false
        };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Preparar datos para enviar
    const submitData = {
      ...formData,
      periodName: periods.find(p => p.id === parseInt(formData.period))?.name || "",
      levelName: levels.find(l => l.id === parseInt(formData.level))?.levelName || "",
      groupName: groups.find(g => g.id === parseInt(formData.selectedGroup))?.name || "",
      studentsData: formData.allStudents ? students : students.filter(student => 
        formData.selectedStudents.includes(student.id)
      )
    };
    
    onSubmit(submitData);
  };

  // Filtrar estudiantes por búsqueda
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit} 
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Año escolar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Año escolar
          </label>
          <div className="relative">
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown size={18} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Periodo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Periodo
          </label>
          <div className="relative">
            <select
              name="period"
              value={formData.period}
              onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
              disabled={loadingPeriods || periods.length === 0}
            >
              {loadingPeriods ? (
                <option value="">Cargando períodos...</option>
              ) : periods.length === 0 ? (
                <option value="">No hay períodos disponibles</option>
              ) : (
                periods.map(period => (
                  <option key={period.id} value={period.id}>
                    {period.name}
                  </option>
                ))
              )}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              {loadingPeriods ? (
                <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full mr-2"></div>
              ) : (
                <ChevronDown size={18} className="text-gray-400" />
              )}
            </div>
          </div>
          {loadingPeriods && (
            <p className="mt-1 text-xs text-amber-500">Cargando períodos disponibles...</p>
          )}
        </div>

        {/* Categoría (Nivel educativo) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <div className="relative">
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
              disabled={loadingLevels || levels.length === 0}
            >
              {loadingLevels ? (
                <option value="">Cargando niveles...</option>
              ) : levels.length === 0 ? (
                <option value="">No hay niveles disponibles</option>
              ) : (
                <>
                  <option value="">Seleccione un nivel</option>
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.levelName}
                    </option>
                  ))}
                </>
              )}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              {loadingLevels ? (
                <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full mr-2"></div>
              ) : (
                <ChevronDown size={18} className="text-gray-400" />
              )}
            </div>
          </div>
          {loadingLevels && (
            <p className="mt-1 text-xs text-amber-500">Cargando niveles disponibles...</p>
          )}
        </div>

        {/* Plantilla */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plantilla
          </label>
          <div className="relative">
            <select
              name="template"
              value={formData.template}
              onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Predeterminada">Predeterminada</option>
              {/* <option value="Alternativa">Alternativa</option>
              <option value="Personalizada">Personalizada</option> */}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown size={18} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Texto dinámico */}
        {/* <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Texto dinámico
          </label>
          <input
            type="text"
            name="dynamicText"
            value={formData.dynamicText}
            onChange={handleChange}
            placeholder="....................."
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div> */}

        {/* Selección de grupo */}
        {formData.level && (
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Grupo
    </label>
    <div className="relative">
      <select
        name="selectedGroup"
        value={formData.selectedGroup}
        onChange={handleChange}
        className="w-full bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500"
        disabled={loadingData || groups.length === 0}
      >
        <option value="">
          {loadingData ? "Cargando grupos..." : "Seleccione un grupo"}
        </option>
        {groups.map(group => (
          <option key={group.id} value={group.id}>
            {group.name} ({group.code})
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        {loadingData ? (
          <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full mr-2"></div>
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </div>
    </div>
    {loadingData && groups.length === 0 && (
      <p className="mt-1 text-xs text-amber-500">Cargando grupos disponibles...</p>
    )}
  </div>
)}
      </div>

      {/* Selección de estudiantes */}
      {formData.selectedGroup && students.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="bg-gray-100 p-4 rounded-lg mt-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Estudiantes del grupo</h3>
            
            <div className="flex items-center">
              <label className="inline-flex items-center mr-4">
                <input
                  type="checkbox"
                  name="allStudents"
                  checked={formData.allStudents}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="ml-2 text-sm text-gray-700">Todos los estudiantes</span>
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar estudiante..."
                  className="w-full bg-white border border-gray-300 rounded-md pl-8 pr-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  disabled={formData.allStudents}
                />
                <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md bg-white">
            {filteredStudents.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? "No se encontraron estudiantes" : "No hay estudiantes en este grupo"}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredStudents.map(student => (
                  <li key={student.id} className="px-4 py-2 hover:bg-gray-50">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allStudents || formData.selectedStudents.includes(student.id)}
                        onChange={() => handleStudentSelection(student.id)}
                        disabled={formData.allStudents}
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="ml-2">{student.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="mt-2 text-sm text-gray-500">
            {formData.allStudents 
              ? `Se generarán boletines para todos los estudiantes (${students.length})` 
              : `Se generarán boletines para ${formData.selectedStudents.length} estudiante(s) seleccionado(s)`
            }
          </div>
        </motion.div>
      )}

      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-6 rounded transition-colors"
          disabled={loading}
        >
          {loading ? "Generando..." : "Aceptar"}
        </motion.button>
      </div>
    </motion.form>
  );
};

export default ReportForm;