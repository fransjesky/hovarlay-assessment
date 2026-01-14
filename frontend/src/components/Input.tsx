import type { InputHTMLAttributes } from "react";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  onChange?: (value: string) => void;
}

export const Input = ({ label, error, id, onChange, className = "", ...props }: InputProps) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={`form-group ${className}`}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <input id={inputId} onChange={handleChange} {...props} />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};
