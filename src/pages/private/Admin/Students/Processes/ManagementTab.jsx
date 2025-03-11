import React, { useState, useEffect } from "react";
import { Edit, ChevronDown, Save, User, UserPlus, School, MapPin, Phone } from "lucide-react";
import { studentAdminService } from "../studentAdminService"; // Ajusta la ruta según tu estructura
import Swal from "sweetalert2"; // Importamos SweetAlert2

const ManagementTab = () => {
  // Estado para almacenar los grupos disponibles
  const [groups, setGroups] = useState([]);
  const [levels, setLevels] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [idTypes, setIdTypes] = useState([]);

  // Estado para almacenar los datos del formulario
  const [formData, setFormData] = useState({
    userDomain: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "123456", // Contraseña por defecto
      roles: ["ROLE_STUDENT"], // Rol por defecto para estudiantes
      status: "A", // Activo por defecto
      promotionStatus: "A" // Activo por defecto
    },
    userDetailDomain: {
      firstName: "",
      middleName: "",
      lastName: "",
      secondLastName: "",
      address: "",
      phoneNumber: "",
      dateOfBirth: "",
      dni: "",
      idType: {
        id: 2, // TI por defecto para estudiantes
        name: "TI"
      },
      neighborhood: "",
      city: "",
      positionJob: "Estudiante" // Por defecto
    },
    groupId: null
  });

  // Cargar grupos y tipos de ID al iniciar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar grupos activos
        const groupsData = await studentAdminService.getActiveGroups();
        setGroups(groupsData);
        
        // Extraer niveles únicos
        const uniqueLevels = Array.from(
          new Set(groupsData.map(group => group.level.levelName))
        ).map(levelName => {
          const group = groupsData.find(g => g.level.levelName === levelName);
          return {
            id: group.level.id,
            name: levelName
          };
        });
        
        setLevels(uniqueLevels);
        
        // Cargar tipos de ID
        const idTypesData = await studentAdminService.getIdTypes();
        setIdTypes(idTypesData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error de carga',
          text: 'No se pudieron cargar los datos necesarios para el registro',
          confirmButtonColor: '#3085d6'
        });
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar grupos cuando cambia el nivel seleccionado
  useEffect(() => {
    if (selectedLevel) {
      const filtered = groups.filter(group => group.level.id === parseInt(selectedLevel));
      setFilteredGroups(filtered);
    } else {
      setFilteredGroups([]);
    }
  }, [selectedLevel, groups]);

  // Manejar cambios en los campos del formulario
  const handleChange = (section, field, value) => {
    setFormData(prevState => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [field]: value
      }
    }));
  };

  // Manejar cambios en campos anidados
  const handleNestedChange = (section, nestedField, field, value) => {
    setFormData(prevState => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [nestedField]: {
          ...prevState[section][nestedField],
          [field]: value
        }
      }
    }));
  };

  // Actualizar el nombre del tipo de ID cuando cambia el ID
  const handleIdTypeChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const selectedType = idTypes.find(type => type.id === selectedId);
    
    setFormData(prevState => ({
      ...prevState,
      userDetailDomain: {
        ...prevState.userDetailDomain,
        idType: {
          id: selectedId,
          name: selectedType ? selectedType.name : ""
        }
      }
    }));
  };

  // Manejar cambio de nivel educativo
  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
    setFormData(prevState => ({
      ...prevState,
      groupId: null
    }));
  };

  // Manejar cambio de grupo
  const handleGroupChange = (e) => {
    setFormData(prevState => ({
      ...prevState,
      groupId: parseInt(e.target.value)
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Asegurarse de que los nombres coincidan entre userDomain y userDetailDomain
      const updatedFormData = {
        ...formData,
        userDomain: {
          ...formData.userDomain,
          firstName: formData.userDetailDomain.firstName,
          lastName: formData.userDetailDomain.lastName
        }
      };

      // Generar username automáticamente si está vacío (firstName.lastName)
      if (!updatedFormData.userDomain.username) {
        const firstName = formData.userDetailDomain.firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const lastName = formData.userDetailDomain.lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        updatedFormData.userDomain.username = `${firstName}.${lastName}`;
      }

      // Enviar datos al servidor
      await studentAdminService.createStudentFetchingGroup(updatedFormData);
      
      // Mostrar mensaje de éxito con SweetAlert
      Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        text: 'El estudiante ha sido registrado correctamente',
        confirmButtonColor: '#3085d6'
      });
      
      // Resetear formulario
      setFormData({
        userDomain: {
          username: "",
          email: "",
          firstName: "",
          lastName: "",
          password: "123456",
          roles: ["ROLE_STUDENT"],
          status: "A",
          promotionStatus: "A"
        },
        userDetailDomain: {
          firstName: "",
          middleName: "",
          lastName: "",
          secondLastName: "",
          address: "",
          phoneNumber: "",
          dateOfBirth: "",
          dni: "",
          idType: {
            id: 2, // TI por defecto para estudiantes
            name: "TI"
          },
          neighborhood: "",
          city: "",
          positionJob: "Estudiante"
        },
        groupId: null
      });
      
      setSelectedLevel("");
      
    } catch (error) {
      console.error("Error al registrar estudiante:", error);
      
      // Mostrar mensaje de error con SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text: 'No se pudo registrar el estudiante. Por favor, intente nuevamente.',
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <UserPlus className="mr-2 h-6 w-6 text-primary" />
        Registro de Nuevo Estudiante
      </h2>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600">Cargando...</span>
        </div>
      )}

      {!loading && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sección de información personal básica */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <User className="mr-2 h-5 w-5 text-gray-600" />
              Información Personal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primer Nombre*
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                  value={formData.userDetailDomain.firstName}
                  onChange={(e) => handleChange("userDetailDomain", "firstName", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segundo Nombre
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                  value={formData.userDetailDomain.middleName}
                  onChange={(e) => handleChange("userDetailDomain", "middleName", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primer Apellido*
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                  value={formData.userDetailDomain.lastName}
                  onChange={(e) => handleChange("userDetailDomain", "lastName", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segundo Apellido
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                  value={formData.userDetailDomain.secondLastName}
                  onChange={(e) => handleChange("userDetailDomain", "secondLastName", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento*
                </label>
                <div className="relative">
                  <select
                    required
                    className="appearance-none w-full border border-gray-300 rounded-md pl-3 pr-10 py-2 focus:ring-primary focus:border-primary"
                    value={formData.userDetailDomain.idType.id}
                    onChange={handleIdTypeChange}
                  >
                    {idTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Documento*
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                  value={formData.userDetailDomain.dni}
                  onChange={(e) => handleChange("userDetailDomain", "dni", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                  value={formData.userDetailDomain.dateOfBirth}
                  onChange={(e) => handleChange("userDetailDomain", "dateOfBirth", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Sección de información de contacto */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-gray-600" />
              Información de Contacto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico*
                </label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                  value={formData.userDomain.email}
                  onChange={(e) => handleChange("userDomain", "email", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                  value={formData.userDetailDomain.phoneNumber}
                  onChange={(e) => handleChange("userDetailDomain", "phoneNumber", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                  value={formData.userDetailDomain.address}
                  onChange={(e) => handleChange("userDetailDomain", "address", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barrio
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                  value={formData.userDetailDomain.neighborhood}
                  onChange={(e) => handleChange("userDetailDomain", "neighborhood", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                  value={formData.userDetailDomain.city}
                  onChange={(e) => handleChange("userDetailDomain", "city", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Sección de información académica */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <School className="mr-2 h-5 w-5 text-gray-600" />
              Información Académica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel Educativo*
                </label>
                <div className="relative">
                  <select
                    required
                    className="appearance-none w-full border border-gray-300 rounded-md pl-3 pr-10 py-2 focus:ring-primary focus:border-primary"
                    value={selectedLevel}
                    onChange={handleLevelChange}
                  >
                    <option value="">Seleccione un nivel</option>
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grupo*
                </label>
                <div className="relative">
                  <select
                    required
                    disabled={!selectedLevel}
                    className="appearance-none w-full border border-gray-300 rounded-md pl-3 pr-10 py-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:text-gray-500"
                    value={formData.groupId || ""}
                    onChange={handleGroupChange}
                  >
                    <option value="">Seleccione un grupo</option>
                    {filteredGroups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.groupName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                  value={formData.userDomain.username}
                  onChange={(e) => handleChange("userDomain", "username", e.target.value)}
                  placeholder="Se generará automáticamente"
                />
                <p className="text-xs text-gray-500 mt-1">Si se deja vacío, se generará como nombre.apellido</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado de Promoción
                </label>
                <div className="relative">
                  <select
                    className="appearance-none w-full border border-gray-300 rounded-md pl-3 pr-10 py-2 focus:ring-primary focus:border-primary"
                    value={formData.userDomain.promotionStatus}
                    onChange={(e) => handleChange("userDomain", "promotionStatus", e.target.value)}
                  >
                    <option value="A">Activo</option>
                    <option value="P">Pendiente</option>
                    <option value="R">Repitente</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Registrar Estudiante
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ManagementTab;
