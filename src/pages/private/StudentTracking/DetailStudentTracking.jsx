import { useState, useEffect } from "react"
import { Download, Edit, Trash2, ChevronRight, ChevronLeft } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { PrivateRoutes, StudentGroupModel } from "../../../models"
import { BackButton, CancelButton } from "../../../components"


/**
 * Se necesita hacer una refactorirzación
 */

export default function DetailStudentTracking() {
  const [isEditing, setIsEditing] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [totalObservations, setTotalObservations] = useState(0)
  const [filteredObservations, setFilteredObservations] = useState([])
  const [observationData, setObservationData] = useState({})
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [studentGroups, setStudentGroups] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Obtener la información del profesor desde Redux
  const userState = useSelector((store) => store.selectedUser)
  const location = useLocation()
  const navigate = useNavigate()
  
  

  // Cargar los grupos de estudiantes al inicio
  useEffect(() => {
    const fetchStudentGroups = async () => {
      setLoading(true)
      try {
        // Aquí deberías hacer la llamada a tu API para obtener los grupos
        // Por ejemplo:
        // const response = await api.getStudentGroups()
        // setStudentGroups(response.data)
        
        // Por ahora, simulamos datos de ejemplo
        // Esto debería reemplazarse con tu llamada a la API real
        const mockGroups = [
          new StudentGroupModel({
            group: {
              id: 1,
              groupCode: "G1",
              groupName: "Grupo 1",
              level: {
                id: 1,
                levelName: "Primaria"
              },
              mentor: {
                id: 1,
                firstName: "Juan",
                lastName: "Pérez",
                email: "juan@example.com"
              }
            }
          }),
          new StudentGroupModel({
            group: {
              id: 2,
              groupCode: "G2",
              groupName: "Grupo 2",
              level: {
                id: 1,
                levelName: "Primaria"
              },
              mentor: {
                id: 2,
                firstName: "María",
                lastName: "López",
                email: "maria@example.com"
              }
            }
          })
        ]
        
        // Simulamos algunos estudiantes en los grupos
        mockGroups[0].students = [
          { id: 1, firstName: "Ana", lastName: "García" },
          { id: 2, firstName: "Pedro", lastName: "Martínez" }
        ]
        
        mockGroups[1].students = [
          { id: 3, firstName: "Luis", lastName: "Rodríguez" },
          { id: 4, firstName: "Sofía", lastName: "Fernández" }
        ]
        
        setStudentGroups(mockGroups)
      } catch (error) {
        console.error("Error al cargar los grupos de estudiantes:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStudentGroups()
  }, [])
  
  // Determinar si estamos creando una nueva observación o editando una existente
  useEffect(() => {
    // Comprobar si la URL contiene "crear" o algún parámetro que indique modo de creación
    const isNewObservation = location.search.includes("nuevo=true")
    
    if (isNewObservation) {
      setIsCreatingNew(true)
      setIsEditing(true)
      // Inicializar con datos vacíos o predeterminados
      setObservationData({
        date: new Date().toISOString().split('T')[0], // Fecha actual
        teacherName: `${userState.firstName || ''} ${userState.lastName || ''}`.trim(),
        teacherId: userState.id,
        behavior: '',
        commitment: '',
        followUp: ''
      })
    } else {
      // Modo de visualización/edición de observación existente
      setIsCreatingNew(false)
      
      // Obtener la observación actual de los datos de la ruta
      const observation = location.state?.observation ?? {}
      setObservationData(observation)
      
      // Obtener el índice actual y total desde el state de la navegación o desde sessionStorage
      if (location.state?.currentIndex !== undefined) {
        setCurrentIndex(location.state.currentIndex)
      }
      
      if (location.state?.totalObservations) {
        setTotalObservations(location.state.totalObservations)
      }
      
      // Cargar las observaciones filtradas desde sessionStorage
      const storedObservations = sessionStorage.getItem('filteredObservations')
      if (storedObservations) {
        try {
          const parsedObservations = JSON.parse(storedObservations)
          setFilteredObservations(parsedObservations)
          
          // Si no tenemos el índice desde location.state, buscarlo en las observaciones cargadas
          if (location.state?.currentIndex === undefined && observation?.id) {
            const index = parsedObservations.findIndex(obs => obs.id === observation.id)
            if (index !== -1) {
              setCurrentIndex(index)
            }
          }
          
          // Si no tenemos el total desde location.state, usar la longitud del array
          if (!location.state?.totalObservations) {
            setTotalObservations(parsedObservations.length)
          }
        } catch (error) {
          console.error("Error al cargar observaciones desde sessionStorage:", error)
        }
      }
    }
  }, [location, userState])


  const routeBefore =() =>{
    navigate(PrivateRoutes.STUDENTTRACKING);
  } 

  // Manejar cambio de grupo
  const handleGroupChange = (e) => {
    const groupId = parseInt(e.target.value)
    const group = studentGroups.find(g => g.group.id === groupId)
    setSelectedGroup(group)
    setSelectedStudent(null) // Resetear el estudiante seleccionado
    
    // Actualizar el director de grupo si corresponde
    if (group) {
      setObservationData(prev => ({
        ...prev,
        groupDirector: `${group.group.mentor.firstName} ${group.group.mentor.lastName}`,
        groupDirectorId: group.group.mentor.id,
        course: `${group.group.level.levelName} - ${group.group.groupName}`
      }))
    }
  }
  
  // Manejar cambio de estudiante
  const handleStudentChange = (e) => {
    const studentId = parseInt(e.target.value)
    if (selectedGroup) {
      const student = selectedGroup.students.find(s => s.id === studentId)
      setSelectedStudent(student)
      
      if (student) {
        setObservationData(prev => ({
          ...prev,
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`
        }))
      }
    }
  }

  const handleFieldChange = (field, value) => {
    setObservationData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta observación?")) {
      console.log("Deleting observation:", id)
      // Implementar lógica de eliminación
      
      // Después de eliminar, volver a la lista
      routeBefore
    }
  }
  
  const handleSave = () => {
    // Validar que se haya seleccionado un estudiante en caso de creación
    if (isCreatingNew && !selectedStudent) {
      alert("Por favor, selecciona un estudiante")
      return
    }
    
    if (isCreatingNew) {
      console.log("Creating new observation:", observationData)
      // Aquí implementar la lógica para crear una nueva observación
      // Por ejemplo, una llamada a la API
    } else {
      console.log("Updating observation:", observationData)
      // Aquí implementar la lógica para actualizar la observación existente
    }
    
    // Después de guardar, si es una nueva, redirigir a la lista
    if (isCreatingNew) {
      routeBefore
    } else {
      // Si es una edición, mantener en la misma página pero desactivar el modo edición
      setIsEditing(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < filteredObservations.length - 1) {
      const nextIndex = currentIndex + 1
      const nextObservation = filteredObservations[nextIndex]
      
      navigate(PrivateRoutes.STUDENTTRACKING + PrivateRoutes.STUDENTTRACKINGDETAILS, {
        state: { 
          observation: nextObservation,
          currentIndex: nextIndex,
          totalObservations
        }
      })
    }
  }
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      const prevObservation = filteredObservations[prevIndex]
      
      navigate(PrivateRoutes.STUDENTTRACKING + PrivateRoutes.STUDENTTRACKINGDETAILS, {
        state: { 
          observation: prevObservation,
          currentIndex: prevIndex,
          totalObservations
        }
      })
    }
  }

  const handleCancel = () => {
    if (isCreatingNew) {
      // Si estamos creando una nueva observación, volver a la lista
      if (window.confirm("¿Estás seguro de que deseas cancelar? Los cambios no se guardarán.")) {
        routeBefore
      }
    } else {
      // Si estamos editando, solo desactivar el modo edición
      setIsEditing(false)
    }
  }

  // Extraer valores para mostrarlos en la barra de información
  const studentName = isCreatingNew && selectedStudent 
    ? `${selectedStudent.firstName} ${selectedStudent.lastName}`
    : observationData?.studentName || 
      (observationData?.student ? `${observationData.student.firstName} ${observationData.student.lastName}` : '')
  
  const observationDate = observationData?.date || 
    (observationData?.period?.startDate) || ''
  
  const courseName = isCreatingNew && selectedGroup
    ? `${selectedGroup.group.level.levelName} - ${selectedGroup.group.groupName}`
    : observationData?.course || ''

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Navegación entre estudiantes - Solo visible si no es creación nueva */}
      {!isCreatingNew && totalObservations > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <span>Estudiante {currentIndex + 1} de {totalObservations}</span>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Title - Diferente según el modo */}
        <h2 className="text-xl font-bold text-gray-800">
          {isCreatingNew ? "Nueva Observación de Estudiante" : "Detalles de la Observación"}
        </h2>
        
        {/* Selector de Grupo y Estudiante - Solo en modo creación */}
        {isCreatingNew && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-gray-800">Seleccionar Estudiante</h3>
            
            {loading ? (
              <p>Cargando grupos...</p>
            ) : (
              <>
                {/* Selector de Grupo */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Grupo</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedGroup?.group.id || ''}
                    onChange={handleGroupChange}
                  >
                    <option value="">Seleccionar grupo</option>
                    {studentGroups.map(group => (
                      <option key={group.group.id} value={group.group.id}>
                        {group.group.level.levelName} - {group.group.groupName}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Selector de Estudiante (visible solo cuando se ha seleccionado un grupo) */}
                {selectedGroup && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Estudiante</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedStudent?.id || ''}
                      onChange={handleStudentChange}
                    >
                      <option value="">Seleccionar estudiante</option>
                      {selectedGroup.students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Student Info Bar */}
        <div className="flex items-center justify-between bg-gray-100 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-8 flex-1">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Estudiante</h3>
              <p className="text-gray-900">{studentName || 'No seleccionado'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Fecha</h3>
              {isEditing ? (
                <input
                  type="date"
                  value={observationData.date || ''}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  className="w-full p-1 mt-1 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900">{observationDate}</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Curso</h3>
              <p className="text-gray-900">{courseName || 'No definido'}</p>
            </div>
          </div>

          {/* Action Buttons - No mostrar en modo creación */}
          {!isCreatingNew && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDelete(observationData?.id)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Descargar"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <DetailField 
            label="Responsable" 
            value={`${userState.name || ''}`.trim()} 
            isEditing={false} // No permitimos editar el profesor, se toma del usuario actual
            readOnly={true}
          />
          <DetailField 
            label="Director de grupo" 
            value={observationData?.groupDirector || ''} 
            isEditing={isEditing && !isCreatingNew} // Solo editable en modo edición para observaciones existentes
            onChange={(value) => handleFieldChange('groupDirector', value)}
            readOnly={isCreatingNew} // En modo creación, se obtiene automáticamente al seleccionar el grupo
          />
          <DetailField
            label="Descripción del comportamiento"
            value={observationData?.behavior || observationData?.situation || ''}
            isEditing={isEditing}
            onChange={(value) => handleFieldChange('behavior', value)}
            multiline
          />
          <DetailField 
            label="Descarga y compromiso" 
            value={observationData?.commitment || ''} 
            isEditing={isEditing}
            onChange={(value) => handleFieldChange('commitment', value)}
            multiline 
          />
          <DetailField 
            label="Seguimiento" 
            value={observationData?.followUp || ''} 
            isEditing={isEditing}
            onChange={(value) => handleFieldChange('followUp', value)}
            multiline 
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-6 border-t">
          {/* Navegación - Solo mostrar si no es creación nueva y no está en modo edición */}
          {!isCreatingNew && !isEditing && (
            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                className={`flex items-center gap-2 px-4 py-2 ${currentIndex > 0 ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300 cursor-not-allowed'} transition-colors`}
                disabled={currentIndex <= 0}
              >
                <ChevronLeft className="w-4 h-4" />
                Estudiante anterior
              </button>
              
              <button
                onClick={handleNext}
                className={`flex items-center gap-2 px-4 py-2 ${currentIndex < totalObservations - 1 ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300 cursor-not-allowed'} transition-colors`}
                disabled={currentIndex >= totalObservations - 1}
              >
                Siguiente estudiante
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Botones de acción para el modo edición */}
          {isEditing && (
            <div className="flex gap-4 ml-auto">
              <CancelButton onClick={routeBefore} confirmExit={true} />
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C19B2C] transition-colors"
              >
                {isCreatingNew ? "Crear" : "Guardar"}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <BackButton onClick={routeBefore}>
        Volver a la lista
      </BackButton>
    </div>
  )
}

function DetailField({ label, value, isEditing, onChange, multiline = false, readOnly = false }) {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-900">{label}</h3>
      {isEditing ? (
        multiline ? (
          <textarea
            value={value}
            onChange={handleChange}
            readOnly={readOnly}
            className={`w-full p-3 border border-gray-300 rounded-lg ${!readOnly ? "focus:ring-2 focus:ring-blue-500 focus:border-blue-500" : "bg-gray-50"} min-h-[100px]`}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={handleChange}
            readOnly={readOnly}
            className={`w-full p-3 border border-gray-300 rounded-lg ${!readOnly ? "focus:ring-2 focus:ring-blue-500 focus:border-blue-500" : "bg-gray-50"}`}
          />
        )
      ) : (
        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{value || "..."}</p>
      )}
    </div>
  )
}

