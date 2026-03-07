import './Badge.css';

export default function Badge({ 
  children, 
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
  ...props 
}) {
  const badgeClassName = [
    'badge',
    `badge-${variant}`,
    `badge-${size}`,
    dot && 'badge-dot',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClassName} {...props}>
      {dot && <span className="badge-dot-indicator"></span>}
      {children}
    </span>
  );
}
