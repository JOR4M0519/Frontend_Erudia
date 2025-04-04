import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react'; // Asegúrate de importar este ícono
import { PublicRoutes } from '../models';
import { resetUser, UserKey } from '../redux/states/user';
import { clearStorage } from '../utilities';

function Logout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const logOut = () => {
    clearStorage(UserKey);
    dispatch(resetUser());
    location.reload();  
    navigate(PublicRoutes.LOGIN, { replace: true });
  };
  
  return (
    <button 
      onClick={logOut} 
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
    >
      <LogOut size={18} />
      <span className="font-medium">Cerrar Sesión</span>
    </button>
  );
}

export default Logout;
