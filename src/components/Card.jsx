export default function Card({ title, children, className = "", onClick, style }) {
  return (
    <div
      className={`p-6 rounded-lg shadow-sm transition 
        ${onClick ? "cursor-pointer hover:shadow-md active:shadow-lg" : "cursor-default"} 
        ${className}`}
      onClick={onClick ? onClick : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? "0" : undefined}
      onKeyPress={onClick ? (e) => (e.key === "Enter" || e.key === " ") && onClick() : undefined}
      style={style} // ✅ Ahora acepta estilos externos, como `backgroundImage`
    >
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  );
} 
