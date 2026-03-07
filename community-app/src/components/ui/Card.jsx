import './Card.css';

export default function Card({ 
  children, 
  variant = 'default',
  hover = false,
  padding = 'md',
  className = '',
  ...props 
}) {
  const cardClassName = [
    'card',
    `card-${variant}`,
    `card-padding-${padding}`,
    hover && 'card-hover',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClassName} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`card-header ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }) {
  return <div className={`card-body ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`card-footer ${className}`}>{children}</div>;
}
