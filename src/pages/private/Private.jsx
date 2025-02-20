import { Navigate, Route } from 'react-router-dom';
import { PrivateRoutes } from '../../models';
import { RoutesWithNotFound } from '../../utilities';
import { Layout } from '../../components';
import { Dashboard } from './Dashboard';
import { lazy } from 'react';

//const Dashboard = lazy(() => import('./Dashboard/Dashboard'));

function Private() {
  return (
    <RoutesWithNotFound>
      <Route path="/" element={<Navigate to={PrivateRoutes.DASHBOARD} />} />
      <Route path={PrivateRoutes.DASHBOARD} element={<Layout><Dashboard/></Layout>} />
    </RoutesWithNotFound>
  );
}
export default Private;