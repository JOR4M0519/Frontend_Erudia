import { lazy, Suspense } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthGuard, RoleGuard, MultiRoleGuard } from './guards';
import { PrivateRoutes, PublicRoutes, Roles } from './models';
import store from './redux/store';
import { RoutesWithNotFound } from './utilities';
import React from "react";

import { Layout } from "./components/index"

import { Login } from './pages/login/Login';
import { Dashboard } from './pages/private/Dashboard';
import { Admin } from './pages/private/Admin';
import { Subject } from './pages/private/Subject';
import { Activities } from './pages/private/Activities';
import { DetailStudentTracking, StudentTracking } from './pages/private/StudentTracking';
import { Settings } from './pages/private/Setting';
import { Profile } from './pages/private/Profile';
import { GradesStudent } from './pages/private/Dashboard/StudentLayout';
import { SystemUsers } from './pages/private/Admin/System';


// const Login = lazy(() => import('./pages/login/Login'));
// const Private = lazy(() => import('./pages/Private/Private'));


function App() {

  return (
    <div className="App">
      <Suspense fallback={<div>Loading...</div>}>
        <Provider store={store}>
          <BrowserRouter>
            <RoutesWithNotFound>
              {/* 🔹 Redirigir a Dashboard si ya está autenticado */}
              <Route path="/" element={<Navigate to={PrivateRoutes.DASHBOARD} />} />

              {/* 🔹 Rutas Públicas (sin Layout) */}
              <Route path={PublicRoutes.LOGIN} element={<Login />} />

              {/* 🔹 Rutas Privadas (con Layout dentro del `AuthGuard`) */}
              <Route element={<AuthGuard privateValidation={true} />}>

                <Route path={`${PrivateRoutes.DASHBOARD}/*`} element={<Dashboard />} />

                <Route element={<MultiRoleGuard navKey="ADMIN" />}>
                  <Route path={`${PrivateRoutes.ADMIN}/*`} element={<Admin />} />
                </Route>

                <Route element={<MultiRoleGuard navKey="PROFILE" />}>
                  <Route path={PrivateRoutes.PROFILE} element={<Profile />} />
                </Route>

                <Route element={<MultiRoleGuard navKey="SUBJECTS" />}>
                  <Route path={PrivateRoutes.SUBJECTS} element={<Subject />} />
                </Route>

                <Route element={<MultiRoleGuard navKey="GRADES" />}>
                  <Route path={PrivateRoutes.GRADES} element={<GradesStudent />} />
                </Route>

                <Route element={<MultiRoleGuard navKey="ACTIVITIES" />}>
                  <Route path={PrivateRoutes.ACTIVITIES} element={<Activities />} />
                </Route>

                {/* <Route element={<MultiRoleGuard navKey="STUDENTTRACKING" />}>
                  <Route path={PrivateRoutes.STUDENTTRACKING} element={<StudentTracking />}>
                    <Route 
                      path={PrivateRoutes.STUDENTTRACKING+PrivateRoutes.STUDENTTRACKINGDETAILS} 
                      element={<DetailStudentTracking />} 
                    />
                  </Route>
                  <Route path="*" element={<Navigate to={PrivateRoutes.STUDENTTRACKING} />} />
                </Route> */}
                {/* <Route element={<MultiRoleGuard navKey="STUDENTTRACKING" />}>
                  <Route path={PrivateRoutes.STUDENTTRACKING} element={<StudentTracking />} />
                  <Route path={PrivateRoutes.STUDENTTRACKINGDETAILS} element={<DetailStudentTracking />} />
                  <Route path="*" element={<Navigate to={PrivateRoutes.STUDENTTRACKING} />} />
                </Route> */}

                <Route element={<MultiRoleGuard navKey="STUDENTTRACKING" />}>
                  <Route path={PrivateRoutes.STUDENTTRACKING} element={<StudentTracking />} />
                  <Route
                    path={PrivateRoutes.STUDENTTRACKING + PrivateRoutes.STUDENTTRACKINGDETAILS}
                    element={<DetailStudentTracking />}
                  />
                  <Route path="*" element={<Navigate to={PrivateRoutes.STUDENTTRACKING} />} />
                </Route>


                <Route element={<MultiRoleGuard navKey="SETTINGS" />}>
                  <Route path={PrivateRoutes.SETTINGS} element={<Settings />} />
                </Route>
              </Route>
            </RoutesWithNotFound>
          </BrowserRouter>
        </Provider>
      </Suspense>
    </div>
  );
}


// const App = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/"           element={<LoginPage />} />
//         <Route path="/login"      element={<LoginPage />} />
//         <Route path="/dashboard"  element={  
//           <Layout>
//             <Dashboard />
//           </Layout>
//           } />

//           {/* Cuano no exista la ruta */}
//         <Route path="*"           element={<LoginPage />} /> 
//       </Routes>
//     </BrowserRouter>
//   );
// };

export default App;