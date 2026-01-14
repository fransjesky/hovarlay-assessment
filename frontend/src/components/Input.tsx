import type { InputHTMLAttributes } from "react";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  onChange?: (value: string) => void;
}

export const Input = ({
  label,
  error,
  id,
  onChange,
  className = "",
  ...props
}: InputProps) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        onChange={handleChange}
        className={`
          w-full px-4 py-2.5 
          bg-white border rounded-xl 
          text-slate-800 placeholder-slate-400
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              : "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
          }
        `}
        {...props}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};
