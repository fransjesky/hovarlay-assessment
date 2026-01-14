import type { InputHTMLAttributes } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type"> {
  label: string;
  onChange?: (checked: boolean) => void;
}

export const Checkbox = ({ label, id, onChange, className = "", ...props }: CheckboxProps) => {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, "-");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <label htmlFor={checkboxId} className={`checkbox-label ${className}`}>
      <input
        type="checkbox"
        id={checkboxId}
        onChange={handleChange}
        {...props}
      />
      {label}
    </label>
  );
};
