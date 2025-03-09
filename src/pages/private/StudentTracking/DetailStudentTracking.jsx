import { useState, useEffect } from "react"
import { Download, Edit, Trash2, ChevronRight, ChevronLeft } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { PrivateRoutes, StudentGroupModel } from "../../../models"
import { BackButton, CancelButton } from "../../../components"
import { teacherDataService } from "../Dashboard/StudentLayout"
import { configViewService } from "../Setting"
import {TrackingTypeSelector,studentTrackingService} from "./"
import Swal from "sweetalert2"

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
  const [selectedPeriod, setSelectedPeriod] = useState(false)
  const [selectedTrackingType, setSelectedTrackingType] = useState()

  // Obtener la información del profesor desde Redux
  const userState = useSelector((store) => store.selectedUser)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const selectedPeriodSubscription = configViewService.getSelectedPeriod().subscribe(setSelectedPeriod);
    return () => selectedPeriodSubscription.unsubscribe();
  }, []);

  // Cargar los grupos de estudiantes al inicio
  useEffect(() => {
    const fetchStudentGroups = async () => {
      setLoading(true);
      try {
        // Usamos el método del servicio para obtener los grupos activos
        const response = await teacherDataService.getActiveStudentGroups();
        // Procesamos los datos recibidos para adaptarlos a nuestro modelo
        const formattedGroups = processStudentGroups(response);
        setStudentGroups(formattedGroups);
      } catch (error) {
        console.error("Error al cargar los grupos de estudiantes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentGroups();
  }, []);

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
        situation: '',
        compromise: '',
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
      
      // Establecer el tipo de seguimiento si existe en la observación
      if (observation?.trackingType?.id) {
        setSelectedTrackingType(observation.trackingType.id.toString());
      }
    }
  }, [location, userState])

  // En tu función processStudentGroups
  function processStudentGroups(studentGroups) {
    const groupMap = new Map();

    // Procesar cada estudiante y agruparlo
    studentGroups.forEach(item => {
      const groupId = item.group?.id;

      if (!groupId) {
        console.error("Grupo sin ID:", item);
        return;
      }

      // Si el grupo no existe en el mapa, lo creamos
      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, {
          group: item.group,
          students: []
        });
      }

      // Agregamos el estudiante al grupo
      if (item.student) {
        groupMap.get(groupId).students.push(item.student);
      }
    });

    // Convertimos el mapa a un array de StudentGroupModel
    return Array.from(groupMap.values()).map(groupData => {
      // Crear el modelo con la información del grupo
      const model = new StudentGroupModel(groupData);

      // IMPORTANTE: Llamar explícitamente a addStudents con los estudiantes
      const studentsFormatted = groupData.students.map(student => ({
        student: student
      }));

      model.addStudents(studentsFormatted);

      return model;
    });
  }

  const routeBefore = () => {
    navigate(PrivateRoutes.STUDENTTRACKING);
  }

  // Manejar cambio de grupo
  const handleGroupChange = (e) => {
    const groupId = parseInt(e.target.value)
    const group = studentGroups.find(g => g.group.id === groupId)

    setSelectedGroup(group)
    setSelectedStudent(null) // Resetear el estudiante seleccionado

    // Actualizar el director de grupo si corresponde
    if (group && group.group && group.group.mentor) {
      setObservationData(prev => ({
        ...prev,
        groupDirector: `${group.group.mentor.firstName || ''} ${group.group.mentor.lastName || ''}`.trim(),
        groupDirectorId: group.group.mentor.id,
        course: group.group.level ? `${group.group.level.levelName} - ${group.group.groupName}` : group.group.groupName
      }))
    }
  }

  // Manejar cambio de estudiante
  const handleStudentChange = (e) => {
    const studentId = parseInt(e.target.value)

    if (selectedGroup && selectedGroup.students) {
      const student = selectedGroup.students.find(s => s.id === studentId)
      setSelectedStudent(student)

      if (student) {
        setObservationData(prev => ({
          ...prev,
          studentId: student.id,
          studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim()
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

  const handleSave = async () => {
    // Para actualización, validar que tengamos los campos necesarios
    if (!isCreatingNew && (!observationData.id || !observationData.situation || !observationData.compromise)) {
      Swal.fire({
        title: 'Campos requeridos',
        text: 'Por favor, completa todos los campos requeridos',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }
  
    // Para creación, validar estudiante y tipo de seguimiento
    if (isCreatingNew && (!selectedStudent || !selectedTrackingType)) {
      Swal.fire({
        title: 'Campos requeridos',
        text: 'Por favor, selecciona un estudiante y un tipo de seguimiento',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }
  
    try {
      // Mostrar spinner durante la operación usando el componente predeterminado de SweetAlert
      Swal.fire({
        title: isCreatingNew ? 'Guardando seguimiento' : 'Actualizando seguimiento',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
  
      setLoading(true);
  
      if (isCreatingNew) {
        // Preparamos los datos según la estructura de StudentTrackingDomain.java
        const trackingData = {
          student: {
            id: selectedStudent.id
          },
          professor: {
            id: userState.id
          },
          period: {
            id: selectedPeriod
          },
          trackingType: {
            id: parseInt(selectedTrackingType)
          },
          situation: observationData.situation,
          compromise: observationData.compromise,
          followUp: observationData.followUp,
          date: observationData.date,
          status: "A"
        };
  
        // Llamamos al método para crear el seguimiento
        await studentTrackingService.createStudentTracking(trackingData);
  
        // Mostramos mensaje de éxito
        Swal.fire({
          title: '¡Éxito!',
          text: 'Seguimiento creado exitosamente',
          icon: 'success',
          confirmButtonText: 'Continuar'
        }).then(() => {
          // Redirigimos a la lista
          routeBefore();
        });
      } else {
        // Preparamos los datos para actualización
        const updateData = {
          id: observationData.id,
          student: {
            id: observationData.student?.id || observationData.studentId
          },
          professor: {
            id: userState.id
          },
          period: {
            id: observationData.period?.id || selectedPeriod
          },
          trackingType: {
            id: observationData.trackingType?.id || parseInt(selectedTrackingType)
          },
          situation: observationData.situation || observationData.situation,
          compromise: observationData.compromise,
          followUp: observationData.followUp,
          date: observationData.date,
          status: observationData.status || "A"
        };
        
        // Llamamos al método para actualizar el seguimiento
        await studentTrackingService.updateStudentTracking(observationData.id, updateData);
        
        Swal.fire({
          title: '¡Éxito!',
          text: 'Seguimiento actualizado exitosamente',
          icon: 'success',
          confirmButtonText: 'Continuar'
        }).then(() => {
          routeBefore();
        });
      }
    } catch (error) {
      console.error("Error al guardar el seguimiento:", error);
      
      Swal.fire({
        title: 'Error',
        text: `Error al ${isCreatingNew ? 'crear' : 'actualizar'} el seguimiento: ${error.message || 'Intenta nuevamente'}`,
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    } finally {
      setLoading(false);
    }
  };

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

  // Manejar la eliminación usando el servicio
  const handleDelete = () => {
    studentTrackingService.handleDelete(observationData?.id, routeBefore);
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
                {selectedGroup && selectedGroup.students && selectedGroup.students.length > 0 ? (
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
                ) : selectedGroup ? (
                  <p className="text-amber-600">No hay estudiantes disponibles en este grupo.</p>
                ) : null}
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
  </div>
  {/* Action Buttons - No mostrar en modo creación */}
  {!isCreatingNew && (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDelete}
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
  
  {/* Director de grupo - Solo visible cuando NO se está editando o en modo creación */}
  {(isCreatingNew) && (
    <DetailField
      label="Director de grupo"
      value={observationData?.groupDirector || ''}
      isEditing={false}
      readOnly={true}
    />
  )}
  
  {/* Selector de Tipo de Seguimiento */}
  {(isCreatingNew && selectedStudent) || (!isCreatingNew && isEditing) ? (
    <div className="space-y-2 mt-4">
      <h3 className="font-medium text-gray-800">Tipo de Seguimiento</h3>
      <TrackingTypeSelector
        value={selectedTrackingType || (observationData?.trackingType?.id?.toString())}
        onChange={(value) => setSelectedTrackingType(value)}
      />
    </div>
  ) : !isCreatingNew ? (
    <DetailField
      label="Tipo de Seguimiento"
      value={observationData?.trackingType?.type || ''}
      isEditing={false}
      readOnly={true}
    />
  ) : null}
  
  <DetailField
    label="Descripción del comportamiento"
    value={observationData?.situation || ''}
    isEditing={isEditing}
    onChange={(value) => handleFieldChange('situation', value)}
    multiline
  />
  <DetailField
    label="Descarga y compromiso"
    value={observationData?.compromise || ''}
    isEditing={isEditing}
    onChange={(value) => handleFieldChange('compromise', value)}
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
