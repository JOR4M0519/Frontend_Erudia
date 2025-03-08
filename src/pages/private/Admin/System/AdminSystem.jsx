import React from "react";
import { User, BookOpen, Palette, PenTool } from "lucide-react";
import {AdminLayout} from "../";


const AdminSystem = () => {
  const cards = [
    {
      title: "Usuario",
      description: "",
      icon: <User className="h-12 w-12" />,
      path: "/admin/sistema/usuario",
      bgColor: "bg-blue-100"
    },
    {
      title: "Registro",
      description: "",
      icon: <BookOpen className="h-12 w-12" />,
      path: "/admin/sistema/registro",
      bgColor: "bg-blue-50"
    },
    {
      title: "Mantenimiento",
      description: "",
      icon: <PenTool className="h-12 w-12" />,
      path: "/admin/sistema/mantenimiento",
      bgColor: "bg-gray-200"
    },
    {
      title: "Apariencias",
      description: "",
      icon: <Palette className="h-12 w-12" />,
      path: "/admin/sistema/apariencias",
      bgColor: "bg-blue-50"
    }
  ];

  return (
    <AdminLayout
      title="Funcionalidades" 
      cards={cards} 
    />
  );
};

export default AdminSystem;
