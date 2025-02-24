import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { decodeRoles } from "../../../utilities";
import { Roles } from "../../../models";
import { Layout } from "../../../components";
import { studentDataService, StudentLayout } from "./StudentLayout";
import { configViewService } from "../Setting";
import { TeacherLayout } from "./TeacherLayout";

export default function Dashboard() {
  const selectedUser = useSelector(store => store.selectedUser);
  const storedRole = decodeRoles(selectedUser.roles) || [];
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [periods, setPeriods] = useState([]);


  // 🔹 Suscribirse a los períodos disponibles
  useEffect(() => {
    const periodSubscription = configViewService.getPeriods().subscribe(setPeriods);
    return () => periodSubscription.unsubscribe();
  }, []);

  // 🔹 Suscribirse al período seleccionado
  useEffect(() => {
    const selectedPeriodSubscription = configViewService.getSelectedPeriod().subscribe(setSelectedPeriod);
    return () => selectedPeriodSubscription.unsubscribe();
  }, []);

  // 🔹 Cargar períodos al montar el componente
  useEffect(() => {
    configViewService.loadPeriods();
  }, []);

  let LayoutComponent = null;
  let HeaderComponent = null;

  if (storedRole.includes(Roles.STUDENT)) return <StudentLayout/>
  
  if (storedRole.includes(Roles.TEACHER)) return <TeacherLayout/>

  //if (storedRole.includes(Roles.ADMIN)) return <AdminLayout/>

  return <StudentLayout/>;
}

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

            {/* <RoutesWithNotFound>
                <Route path="/" element={<Navigate to={PrivateRoutes.DASHBOARD} />} />
                <Route element={<RoleGuard rol={Roles.ADMIN} />}>
                    <Route path={PrivateRoutes.ADMIN} element={<Layout requiredRole={Roles.ADMIN}><Admin/></Layout>} />
                </Route>
            </RoutesWithNotFound> */}
