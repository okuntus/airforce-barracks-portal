import './Input.css';

export function Input({ 
  label,
  error,
  helper,
  icon,
  fullWidth = false,
  className = '',
  ...props 
}) {
  const inputClassName = [
    'input',
    error && 'input-error',
    icon && 'input-with-icon',
    fullWidth && 'input-full',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`input-wrapper ${fullWidth ? 'input-wrapper-full' : ''}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        {icon && <span className="input-icon">{icon}</span>}
        <input className={inputClassName} {...props} />
      </div>
      {error && <span className="input-error-text">{error}</span>}
      {helper && !error && <span className="input-helper-text">{helper}</span>}
    </div>
  );
}

export function Textarea({ 
  label,
  error,
  helper,
  fullWidth = false,
  className = '',
  rows = 4,
  ...props 
}) {
  const textareaClassName = [
    'textarea',
    error && 'textarea-error',
    fullWidth && 'textarea-full',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`textarea-wrapper ${fullWidth ? 'textarea-wrapper-full' : ''}`}>
      {label && <label className="textarea-label">{label}</label>}
      <textarea className={textareaClassName} rows={rows} {...props} />
      {error && <span className="textarea-error-text">{error}</span>}
      {helper && !error && <span className="textarea-helper-text">{helper}</span>}
    </div>
  );
}

export function Select({ 
  label,
  error,
  helper,
  children,
  fullWidth = false,
  className = '',
  ...props 
}) {
  const selectClassName = [
    'select',
    error && 'select-error',
    fullWidth && 'select-full',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`select-wrapper ${fullWidth ? 'select-wrapper-full' : ''}`}>
      {label && <label className="select-label">{label}</label>}
      <select className={selectClassName} {...props}>
        {children}
      </select>
      {error && <span className="select-error-text">{error}</span>}
      {helper && !error && <span className="select-helper-text">{helper}</span>}
    </div>
  );
}
