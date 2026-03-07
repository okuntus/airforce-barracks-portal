import './Button.css';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  ...props 
}) {
  const className = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full',
    icon && 'btn-icon',
    disabled && 'btn-disabled'
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={className}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="btn-icon-wrapper">{icon}</span>}
      {children}
    </button>
  );
}
