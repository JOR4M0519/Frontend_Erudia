import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { PrivateRoutes, PublicRoutes, SideBarRoles } from "../models";
import { decodeRoles } from "../utilities";

export function MultiRoleGuard({ navKey }) {
  const userState = useSelector((store) => store.user);
  const selectedUser = useSelector((store) => store.selectedUser);
  
  // Use selectedUser's roles if available, otherwise fall back to logged-in user's roles
  const userRoles = decodeRoles(selectedUser?.roles || userState?.roles) || [];

  // Obtener roles permitidos desde SideBarRoles
  const allowedRoles = SideBarRoles[navKey] ?? [];

  // Verificar si el usuario tiene al menos un rol permitido
  const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

  return hasAccess ? <Outlet /> : <Navigate replace to={PrivateRoutes.DASHBOARD} />;
}

export default MultiRoleGuard;
