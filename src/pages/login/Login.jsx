import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Swal from 'sweetalert2';

import googleOauthIcon from "./resources/google-oauth.png";
import image1 from "./resources/bg-Image.png";
import logo from "./resources/logo.png";
import "./style.css";

import { PrivateRoutes, PublicRoutes, Roles, AdminRoutes } from '../../models/index';
import { createUser, resetUser, UserKey } from '../../redux/states/user';
import { clearStorage, decodeRoles } from '../../utilities';

import { encodeUserInfo, request } from "../../services/config/axios_helper"
import apiEndpoints from '../../Constants/api-endpoints';
import { setupTokenRefreshSystem } from '../../services/config/token_helper';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    useEffect(() => {
        clearStorage(UserKey);
        dispatch(resetUser());
        navigate(`/${PublicRoutes.LOGIN}`, { replace: true });
        
        // Al iniciar el componente, limpiar cualquier preferencia de vista anterior
        // para asegurar que los administradores siempre empiecen en vista de admin
        localStorage.removeItem('userViewMode');
        window.userChosenViewMode = null;
    }, []);

    const login = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!username.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Por favor ingresa tu nombre de usuario',
                confirmButtonColor: '#D4AF37'
            });
            return;
        }
        if (!password) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Por favor ingresa tu contraseña',
                confirmButtonColor: '#D4AF37'
            });
            return;
        }
        
        // Mostrar loading
        Swal.fire({
            title: 'Iniciando sesión',
            text: 'Por favor espera...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        try {
            const response = await request(
                "POST", 
                apiEndpoints.SERVICES.GATEAWAY,
                apiEndpoints.API_ENDPOINTS.AUTH.LOGIN,
                { username, password });
               
            if (response.status === 200) {
                const responseData = response.data;
                
                if (responseData.accessToken) {
                    // Store user information in Redux
                    console.log("Auth response:", responseData);
                    const userInfo = encodeUserInfo(
                        responseData.user.user.id,
                        responseData.accessToken,
                        responseData.refreshToken);
                    dispatch(createUser({...userInfo}));
                    
                    console.log(userInfo)
                    // Initialize token refresh system
                    setupTokenRefreshSystem();

                    // Check if user is admin to redirect to admin panel
                    const storedRole = decodeRoles(userInfo.roles) || [];
                    const isAdmin = storedRole.includes(Roles.ADMIN);
                    
                    // Para administradores, establecer explícitamente el modo de vista
                    if (isAdmin) {
                        // Establecer el modo admin como predeterminado para administradores
                        localStorage.setItem('userViewMode', 'admin');
                        window.userChosenViewMode = 'admin';
                    } else {
                        // Para usuarios no administradores, asegurar que no tengan modo admin
                        localStorage.removeItem('userViewMode');
                        window.userChosenViewMode = null;
                    }

                    // Mostrar mensaje de éxito
                    Swal.fire({
                        icon: 'success',
                        title: '¡Bienvenido!',
                        text: `Has iniciado sesión correctamente`,
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        // Redirigir según el rol - con un pequeño retraso para asegurar que los estados se actualicen
                        setTimeout(() => {
                            if (isAdmin) {
                                // Redirigir a administradores directamente a la vista de admin
                                navigate(AdminRoutes.INSTITUTION, { replace: true });
                            } else {
                                // Usuarios normales van al dashboard
                                navigate(PrivateRoutes.DASHBOARD, { replace: true });
                            }
                        }, 100);
                    });
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de autenticación',
                    text: 'Credenciales inválidas. Por favor verifica e intenta nuevamente.',
                    confirmButtonColor: '#D4AF37'
                });
            }
        } catch (error) {
            console.error("Error durante el inicio de sesión:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.status === 401
                    ? 'Usuario o contraseña incorrectos'
                    : 'Ocurrió un error inesperado. Intenta nuevamente.',
                confirmButtonColor: '#D4AF37'
            });
        }
    };

    return (
        <div className="frame flex w-full h-screen">
            {/* Left column for the login form */}
            <div className="flex flex-col bg-white justify-center items-center w-full md:w-1/2 p-8">
                <form className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg w-full max-w-md" onSubmit={login}>
                    <img src={logo} alt="Logo" className="w-[200px] h-auto mb-10" />
                    
                    <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>
                    
                    <div className="mb-6 w-full">
                        <label htmlFor="username" className="block text-gray-700 font-medium mb-2">Usuario</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Ingresa tu usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full h-12 px-4 border-2 border-[#ffc100] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc100] focus:border-transparent transition-all"
                        />
                    </div>
                    
                    <div className="mb-6 w-full">
                        <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-12 px-4 border-2 border-[#ffc100] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc100] focus:border-transparent transition-all"
                        />
                    </div>

                    {/* <div className="flex items-center justify-between w-full mb-6">
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="form-checkbox h-5 w-5 text-[#ffc100] rounded border-gray-300 focus:ring-[#ffc100]" 
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                            />
                            <span className="ml-2 text-gray-700">Recordarme</span>
                        </label>
                        <a href="#" className="text-sm text-blue-600 hover:underline">¿Olvidaste tu contraseña?</a>
                    </div> */}

                    <button 
                        type="submit"
                        className="flex items-center justify-center w-full h-12 mt-2 bg-[#D4AF37] hover:bg-[#C4A030] text-white font-bold rounded-lg transition-colors"
                    >
                        Ingresar
                        <ArrowRight className="h-5 w-5 ml-2" />
                    </button>
                    {/* <div className="my-6 flex items-center w-full">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="px-4 text-gray-500 text-sm">O continúa con</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div> */}

                    {/* <button 
                        type="button"
                        className="flex items-center justify-center w-full h-12 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <img 
                            src={googleOauthIcon} 
                            alt="Google" 
                            className="w-5 h-5 mr-2"
                        />
                        Entrar con Google
                    </button> */}
                </form>
            </div>

            {/* Right column for the image - hidden on mobile */}
            <div className="hidden md:flex md:w-1/2 justify-center items-center bg-gray-100">
                <img
                    src={image1}
                    alt="Playground"
                    className="w-[95%] h-[95%] object-cover rounded-lg shadow-lg"
                />
            </div>
        </div>
    );
};

export { Login };