import type { InputHTMLAttributes } from "react";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type"> {
  label: string;
  onChange?: (checked: boolean) => void;
}

export const Checkbox = ({
  label,
  id,
  onChange,
  className = "",
  checked,
  ...props
}: CheckboxProps) => {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, "-");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <label
      htmlFor={checkboxId}
      className={`
        flex items-center gap-3 cursor-pointer group
        ${className}
      `}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />
        <div
          className="
            w-5 h-5 
            border-2 border-slate-300 rounded-md
            bg-white
            transition-all duration-200
            peer-checked:bg-indigo-600 peer-checked:border-indigo-600
            peer-focus:ring-2 peer-focus:ring-indigo-500/20 peer-focus:ring-offset-0
            group-hover:border-slate-400
            peer-checked:group-hover:bg-indigo-700
          "
        />
        <svg
          className="
            absolute top-0.5 left-0.5
            w-4 h-4 text-white
            opacity-0 peer-checked:opacity-100
            transition-opacity duration-200
          "
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
        {label}
      </span>
    </label>
  );
};
