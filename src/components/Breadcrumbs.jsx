import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center flex-wrap gap-2 text-sm">
      <Link 
        to="/" 
        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        Inicio
      </Link>
      
      {pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
        const isLast = index === pathSegments.length - 1;
        
        return (
          <span key={index} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="text-gray-900 font-semibold">
                {decodeURIComponent(segment)}
              </span>
            ) : (
              <Link 
                to={path} 
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {decodeURIComponent(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

