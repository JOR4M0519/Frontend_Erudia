// AdminFunctionalityLayout.jsx - Componente base para todas las páginas de funcionalidad
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components";

const AdminLayout = ({ title, cards }) => {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Card
            key={index}
            title={card.title}
            description={card.description || ""}
            icon={card.icon}
            onClick={() => handleCardClick(card.path)}
            className={`cursor-pointer ${card.bgColor || "bg-gray-100"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminLayout;
