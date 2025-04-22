import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { teacherDataService } from "../Dashboard/StudentLayout/StudentService";
import { activityService } from "./activityService"; // Agregar esta importación
import { BackButton } from "../../../components";
import { PrivateRoutes } from "../../../models";
import SubjectHeader from "../Subject/SubjectHeader";
import AchievementModal from "./AchievementModal";
import EvaluationSchemeModal from "./EvaluationSchemeModal";
import { format, isAfter, parseISO } from 'date-fns';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from 'sweetalert2'; // Asegúrate de tener esta importación


export default function ActivitiesGrading() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [editedActivity, setEditedActivity] = useState(null);
  const [subject, setSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [isAchieveModalOpen, setIsAchieveModalOpen] = useState(false);
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);
  const [comments, setComments] = useState({});
  const [isCompact, setIsCompact] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dateError, setDateError] = useState(""); // Estado para manejar errores de fecha

  useEffect(() => {
    if (!location.state?.activity || !location.state?.subject) {
      console.error("🚨 Error: No hay datos de actividad o materia.");
      navigate(PrivateRoutes.DASHBOARD);
      return;
    }
    
    const initialActivity = location.state.activity;
    // Asegurarse de que las fechas sean strings en formato ISO
    const formattedActivity = {
      ...initialActivity,
      startDate: initialActivity.startDate || null,
      endDate: initialActivity.endDate || null,
      // Asegurarnos de que subject esté disponible
      subject: location.state.subject || null,
      // Asegurar otros campos potencialmente problemáticos
      groupId: initialActivity.groupId || location.state.subject?.group?.id,
      achievementGroupId: initialActivity.achievementGroupId || null,
      knowledge: initialActivity.knowledge || null
    };
  
    setActivity(formattedActivity);
  
    // Convertir las fechas a objetos Date para el DatePicker
    const activityWithDateObjects = {
      ...formattedActivity,
      startDate: formattedActivity.startDate ? parseISO(formattedActivity.startDate) : null,
      endDate: formattedActivity.endDate ? parseISO(formattedActivity.endDate) : null
    };
  
    setEditedActivity(activityWithDateObjects);
    setSubject(location.state.subject);
    

    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        
        // Mostrar indicador de carga
        Swal.fire({
          title: 'Cargando información...',
          text: 'Obteniendo datos de estudiantes y calificaciones',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
          
        });
        
        const studentList = await teacherDataService.getActivitiesScoresForGroup(
          location.state.activity.id,
          location.state.subject.group.id
        );
        setStudents(studentList || []);
        
        // Inicializar el estado de las calificaciones con las notas existentes
        const initialGrades = {};
        const initialComments = {};
    
        studentList.forEach(student => {
          if (student.score !== undefined) {
            initialGrades[student.studentId] = student.score;
            initialComments[student.studentId] = student.comment || "";
          }
        });
        setGrades(initialGrades);
        setComments(initialComments);
        
        // Cerrar el indicador de carga cuando termina
        Swal.close();
      } catch (error) {
        console.error("Error cargando estudiantes:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los estudiantes y calificaciones',
          timer: 2000
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
    
    // ... resto del código del useEffect
  }, [location.state, navigate]);


  // Función para manejar cambios en la fecha de inicio
  const handleStartDateChange = (date) => {
    setDateError(""); // Limpiamos cualquier error previo

    // Si hay fecha de fin y la nueva fecha de inicio es posterior, mostramos error
    if (editedActivity.endDate && isAfter(date, editedActivity.endDate)) {
      setDateError("La fecha de inicio no puede ser posterior a la fecha de fin");
    }

    setEditedActivity({ ...editedActivity, startDate: date });
  };

  // Función para manejar cambios en la fecha de fin
  const handleEndDateChange = (date) => {
    setDateError(""); // Limpiamos cualquier error previo

    // Si la fecha de fin es anterior a la de inicio, mostramos error
    if (date && editedActivity.startDate && isAfter(editedActivity.startDate, date)) {
      setDateError("La fecha de fin no puede ser anterior a la fecha de inicio");
    }

    setEditedActivity({ ...editedActivity, endDate: date });
  };

  //  Función para guardar calificaciones
  const handleSaveGrades = async () => {
    try {
      setIsLoading(true);
      
      // Mostrar indicador de carga
      Swal.fire({
        title: 'Guardando calificaciones...',
        text: 'Enviando datos al servidor',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
        
      });
  
      // Preparar los datos para enviar al servidor
      const gradesData = students.map(student => ({
        id: student.id, // Añadimos el ID si existe
        studentId: student.studentId,
        activity: {
          id: activity.activityGroupId,
          activity: {id: activity.id},
          group: {id: activity.groupId},
        },
        score: grades[student.studentId] || null,
        comment: comments[student.studentId] || ""
      }));
  
      console.log("Datos a guardar:", gradesData); // Para debugging
  
      const response = await activityService.saveActivityScores(activity.activityGroupId, gradesData);
  
      // Cerrar el indicador de carga cuando termina
      Swal.close();
  
      if (response.success) {
        await Swal.fire({
          title: '¡Éxito!',
          text: 'Calificaciones guardadas correctamente',
          icon: 'success'
        });
        navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITIES_SUBJECT);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error al guardar calificaciones:", error);
      await Swal.fire({
        title: 'Error',
        text: `Error al guardar las calificaciones: ${error.message || 'Error desconocido'}`,
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para alternar entre vista normal y compacta
  const toggleCompactView = () => {
    setIsCompact(!isCompact);
  };

  // Renderizado de cada fila de estudiante
  const renderStudentRow = (student) => (
    

    <div className="py-2 px-3 flex flex-col md:flex-row md:items-center bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
      
      {/* Información del estudiante */}
      <div className="w-full md:w-1/5 mb-1 md:mb-0">
        <span className="font-medium text-gray-800 text-sm">
          {student.firstName} {student.lastName}
        </span>
      </div>

      <div className="w-full md:w-4/5 flex flex-col sm:flex-row gap-2">
        {/*  Área de Comentario - PRIMERO el comentario (sin etiqueta) */}
        <div className="flex-grow">
          <textarea
            id={`comment-${student.studentId}`}
            rows={isCompact ? "1" : "2"}
            className={`w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 overflow-y-auto ${isCompact ? 'max-h-8' : ''}`}
            value={comments[student.studentId] || ''}
            onChange={(e) =>
              setComments({ ...comments, [student.studentId]: e.target.value })
            }
            aria-label={`Comentario para ${student.firstName} ${student.lastName}`}
          />
        </div>

        {/*  Input de Nota - DESPUÉS la nota (sin etiqueta) */}
        <div className="flex-none w-16">
          <input
            id={`grade-${student.studentId}`}
            type="number"
            min="0"
            max="10"
            step="0.1"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={grades[student.studentId] || ''}
            onChange={(e) =>
              setGrades({ ...grades, [student.studentId]: e.target.value })
            }
            aria-label={`Nota para ${student.firstName} ${student.lastName}`}
          />
        </div>
      </div>
    </div>
  );

  //  Botón de Logro
  const handleOpenLogro = () => {
    setIsAchieveModalOpen(true);
  };

  //  Función para guardar el logro
  const handleSaveLogro = async (data) => {
    try {
      setIsLoading(true);
      
      // Mostrar indicador de carga
      Swal.fire({
        title: 'Guardando logro...',
        text: 'Actualizando información',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
        
      });
      
      // Verificamos que tengamos todos los datos necesarios
      if (!data || !data.id || !data.achievementGroupId) {
        throw new Error("Faltan datos requeridos para actualizar el logro");
      }
  
      // Llamada a la API para actualizar el logro
      const response = await activityService.updateActivityAchievement(
        data.id,
        data.achievementGroupId,
      );
  
      // Cerrar el indicador de carga cuando termina
      Swal.close();
  
      if (response.success) {
        // Actualizar el estado local con el nuevo logro
        setActivity(prev => ({
          ...prev,
          achievementGroup: {
            ...prev.achievementGroup,
            subjectKnowledge: {
              id: data.subjectKnowledgeId
            }
          }
        }));
  
        // Mostrar mensaje de éxito
        await Swal.fire({
          title: '¡Éxito!',
          text: 'Logro actualizado correctamente',
          icon: 'success',
          timer: 2000
        });
  
        return true;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error al guardar el logro:", error);
      await Swal.fire({
        title: 'Error',
        text: `Error al actualizar el logro: ${error.message || 'Error desconocido'}`,
        icon: 'error'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Nueva función para manejar la actualización de la actividad
  const handleActivityUpdate = async () => {
    try {
      if (dateError) {
        Swal.fire({
          title: 'Error',
          text: dateError,
          icon: 'error'
        });
        return;
      }
  
      setIsLoading(true);
      
      // Mostrar indicador de carga
      Swal.fire({
        title: 'Actualizando actividad...',
        text: 'Guardando cambios',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
        
      });
  
      const activityData = {
        id: editedActivity.id,
        name: editedActivity.name,
        description: editedActivity.description,
        startDate: editedActivity.startDate ? format(editedActivity.startDate, 'yyyy-MM-dd') : null,
        endDate: editedActivity.endDate ? format(editedActivity.endDate, 'yyyy-MM-dd') : null,
        status: editedActivity.status,
        groupId: subject.group.id,
        achievementGroup: {
          id: editedActivity.achievementGroup?.id || editedActivity.achievementGroupId
        },
        group: subject.group
      };
  
      const response = await activityService.updateActivity(activityData);
  
      // Cerrar el indicador de carga cuando termina
      Swal.close();
  
      if (response.success) {
        const updatedActivity = {
          ...response.data,
          startDate: response.data.startDate,
          endDate: response.data.endDate,
          group: subject.group
        };
  
        setActivity(updatedActivity);
        setEditedActivity({
          ...updatedActivity,
          startDate: updatedActivity.startDate ? parseISO(updatedActivity.startDate) : null,
          endDate: updatedActivity.endDate ? parseISO(updatedActivity.endDate) : null
        });
  
        setIsEditing(false);
  
        await Swal.fire({
          title: '¡Éxito!',
          text: 'Información de la actividad actualizada correctamente',
          icon: 'success'
        });
  
        // Redirigir de vuelta a la lista de actividades para que se actualice
        if (location.state?.returnPath) {
          navigate(location.state.returnPath);
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error al actualizar la actividad:", error);
      Swal.fire({
        title: 'Error',
        text: 'Error al actualizar la información de la actividad: ' + (error.message || 'Error desconocido'),
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  //  Botón de Esquema (si lo necesitas)
  const handleOpenScheme = () => {
    setIsSchemeModalOpen(true);
  };

  const handleDeleteActivity = async () => {
    try {
      // Confirmar antes de eliminar
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });
  
      if (result.isConfirmed) {
        setIsLoading(true);
        
        // Mostrar indicador de carga
        Swal.fire({
          title: 'Eliminando actividad...',
          text: 'Procesando solicitud',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
          
        });
        
        const response = await activityService.deleteActivity(activity.id);
        console.log(response);
        
        // Cerrar el indicador de carga cuando termina
        Swal.close();
        
        if (response.success) {
          Swal.fire(
            '¡Eliminado!',
            'La actividad ha sido eliminada.',
            'success'
          ).then(() => {
            // Redirigir al listado de actividades
            navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITIES_SUBJECT);
          });
        } else {
          throw new Error(response.message);
        }
      }
    } catch (error) {
      console.error("Error al eliminar la actividad:", error);
      Swal.fire(
        'Error',
        'No se pudo eliminar la actividad: ' + (error.message || 'Error desconocido'),
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };
  


  // Componente de edición con DatePicker
  const renderActivityEditForm = () => (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Información de la Actividad</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setDateError("");

              if (isEditing) {
                // Si estamos cancelando, restauramos los valores originales
                const originalWithDateObjects = {
                  ...activity,
                  startDate: activity.startDate ? parseISO(activity.startDate) : null,
                  endDate: activity.endDate ? parseISO(activity.endDate) : null,
                  // Asegurarse de mantener todas las referencias necesarias
                  achievementGroupId: activity.achievementGroup?.id,
                  group: activity.group
                };
                setEditedActivity(originalWithDateObjects);
              }
            }}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={isLoading}
          >
            {isEditing ? "Cancelar" : "Editar"}
          </button>
          <button
            onClick={handleDeleteActivity}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
            disabled={isLoading}
          >
            Eliminar
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={editedActivity.name}
              onChange={(e) => setEditedActivity({ ...editedActivity, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={editedActivity.description}
              onChange={(e) => setEditedActivity({ ...editedActivity, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="2"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de inicio
            </label>
            <DatePicker
              selected={editedActivity.startDate}
              onChange={handleStartDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              dateFormat="dd/MM/yyyy"
              placeholderText="Seleccione fecha de inicio"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de fin (opcional)
            </label>
            <DatePicker
              selected={editedActivity.endDate}
              onChange={handleEndDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              dateFormat="dd/MM/yyyy"
              placeholderText="Seleccione fecha de fin"
              disabled={isLoading}
              isClearable={true} // Permite borrar la fecha
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={editedActivity.status}
              onChange={(e) => setEditedActivity({ ...editedActivity, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            >
              <option value="A">Activo</option>
              <option value="P">Pausado</option>
            </select>
          </div>

          <div className="md:col-span-2">
            {dateError && (
              <p className="text-red-500 text-sm mb-2">{dateError}</p>
            )}
            <div className="flex justify-end">
              <button
                onClick={handleActivityUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={isLoading || dateError !== ""}
              >
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <p className="text-sm font-medium text-gray-500">Nombre:</p>
            <p className="text-gray-900">{activity.name}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Descripción:</p>
            <p className="text-gray-900">{activity.description}</p>
          </div>

          <div>
  <p className="text-sm font-medium text-gray-500">Fecha de inicio:</p>
  <p className="text-gray-900">
    {activity.startDate 
      ? format(new Date(activity.startDate + 'T00:00:00'), 'dd/MM/yyyy')
      : 'No definida'}
  </p>
</div>

<div>
  <p className="text-sm font-medium text-gray-500">Fecha de fin:</p>
  <p className="text-gray-900">
    {activity.endDate 
      ? format(new Date(activity.endDate + 'T00:00:00'), 'dd/MM/yyyy')
      : 'No definida'}
  </p>
</div>

          <div>
            <p className="text-sm font-medium text-gray-500">Estado:</p>
            <p className="text-gray-900">
              {activity.status === 'A' ? 'Activo' : 'Inactivo'}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (!activity || !subject) {
    return <p className="text-gray-500 text-center">Cargando información...</p>;
  }

  return (
    <div className="space-y-6">
      <SubjectHeader
        isTeacher={true} // O la condición que tengas para saber si es profesor
        subjectName={`${subject.subjectName} - ${activity.name}`}
        periodGrade={null} // Si no usas la nota de periodo aquí, puedes poner null
        activities={[activity]} // Si deseas que calcule un promedio de esta actividad (o más)
        groupInfo={subject.group} // Para mostrar info del grupo
        onOpenScheme={handleOpenScheme} // Corregido
        onOpenLogro={handleOpenLogro}   // Opcional
      />

      {/* Agregar el formulario de edición aquí */}
      {renderActivityEditForm()}

      <div className="max-w-6xl mx-auto">
        {/*  Lista de Estudiantes */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-800">Lista de estudiantes</h3>
            <button
              onClick={toggleCompactView}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              {isCompact ? "Expandir campos" : "Ajustar campos"}
            </button>
          </div>

          {/* Cabecera de la tabla */}
          <div className="py-2 px-3 flex flex-col md:flex-row md:items-center bg-gray-100 rounded-t-md font-medium text-gray-700 text-sm border-b-2 border-gray-200">
            <div className="w-full md:w-1/5 mb-1 md:mb-0">
              <span>Estudiante</span>
            </div>

            <div className="w-full md:w-4/5 flex flex-col sm:flex-row gap-2">
              <div className="flex-grow">
                <span>Comentario</span>
              </div>
              <div className="flex-none w-16 text-center">
                <span>Nota</span>
              </div>
            </div>
          </div>

          {/* Cuerpo de la tabla */}
          <div className="overflow-y-auto max-h-screen">
            {students.length > 0 ? (
              <div>
                {students.map((student) => (
                  <div key={student.studentId}>
                    {renderStudentRow(student)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center p-4 text-sm">
                No hay estudiantes en este grupo.
              </p>
            )}
          </div>
        </div>
      </div>


      {/*  Botón para guardar calificaciones */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveGrades}
          className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
        >
          Guardar Calificaciones
        </button>
      </div>

      {/*  Botón de regreso */}
      <BackButton
        confirmExit={true}
        onClick={() =>
          navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.ACTIVITIES_SUBJECT)
        }
      />

      {/*  Modal de Logro */}
      <AchievementModal
  isOpen={isAchieveModalOpen}
  onClose={(isCancelled) => {
    setIsAchieveModalOpen(false);
    // No hacemos nada más cuando se cierra el modal
  }}
  activity={activity} 
  onSave={handleSaveLogro}
/>
      <EvaluationSchemeModal
        isOpen={isSchemeModalOpen}
        onClose={() => setIsSchemeModalOpen(false)}
        //Para el profesor
        groupId={subject.group?.id}
      />
    </div>
  );
}
