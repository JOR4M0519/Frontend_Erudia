import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { PrivateRoutes, PublicRoutes } from '../models';
import Layout from '../components/Layout'; //  Importamos el Layout


export const AuthGuard = ({ privateValidation }) => {
  const userState = useSelector((store) => store.user);
  // We still use userState.token for authentication check
  // This is correct because we want to check if the user is logged in
  
  if (!userState.token) {
    return <Navigate replace to={PublicRoutes.LOGIN} />;
  }

  return privateValidation ? (
    <Layout> {/*  Envolvemos SOLO rutas privadas con Layout */}
      <Outlet />
    </Layout>
  ) : (
    <Navigate replace to={PublicRoutes.LOGIN} />
  );
};

export default AuthGuard;

/**
 
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { PrivateRoutes, PublicRoutes } from '../models';
import Layout from '../components/Layout'; //  Importamos el Layout

export const AuthGuard = ({ privateValidation }) => {
  const userState = useSelector((store) => store.user);
  
  if (!userState.token) {
    return <Navigate replace to={PublicRoutes.LOGIN} />;
  }

  return privateValidation ? (
  
    <Layout> Envolvemos SOLO rutas privadas con Layout
    <Outlet />
    </Layout>
  ) : (
    <Navigate replace to={PublicRoutes.LOGIN} />
  );
};

export default AuthGuard;

 */