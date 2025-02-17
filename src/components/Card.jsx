export default function Card({ title, children, className = "", onClick }) {
  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-sm transition 
        ${onClick ? "cursor-pointer hover:shadow-md active:shadow-lg" : "cursor-default"} 
        ${className}`}
      onClick={onClick ? onClick : undefined} // 🔹 Solo maneja clics si onClick está definido
      role={onClick ? "button" : undefined} // 🔹 Indica que es interactivo solo si tiene onClick
      tabIndex={onClick ? "0" : undefined} // 🔹 Permite interacción con teclado solo si tiene onClick
      onKeyPress={onClick ? (e) => (e.key === "Enter" || e.key === " ") && onClick() : undefined} // 🔹 Soporta teclado solo si tiene onClick
    >
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  );
}
