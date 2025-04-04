import { useState, useEffect } from "react";
import { ChevronLeft, ChevronDown, Edit, Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { EditRecoveryModal, NewRecoveryModal, reportService } from "./";

const FailedStudentsListProcess = ({ subject, group, levelId, onBack }) => {
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    periodId: "",
    levelId: levelId || "",
    subjectId: subject?.id || ""
  });

  const [loading, setLoading] = useState(false);
  const [failedStudents, setFailedStudents] = useState([]);
  const [educationalLevels, setEducationalLevels] = useState([]);
  const [periods, setPeriods] = useState([]);

  // Estados para el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Estados para el modal de nueva recuperación
  const [isNewRecoveryModalOpen, setIsNewRecoveryModalOpen] = useState(false);
  const [groupStudents, setGroupStudents] = useState([]);

  // Cargar niveles educativos y períodos al montar el componente
  useEffect(() => {
    fetchEducationalLevels();
    fetchPeriods(filters.year);
  }, []);

  // Actualizar el levelId cuando cambia el prop
  useEffect(() => {
    if (levelId) {
      setFilters(prev => ({ ...prev, levelId }));
    }
  }, [levelId]);

  // Actualizar idSubject cuando cambia el subject prop
  useEffect(() => {
    if (subject?.id) {
      setFilters(prev => ({ ...prev, subjectId: subject.id }));
    }
  }, [subject]);


  // Cargar datos de estudiantes reprobados cuando cambian los filtros
  useEffect(() => {
    if (filters.levelId && filters.periodId && filters.levelId !== "" && filters.periodId !== "") {
      fetchFailedStudents();
    }
  }, [filters.year, filters.levelId, filters.periodId, filters.subjectId]);

  // Cargar estudiantes del grupo cuando se abre el modal de nueva recuperación
  useEffect(() => {
    if (isNewRecoveryModalOpen && group?.id) {
      fetchGroupStudents(group.id);
    }
  }, [isNewRecoveryModalOpen, group]);

  const fetchEducationalLevels = async () => {
    try {
      const data = await reportService.getEducationalLevels();

      // Verificar si data es undefined o null
      if (!data) {
        setEducationalLevels([]);
        return;
      }

      setEducationalLevels(data);
    } catch (error) {
      console.error("Error al obtener niveles educativos:", error);
      setEducationalLevels([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los niveles educativos'
      });
    }
  };


  const fetchPeriods = async (year) => {
    try {
      const data = await reportService.getPeriods(year);

      // Verificar si data es undefined o null
      if (!data) {
        setPeriods([]);
        setFilters(prev => ({ ...prev, periodId: "" }));
        Swal.fire({
          icon: 'warning',
          title: 'Sin periodos',
          text: `No hay periodos disponibles para el año ${year}`
        });
        return;
      }

      setPeriods(data);

      if (data.length > 0) {
        setFilters(prev => ({ ...prev, periodId: data[0].id }));
      } else {
        setFilters(prev => ({ ...prev, periodId: "" }));
        Swal.fire({
          icon: 'warning',
          title: 'Sin periodos',
          text: `No hay periodos disponibles para el año ${year}`
        });
      }
    } catch (error) {
      console.error("Error al obtener períodos:", error);
      setPeriods([]);
      setFilters(prev => ({ ...prev, periodId: "" }));
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los períodos'
      });
    }
  };

  const fetchFailedStudents = async () => {
    try {
      setLoading(true);
      const data = await reportService.getRecoveryReport(
        filters.subjectId,
        filters.levelId,
        filters.year
      );

      // Verificar si data es undefined o null
      setFailedStudents(data || []);
    } catch (error) {
      console.error("Error al obtener estudiantes reprobados:", error);
      setFailedStudents([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los estudiantes reprobados'
      });
    } finally {
      setLoading(false);
    }
  };


  const fetchGroupStudents = async (groupId) => {
    try {
      console.log("Cargando estudiantes para el grupo ID:", groupId);
      const data = await reportService.fetchListUsersGroupData(groupId);

      if (data && data.students) {
        console.log("Estudiantes cargados:", data.students);
        setGroupStudents(data.students);
      } else {
        console.warn("No se encontraron estudiantes en la respuesta:", data);
      }
    } catch (error) {
      console.error("Error al obtener estudiantes del grupo:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los estudiantes del grupo'
      });
    }
  };

  const handleYearChange = (year) => {
    setFilters(prev => ({ ...prev, year }));
    fetchPeriods(year);
  };

  const handlePeriodChange = (periodId) => {
    setFilters(prev => ({ ...prev, periodId }));
  };

  // Formatear número con 2 decimales
  const formatNumber = (num) => {
    return Number(num).toFixed(2);
  };


  // Manejar clic en el botón de editar nota de recuperación
  const handleEditClick = (student) => {
    if (!student) {
      console.error("No se puede editar un estudiante indefinido");
      return;
    }

    setEditingStudent(student);
    setIsEditModalOpen(true);
  };

  // Guardar cambios de edición
  const handleSaveEdit = async (formData) => {
    try {
      console.log(formData)
      // Validar que los datos no sean undefined
      if (!formData.totalScore || formData.recovered === undefined) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos incompletos',
          text: 'Por favor complete todos los campos requeridos'
        });
        return;
      }

      console.log("Enviando datos de edición:", {
        recoveryId: editingStudent.id,
        newScore: formData.totalScore,
        status: formData.recovered
      });

      // Llamar al endpoint para editar la recuperación
      await reportService.editRecoveryStudent(
        editingStudent.id,
        formData.totalScore,
        formData.recovered
      );

      // Recargar datos
      fetchFailedStudents();
      setIsEditModalOpen(false);

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Calificación actualizada correctamente'
      });
    } catch (error) {
      console.error("Error al actualizar calificación:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar la calificación'
      });
    }
  };

  // Eliminar recuperación
  const handleDeleteClick = (recoveryId) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede revertir",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await reportService.deleteRecoveryStudent(recoveryId);
          fetchFailedStudents();
          Swal.fire(
            '¡Eliminado!',
            'La recuperación ha sido eliminada.',
            'success'
          );
        } catch (error) {
          console.error("Error al eliminar recuperación:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar la recuperación'
          });
        }
      }
    });
  };

  // Abrir modal para nueva recuperación
  const handleNewRecoveryClick = () => {
    setIsNewRecoveryModalOpen(true);
  };

  // Guardar nueva recuperación
  const handleSaveNewRecovery = async (formData) => {
    try {
      // Validar formulario
      if (!formData.idStudent || !formData.newScore) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos incompletos',
          text: 'Por favor complete todos los campos requeridos'
        });
        return;
      }

      console.log("Enviando datos de recuperación:", formData);

      // Llamada al endpoint del backend
      await reportService.recoverStudent(
        formData.idStudent,
        formData.idSubject,
        formData.idPeriod,
        formData.newScore
      );

      // Recargar datos
      fetchFailedStudents();
      setIsNewRecoveryModalOpen(false);

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Recuperación registrada correctamente'
      });
    } catch (error) {
      console.error("Error al registrar recuperación:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo registrar la recuperación'
      });
    }
  };
  console.log(failedStudents)
  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="bg-yellow-400 text-black px-6 py-2 rounded-full">
          Lista de estudiantes reprobados
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Año escolar</label>
              <div className="mt-1 relative">
                <select
                  value={filters.year}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="appearance-none w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <option key={i} value={new Date().getFullYear() - 2 + i}>
                      {new Date().getFullYear() - 2 + i}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Periodo</label>
              <div className="mt-1 relative">
                <select
                  value={filters.periodId}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="appearance-none w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {!periods || periods.length === 0 ? (
                    <option value="">No hay periodos disponibles</option>
                  ) : (
                    periods.map((period) => (
                      <option key={period.id} value={period.id}>
                        {period.name}
                      </option>
                    ))
                  )}

                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Categoría</label>
              <div className="mt-1 relative">
                <select
                  value={filters.levelId}
                  disabled={true}
                  className="appearance-none w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm text-sm focus:outline-none"
                >
                  {!educationalLevels || educationalLevels.length === 0 ? (
                    <option value="">No hay niveles disponibles</option>
                  ) : (
                    educationalLevels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.levelName}
                      </option>
                    ))
                  )}

                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <div className="mt-1 relative">
                <select
                  className="appearance-none w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm text-sm focus:outline-none"
                  defaultValue="Simple"
                  disabled
                >
                  <option>Simple</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Área</label>
              <div className="mt-1">
                <input
                  type="text"
                  className="px-3 py-2 border border-gray-300 rounded-md w-full bg-gray-100"
                  value="Dimensión cognitiva"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Materia</label>
              <div className="mt-1">
                <input
                  type="text"
                  className="px-3 py-2 border border-gray-300 rounded-md w-full bg-gray-100"
                  value={subject?.name || "Matemáticas"}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-md shadow-sm">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center">
                {group?.groupName || "Segundo B"} <ChevronDown className="ml-2 h-5 w-5" />
              </h2>
              <button
                onClick={handleNewRecoveryClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" /> Nueva recuperación
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nota Actual
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nota Anterior
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                        <p className="mt-2 text-gray-500">Cargando datos...</p>
                      </td>
                    </tr>
                  ) : !failedStudents || failedStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6">
                        <p className="text-gray-500">No hay estudiantes reprobados disponibles.</p>
                      </td>
                    </tr>
                  ) : (
                    failedStudents.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {`${index + 1}. ${item.subjectGrade.student.firstName} ${item.subjectGrade.student.lastName}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <div className="flex items-center justify-center">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.subjectGrade.recovered === "Y"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                              }`}>
                              {item.subjectGrade.recovered === "Y" ? "Recuperado" : "Reprobado"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          {formatNumber(item.previousScore)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          {formatNumber(item.subjectGrade.totalScore)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(item.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


{/* Modales */}
<EditRecoveryModal
  isOpen={isEditModalOpen}
  onClose={() => setIsEditModalOpen(false)}
  student={editingStudent}
  onSave={handleSaveEdit}
/>

<NewRecoveryModal
  isOpen={isNewRecoveryModalOpen}
  onClose={() => setIsNewRecoveryModalOpen(false)}
  subject={subject || {}}
  periods={periods || []}
  students={groupStudents || []}
  selectedPeriod={filters.periodId || ""}
  failedStudents={failedStudents || []}
  onSave={handleSaveNewRecovery}
/>

    </div>
  );
};

export default FailedStudentsListProcess;
