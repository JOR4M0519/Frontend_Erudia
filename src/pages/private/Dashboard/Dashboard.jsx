
import { useSelector } from "react-redux";

import ProfileSection from "../../../components/ProfileSection"
import PersonalInfoSection from "../../../components/PersonalInfoSection"
import ActionCards from "../../../components/ActionCards"
import { decodeRoles } from "../../../utilities";
import { StudentLayout } from "./StudentLayout";


export function Dashboard() {
  
    const userState = useSelector(store => store.user);
    // Parsear el string a un array
    const storedRole = decodeRoles(userState.roles) || []; 
    
    const userData = {
        name: userState.name,
        role: storedRole
    }

    return (
        <>
            <div className="space-y-6">
            <header className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold">Bienvenida {userData.name}</h1>
                    <p className="text-gray-600">Role: {userData.role} Periodo {userData.period}</p>
                </div>
                <div className="text-sm text-gray-600">
                    <p>Periodo {userData.period}</p>
                    <p>ID: {userData.studentId}</p>
                </div>
                </div>
            </header>


            {/* Renderizar StudentLayout solo si el usuario es estudiante */}
        
            <StudentLayout/>
        {/* {storedRole.includes("ADMIN") ? (
          <StudentLayout />
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <ProfileSection />
              <PersonalInfoSection />
            </div>
            <ActionCards />
          </>
        )} */}
            {/* <div className="grid md:grid-cols-2 gap-6">
                <ProfileSection />
                <PersonalInfoSection />
            </div>

            <ActionCards /> */}
            </div>

            {/* <RoutesWithNotFound>
                <Route path="/" element={<Navigate to={PrivateRoutes.DASHBOARD} />} />
                <Route element={<RoleGuard rol={Roles.ADMIN} />}>
                    <Route path={PrivateRoutes.ADMIN} element={<Layout requiredRole={Roles.ADMIN}><Admin/></Layout>} />
                </Route>
            </RoutesWithNotFound> */}

        </>
    )
}