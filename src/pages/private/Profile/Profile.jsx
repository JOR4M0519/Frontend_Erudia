import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Pencil } from "lucide-react";
import { decodeRoles } from "../../../utilities";
import { BackButton } from "../../../components";
import { request } from "../../../services/config/axios_helper";
import { studentDataService } from "../Dashboard/StudentLayout";
import { State } from "../../../models";
import { useNavigate } from "react-router-dom";
import PersonalInfoModal from "./PersonalInfoModal"; // Importamos el modal

function Profile({ viewing }) {
  const user = viewing ? useSelector((store) => store.selectedUser) : useSelector((store) => store.user);
  const [userInfo, setUserInfo] = useState(null);
  const [familyInfo, setFamilyInfo] = useState([]);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate();
  const state = new State();

  useEffect(() => {
    if (!user?.id) return;

    const fetchUserDetails = async () => {
      const data = await studentDataService.getFamilyMemberDetails(user.id);
      if (data) setUserInfo(data);
    };

    const fetchFamilyDetails = async () => {
      const familyData = await studentDataService.getFamilyDetails(user.id);
      if (familyData) setFamilyInfo(familyData);
    };

    fetchUserDetails();
    fetchFamilyDetails();
  }, [user?.id]);

  // ✅ Hacer el fetch de la info del familiar antes de abrir el modal
  const handleFamilyClick = async (familyMemberId, relationshipType) => {
    try {
      const familyData = await studentDataService.getFamilyMemberDetails(familyMemberId);
      if (familyData) {
        setSelectedFamilyMember({ ...familyData, relationshipType }); // ✅ Agregar el tipo de relación correctamente
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error obteniendo detalles del familiar:", error);
    }
  };
  

  if (!userInfo) {
    return <p className="text-gray-500">Cargando perfil...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* 🔹 Encabezado */}
      <div className="flex items-center justify-between bg-gray-100 p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-4">
          <img
            src={userInfo.avatar}
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
        <BackButton onClick={() => navigate("/dashboard")} className="px-4 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800 transition flex items-center gap-2" />
      </div>

      {/* 🔹 Información Personal */}
      <section className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Información personal
              <Pencil className="h-4 w-4 text-gray-400" />
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <InfoField label="Código" value={userInfo.personalInfo.codigo} />
            <InfoField label="R.C" value={userInfo.personalInfo.rc} />
            <InfoField label="Dirección" value={userInfo.personalInfo.direccion} />
            <InfoField label="Barrio" value={userInfo.personalInfo.barrio} />
            <InfoField label="Ciudad" value={userInfo.personalInfo.ciudad} />
            <InfoField label="Teléfono" value={userInfo.personalInfo.telefono} />
            <InfoField label="Celular" value={userInfo.personalInfo.celular} />
            <InfoField label="Fecha de nacimiento" value={userInfo.personalInfo.fechaNacimiento} />
          </div>
        </div>
      </section>

      {/* 🔹 Información Familiar */}
      <section className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Familiares
              <Pencil className="h-4 w-4 text-gray-400" />
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {familyInfo.length > 0 ? (
              familyInfo.map((relative) => (
                <div
                key={relative.id}
                onClick={() => handleFamilyClick(relative.id,relative.relationship)} // ✅ Llama la función corregida
                className="bg-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-200 transition"
              >
                <h3 className="text-center font-medium mb-2">{relative.relationship}</h3>
                <p className="text-center text-gray-600">
                {relative.name || relative.lastName ? `${relative.name ?? ""} ${relative.lastName ?? ""}`.trim() : "No registrado"}
                </p>
                <p className="text-center text-gray-500 text-sm">{relative.email}</p>
              </div>
              ))
            ) : (
              <p className="text-center text-gray-600">No se encontraron familiares registrados.</p>
            )}
          </div>
        </div>
      </section>

      {/* 🔹 Cambiar Contraseña */}
      <section className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Cambiar contraseña
              <Pencil className="h-4 w-4 text-gray-400" />
            </h2>
            <button className="text-primary hover:text-primary/80 font-medium">Cambiar</button>
          </div>
        </div>
      </section>

      {/* 🔹 Modal de información del familiar */}
      <PersonalInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userData={selectedFamilyMember} />
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-gray-800">{value}</p>
    </div>
  );
}

export default Profile;
