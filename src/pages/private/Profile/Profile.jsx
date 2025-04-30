import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Pencil, Save, X, Phone, MapPin, Calendar, Building, Briefcase, Mail, Users, FileDigit, IdCard, Contact, UserX, User } from "lucide-react";
import { BackButton } from "../../../components";
import { studentDataService } from "../Dashboard/StudentLayout";
import { PrivateRoutes, Roles, State } from "../../../models";
import { useLocation, useNavigate } from "react-router-dom";
import PersonalInfoModal from "./PersonalInfoModal";
import { decodeRoles, hasAccess } from "../../../utilities";
import Swal from "sweetalert2";

function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = new State();
  
  // Obtener datos necesarios
  const locationId = location.state?.id || null;
  const selectedUser = useSelector(store => store.selectedUser);
  const userState = useSelector(store => store.user);
  const userId = locationId || selectedUser?.id || null;

  // Verificar permisos
  const storedRole = decodeRoles(userState.roles) || [];
  const isAdmin = hasAccess(storedRole, [Roles.ADMIN]);
  const storeRoleSelectedUser = decodeRoles(selectedUser.roles) || [];

  const updateImageUser = () =>{
    if(hasAccess(storeRoleSelectedUser, [Roles.ADMIN])) return "admin-icon.png";
    if(hasAccess(storeRoleSelectedUser, [Roles.TEACHER])) return "teacher-icon.png";
    if(hasAccess(storeRoleSelectedUser, [Roles.STUDENT])) return "student-icon.png";
    return "avatar.png";
  }

  // Estados
  const [userInfo, setUserInfo] = useState(null);
  const [familyInfo, setFamilyInfo] = useState([]);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [idTypes, setIdTypes] = useState([]);
  
  // Cargar datos del usuario y tipos de ID
  useEffect(() => {
    if (!userId) return;

    const fetchUserDetails = async () => {
      try {
        const data = await studentDataService.getUserDetails(userId);
        if (data) {
          setUserInfo(data);
          console.log(data)
          // Extraer el tipo de ID de la cadena de identidad
          const identityParts = data.personalInfo.identity?.split('-') || [];
          const dniValue = identityParts[0]?.trim() || "";
          const idTypeValue = identityParts[1]?.trim() || "";
          
          // Inicializar el estado de edición con todos los campos necesarios
          setEditedInfo({
            ...data.personalInfo,
            firstName: data.firstName,
            lastName: data.lastName,
            middleName: data.middleName,
            secondLastName: data.secondLastName,
            dni: dniValue,
            idTypeName: idTypeValue, // Guardamos el nombre para mostrar
            idTypeId: null // Se actualizará después de cargar los tipos de ID
          });
        }
      } catch (error) {
        console.error("Error obteniendo datos del usuario:", error);
      }
    };

    // Cargar tipos de ID si el usuario es administrador
    const fetchIdTypes = async () => {
      if (!isAdmin) return;
      
      try {
        const types = await studentDataService.getIdTypes();
        if (types && Array.isArray(types)) {
          setIdTypes(types);
          
          // Una vez que tenemos los tipos de ID, actualizamos el ID correspondiente al nombre
          if (editedInfo && editedInfo.idTypeName) {
            const matchingType = types.find(type => type.name === editedInfo.idTypeName);
            if (matchingType) {
              setEditedInfo(prev => ({
                ...prev,
                idTypeId: matchingType.id
              }));
            }
          }
        }
      } catch (error) {
        console.error("Error obteniendo tipos de ID:", error);
      }
    };

    fetchUserDetails();
    fetchIdTypes();
  }, [userId, isAdmin]);

  // Efecto adicional para actualizar el idTypeId cuando cambian los tipos de ID
  useEffect(() => {
    if (editedInfo && editedInfo.idTypeName && idTypes.length > 0) {
      const matchingType = idTypes.find(type => type.name === editedInfo.idTypeName);
      if (matchingType) {
        setEditedInfo(prev => ({
          ...prev,
          idTypeId: matchingType.id
        }));
      }
    }
  }, [idTypes, editedInfo?.idTypeName]);

  // Cargar datos familiares
  useEffect(() => {
    if (!userId) return;

    const fetchFamilyDetails = async () => {
      try {
        const familyData = await studentDataService.getListRelativeFamily(userId);
        console.log()
        if (familyData) setFamilyInfo(familyData);
      } catch (error) {
        console.error("Error obteniendo datos familiares:", error);
      }
    };
    
    fetchFamilyDetails();
  }, [userId]);

  // Handlers
  const handleFamilyClick = async (familyMemberId, relationshipType) => {
    try {
      const familyData = await studentDataService.getUserDetails(familyMemberId);
      if (familyData) {
        setSelectedFamilyMember({ ...familyData, relationshipType });
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error obteniendo detalles del familiar:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejador específico para el cambio de tipo de ID
  const handleIdTypeChange = (idTypeId) => {
    const selectedType = idTypes.find(type => type.id === parseInt(idTypeId));
    setEditedInfo(prev => ({
      ...prev,
      idTypeId: parseInt(idTypeId),
      idTypeName: selectedType ? selectedType.name : ''
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setErrorMessage("");
    
    try {
      // Objeto base con campos comunes
      const dataToUpdate = {
        address: editedInfo.direccion,
        phoneNumber: editedInfo.telefono,
        neighborhood: editedInfo.barrio,
        city: editedInfo.ciudad,
        positionJob: editedInfo.position
      };
      
      // Agregar campos solo para administradores
      if (isAdmin) {
        Object.assign(dataToUpdate, {
          firstName: editedInfo.firstName,
          lastName: editedInfo.lastName,
          middleName: editedInfo.middleName || "",
          secondLastName: editedInfo.secondLastName || "",
          email: editedInfo.email,
          dni: editedInfo.dni,
          idType: { id: editedInfo.idTypeId } // Formato correcto para el backend
        });
      }
      
      await studentDataService.updateUserPersonalInfo(userId, dataToUpdate);
      
      // Obtener el nombre del tipo de ID seleccionado
      const selectedIdType = idTypes.find(type => type.id === editedInfo.idTypeId);
      const idTypeName = selectedIdType ? selectedIdType.name : editedInfo.idTypeName;
      
      // Actualizar el estado local con los cambios
      setUserInfo(prev => ({
        ...prev,
        firstName: editedInfo.firstName,
        lastName: editedInfo.lastName,
        middleName: editedInfo.middleName,
        secondLastName: editedInfo.secondLastName,
        personalInfo: {
          ...prev.personalInfo,
          direccion: editedInfo.direccion,
          telefono: editedInfo.telefono,
          barrio: editedInfo.barrio,
          ciudad: editedInfo.ciudad,
          position: editedInfo.position,
          email: editedInfo.email,
          identity: `${editedInfo.dni} - ${idTypeName}`
        }
      }));
      
      // Mostrar mensaje de éxito con SweetAlert2
      Swal.fire({
        title: '¡Éxito!',
        text: 'Los cambios han sido guardados correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6',
        timer: 3000
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      
      // Mostrar mensaje de error con SweetAlert2
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron guardar los cambios. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#d33'
      });
      
      setErrorMessage("No se pudieron guardar los cambios. Inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancelEdit = () => {
    // Restaurar los valores originales
    const identityParts = userInfo.personalInfo.identity?.split('-') || [];
    const dniValue = identityParts[0]?.trim() || "";
    const idTypeValue = identityParts[1]?.trim() || "";
    
    // Encontrar el ID correspondiente al nombre del tipo
    const matchingType = idTypes.find(type => type.name === idTypeValue);
    
    setEditedInfo({
      ...userInfo.personalInfo,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      middleName: userInfo.middleName,
      secondLastName: userInfo.secondLastName,
      dni: dniValue,
      idTypeName: idTypeValue,
      idTypeId: matchingType ? matchingType.id : null
    });
    
    setIsEditing(false);
    setErrorMessage("");
  };

  // Función para determinar si un campo es editable
  const isFieldEditable = (fieldName) => {
    if (!isEditing) return false;
    
    const commonEditableFields = ["direccion", "telefono", "barrio", "ciudad", "position"];
    
    if (isAdmin) return true;
    return commonEditableFields.includes(fieldName);
  };
  console.log(userInfo)
  if (!userInfo) {
    return (
      <div className="max-w-5xl mx-auto p-8 flex flex-col items-center justify-center bg-white rounded-lg shadow-md my-8">
        <div className="relative mb-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <User className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Cargando perfil</h3>
        <p className="text-gray-600 text-center">
          Estamos recuperando la información de su perfil académico...
        </p>
      </div>
    );
  }
  
  let avatarUrl= updateImageUser();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Encabezado */}
      <div className="flex items-center justify-between bg-gray-100 p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-4">
          {console.log(userInfo)}
          <img
            src={avatarUrl}
            alt={userInfo.name}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{userInfo.name}</h1>
            <div className="inline-flex items-center gap-2">
              <p className="text-gray-600">{userInfo.personalInfo.position}</p>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${state.getStatusClass(userInfo.status)}`}>
                {state.getName(userInfo.status)}
              </span>
            </div>
          </div>
        </div>
        <BackButton onClick={() => navigate(PrivateRoutes.DASHBOARD)} className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-400 transition flex items-center gap-2" />
      </div>

      {/* Información Personal */}
      <section className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-gray-600" />
              Información personal
            </h2>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition cursor-pointer"
                  >
                    <Save size={16} />
                    {isSaving ? "Guardando..." : "Guardar"}
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition cursor-pointer"
                  >
                    <X size={16} />
                    Cancelar
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-3 py-2 bg-yellow-500 text-white rounded-md  cursor-pointer hover:bg-yellow-400 transition"
                >
                  <Pencil size={16} />
                  Editar
                </button>
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {errorMessage}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Campos específicos para administradores */}
            {isAdmin && (
              <>
                <InfoField 
                  label="Nombre" 
                  value={isEditing ? editedInfo.firstName : userInfo.firstName}
                  isEditing={isFieldEditable("firstName")}
                  onChange={(value) => handleInputChange("firstName", value)}
                  icon={<Contact size={18} className="text-gray-500" />}
                />
                <InfoField 
                  label="Apellido" 
                  value={isEditing ? editedInfo.lastName : userInfo.lastName}
                  isEditing={isFieldEditable("lastName")}
                  onChange={(value) => handleInputChange("lastName", value)}
                  icon={<Contact size={18} className="text-gray-500" />}
                />
                <InfoField 
                  label="Segundo Nombre" 
                  value={isEditing ? editedInfo.middleName : userInfo.middleName}
                  isEditing={isFieldEditable("middleName")}
                  onChange={(value) => handleInputChange("middleName", value)}
                  icon={<Contact size={18} className="text-gray-500" />}
                />
                <InfoField 
                  label="Segundo Apellido" 
                  value={isEditing ? editedInfo.secondLastName : userInfo.secondLastName}
                  isEditing={isFieldEditable("secondLastName")}
                  onChange={(value) => handleInputChange("secondLastName", value)}
                  icon={<Contact size={18} className="text-gray-500" />}
                />
                <InfoField 
                  label="Número de identidad" 
                  value={isEditing ? editedInfo.dni : userInfo.personalInfo.identity?.split('-')[0]?.trim()}
                  isEditing={isFieldEditable("dni")} 
                  onChange={(value) => handleInputChange("dni", value)}
                  icon={<IdCard size={18} className="text-gray-500" />}
                />
                <SelectField 
                  label="Tipo de identidad" 
                  value={isEditing ? editedInfo.idTypeId : null}
                  displayValue={isEditing ? null : userInfo.personalInfo.identity?.split('-')[1]?.trim()}
                  isEditing={isFieldEditable("idType")} 
                  onChange={handleIdTypeChange}
                  options={idTypes.map(type => ({ value: type.id, label: type.name }))}
                  icon={<IdCard size={18} className="text-gray-500" />}
                />
              </>
            )}
            
            {/* Campos comunes para todos */}
            <InfoField 
              label="Código" 
              value={userInfo.personalInfo.codigo} 
              isEditing={false}
              icon={<FileDigit size={18} className="text-gray-500" />}
            />
            <InfoField 
              label="Identificación" 
              value={userInfo.personalInfo.identity} 
              isEditing={false}
              icon={<IdCard size={18} className="text-gray-500" />}
            />
            <InfoField 
              label="Dirección" 
              value={isEditing ? editedInfo.direccion : userInfo.personalInfo.direccion}
              isEditing={isFieldEditable("direccion")}
              onChange={(value) => handleInputChange("direccion", value)}
              icon={<MapPin size={18} className="text-gray-500" />}
            />
            <InfoField 
              label="Barrio" 
              value={isEditing ? editedInfo.barrio : userInfo.personalInfo.barrio}
              isEditing={isFieldEditable("barrio")}
              onChange={(value) => handleInputChange("barrio", value)}
              icon={<MapPin size={18} className="text-gray-500" />}
            />
            <InfoField 
              label="Ciudad" 
              value={isEditing ? editedInfo.ciudad : userInfo.personalInfo.ciudad}
              isEditing={isFieldEditable("ciudad")}
              onChange={(value) => handleInputChange("ciudad", value)}
              icon={<Building size={18} className="text-gray-500" />}
            />
            <InfoField 
              label="Teléfono" 
              value={isEditing ? editedInfo.telefono : userInfo.personalInfo.telefono}
              isEditing={isFieldEditable("telefono")}
              onChange={(value) => handleInputChange("telefono", value)}
              icon={<Phone size={18} className="text-gray-500" />}
            />
            <InfoField 
              label="Correo Electrónico" 
              value={isEditing ? editedInfo.email : userInfo.personalInfo.email}
              isEditing={isAdmin && isEditing}
              onChange={(value) => handleInputChange("email", value)}
              icon={<Mail size={18} className="text-gray-500" />}
            />
            <InfoField 
              label="Fecha de nacimiento" 
              value={userInfo.personalInfo.fechaNacimiento}
              isEditing={false}
              icon={<Calendar size={18} className="text-gray-500" />}
            />
            <InfoField 
              label="Cargo" 
              value={isEditing ? editedInfo.position : userInfo.personalInfo.position}
              isEditing={isFieldEditable("position")}
              onChange={(value) => handleInputChange("position", value)}
              icon={<Briefcase size={18} className="text-gray-500" />}
            />
          </div>
        </div>
      </section>

{/* Información Familiar */}
<section className="bg-white rounded-xl shadow-sm">
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold flex items-center">
        <Users size={20} className="mr-2 text-gray-600" />
        Familiares
      </h2>
    </div>

    {familyInfo.length > 0 ? (
      <div className="grid md:grid-cols-3 gap-4">
        {familyInfo.map((relative) => (
          <div
            key={relative.id}
            onClick={() => handleFamilyClick(relative.id, relative.relationship)}
            className="bg-gray-50 border border-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200 flex flex-col items-center shadow-sm"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <User size={20} className="text-blue-600" />
            </div>
            <div className="w-full text-center">
              <h3 className="font-medium text-blue-700 mb-1">{relative.relationship}</h3>
              <p className="font-medium mb-1">
                {relative.name || relative.lastName 
                  ? `${relative.name ?? ""} ${relative.lastName ?? ""}`.trim() 
                  : "No registrado"}
              </p>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                <p className="text-gray-500 text-sm" title={relative.email}>
                  {relative.email}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <div className="flex justify-center mb-4">
          <UserX size={40} className="text-gray-400" />
        </div>
        <p className="text-gray-600">No se encontraron familiares registrados.</p>
        {/* <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Agregar familiar
        </button> */}
      </div>
    )}
  </div>
</section>


      {/* Modal de información del familiar */}
      <PersonalInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userData={selectedFamilyMember} />
    </div>
  );
}

// Componente InfoField
function InfoField({ label, value, isEditing = false, onChange, icon = null }) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      {isEditing ? (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <p className="text-gray-800">{value || "-"}</p>
      )}
    </div>
  );
}

// Componente SelectField para listas desplegables
function SelectField({ label, value, displayValue, isEditing = false, onChange, options = [], icon = null }) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      {isEditing ? (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-gray-800">{displayValue || "-"}</p>
      )}
    </div>
  );
}

export default Profile;
