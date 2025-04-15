interface CategoryIconProps {
  icon: string;
  color: string;
  className?: string;
}

export function CategoryIcon({ icon, color, className = "" }: CategoryIconProps) {
  return (
    <div 
      className={`w-10 h-10 rounded-full flex items-center justify-center ${className}`}
      style={{ backgroundColor: `${color}10` }}
    >
      <span 
        className="material-icons text-xl"
        style={{ color }}
      >
        {icon}
      </span>
    </div>
  );
}
