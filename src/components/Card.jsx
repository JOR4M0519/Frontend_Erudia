export default function Card({ title, children, className = "", onClick }) {
  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-sm transition cursor-pointer ${className} 
        ${onClick ? "hover:shadow-md active:shadow-lg" : ""}`}
      onClick={onClick} // 🔹 Ahora maneja clics
      role={onClick ? "button" : undefined} // 🔹 Indica que es interactivo
      tabIndex={onClick ? "0" : undefined} // 🔹 Permite interacción con teclado
      onKeyPress={(e) => onClick && (e.key === "Enter" || e.key === " ") && onClick()} // 🔹 Soporta teclado
    >
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  );
}
