import type { SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
}

export const Select = ({
  label,
  options,
  id,
  onChange,
  className = "",
  ...props
}: SelectProps) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          onChange={handleChange}
          className="
            w-full px-4 py-2.5 pr-10
            bg-white border border-slate-200 rounded-xl
            text-slate-800
            transition-all duration-200
            hover:border-slate-300
            focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
            appearance-none cursor-pointer
          "
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="h-5 w-5 text-slate-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
