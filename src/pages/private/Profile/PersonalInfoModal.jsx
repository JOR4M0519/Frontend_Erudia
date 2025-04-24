import { X } from "lucide-react";
import { State } from "../../../models";

export default function PersonalInfoModal({ isOpen, onClose, userData }) {
  const state = new State();
  if (!isOpen || !userData) return null;
  console.log(userData)
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl transition-transform transform scale-100">
        {/*  Header */}
        <div className="bg-yellow-400 px-6 py-4 flex justify-between items-center text-gray-800 rounded-t-2xl">
          <h2 className="text-lg font-semibold">{userData.name || "Información del familiar"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/*  Body */}
        <div className="p-6">
          {/* Avatar y Estado */}
          <div className="flex items-center gap-4 mb-6 border-b pb-4">
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-24 h-24 rounded-full border-4 border-gray-300 shadow-lg object-cover"
            />
            <div>
              <h3 className="text-xl font-bold text-gray-800">{userData.name}</h3>
              <p className="text-sm text-gray-500 py-1">{userData.relationshipType || "Relación no especificada"}</p>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${state.getStatusClass(userData.status)}`}>
                {state.getName(userData.status)}
              </span>
            </div>
          </div>

          {/*  Información Personal */}
          <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Información Personal</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <InfoField label="Código" value={userData.personalInfo.codigo} />
              <InfoField label={userData.personalInfo.typeIdentity} value={userData.personalInfo.numberIdentity} />
              <InfoField label="Dirección" value={userData.personalInfo.direccion} />
              <InfoField label="Barrio" value={userData.personalInfo.barrio} />
              <InfoField label="Ciudad" value={userData.personalInfo.ciudad} />
              <InfoField label="Celular" value={userData.personalInfo.telefono} />
              <InfoField label="Fecha de nacimiento" value={userData.personalInfo.fechaNacimiento} />
              <InfoField label="Cargo" value={userData.personalInfo.position} />
            </div>
          </div>
        </div>

        {/*  Footer */}
        <div className="p-4 flex justify-end border-t bg-gray-100 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-yellow-500 text-black rounded-lg cursor-pointer hover:bg-yellow-400 transition shadow-xl font-medium"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border">
      <p className="text-xs text-gray-500 font-semibold">{label}</p>
      <p className="text-gray-800 font-medium">{value || "No disponible"}</p>
    </div>
  );
}
