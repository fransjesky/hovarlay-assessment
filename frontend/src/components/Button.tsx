import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
  loadingText?: string;
}

export const Button = ({
  children,
  variant = "primary",
  isLoading = false,
  loadingText,
  disabled,
  className = "",
  ...props
}: ButtonProps) => {
  const variantClass = `btn-${variant}`;

  return (
    <button
      className={`btn ${variantClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (loadingText || "Loading...") : children}
    </button>
  );
};
