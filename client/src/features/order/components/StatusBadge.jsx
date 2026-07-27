const StatusBadge = ({ label, color, size = "md" }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap ${
      size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
    }`}
    style={{ color, backgroundColor: `${color}1A` }}
  >
    <span
      className="w-1.5 h-1.5 rounded-full shrink-0"
      style={{ backgroundColor: color }}
    />
    {label}
  </span>
);

export default StatusBadge