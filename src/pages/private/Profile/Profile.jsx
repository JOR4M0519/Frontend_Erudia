import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Pencil } from "lucide-react"
import { decodeRoles } from "../../../utilities"
import { request } from "../../../services/config/axios_helper"; // Importamos el request para las peticiones
import { State } from "../../../models"

function Profile({ viewing }) {
  const user = viewing ? useSelector((store) => store.selectedUser) : useSelector((store) => store.user);
  const storedRole = decodeRoles(user?.roles) ?? [];
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!user?.id) return; // Evita hacer la solicitud si no hay ID

    console.log("Está revisando el perfil de otro usuario? - " + viewing);

    const fetchUserDetails = async () => {
      try {
        const response = await request("GET", "academy", `/users/detail/${user.id}`, {});
        if (response.status === 200) {
          setUserInfo(transformUserData(response.data)); // 🔹 Transformamos los datos aquí
          console.log(userInfo)
        }
      } catch (error) {
        console.error("Error obteniendo el usuario:", error);
      }
    };

    fetchUserDetails();
  }, [user?.id]);

  // 🔹 Transformar el JSON recibido a la estructura esperada
  const transformUserData = (data) => {
    return {
      id: data.id,
      name: `${data.firstName ?? ""} ${data.middleName ?? ""} ${data.lastName ?? ""} ${data.secondLastName ?? ""}`.trim(),
      status: new State().getName(data.user.status),
      avatar: "avatar.png", // 🔹 Imagen por defecto
      personalInfo: {
        codigo: data.id,
        rc: `${data.dni} - ${data.idType?.name ?? "Desconocido"}`,
        direccion: data.address ?? "No disponible",
        barrio: data.neighborhood ?? "No disponible",
        ciudad: data.city ?? "No disponible",
        telefono: data.phoneNumber ?? "No disponible",
        celular: data.user.email ?? "No disponible",
        fechaNacimiento: data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : "No disponible",
        position: data.positionJob ?? "No disponible",
      },
      familyInfo: {
        madre: data.relatives?.mother ?? "No registrado",
        padre: data.relatives?.father ?? "No registrado",
        hermanos: data.relatives?.siblings ?? [],
      },
    };
  };

  if (!userInfo) {
    return <p className="text-gray-500">Cargando perfil...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Profile Header */}
      <div className="flex items-start gap-6">
        <img
          src={userInfo.avatar}
          alt={userInfo.name}
          className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{userInfo.name}</h1>
          <p className="text-gray-600">{userInfo.personalInfo.position} - {userInfo.status}</p>
        </div>
      </div>

      {/* Personal Information */}
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

      {/* Family Information */}
      <section className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Familiares
              <Pencil className="h-4 w-4 text-gray-400" />
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-center font-medium mb-2">Madre</h3>
              <p className="text-center text-gray-600">{userInfo.familyInfo.madre}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-center font-medium mb-2">Padre</h3>
              <p className="text-center text-gray-600">{userInfo.familyInfo.padre}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-center font-medium mb-2">Hermanos</h3>
              {userInfo.familyInfo.hermanos.length > 0 ? (
                userInfo.familyInfo.hermanos.map((hermano, index) => (
                  <p key={index} className="text-center text-gray-600">
                    {hermano}
                  </p>
                ))
              ) : (
                <p className="text-center text-gray-600">No registrados</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Change Password Section */}
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
