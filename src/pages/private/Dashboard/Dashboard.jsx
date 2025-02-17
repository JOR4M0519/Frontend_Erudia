import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { decodeRoles } from "../../../utilities";
import { Roles } from "../../../models";
import { Layout } from "../../../components";
import StudentTopBar from "./StudentTopBar";
import { StudentLayout } from "./StudentLayout";
import { configViewService } from "../Setting";

export function Dashboard() {
  const userState = useSelector(store => store.user);
  const storedRole = decodeRoles(userState.roles) || [];

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

  if (storedRole.includes(Roles.ADMIN)) {
    LayoutComponent = <StudentLayout/>;
    HeaderComponent = (
      <StudentTopBar />
    );
  }

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
