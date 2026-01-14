import { Link } from "react-router-dom";
import { useAuth } from "../hooks";
import { Button } from "./Button";

export interface HeaderProps {
  maxWidth?: "default" | "narrow";
}

export const Header = ({ maxWidth = "default" }: HeaderProps) => {
  const { logout, user } = useAuth();

  const containerClass =
    maxWidth === "narrow"
      ? "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
      : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

  return (
    <header className="bg-white border-b border-slate-200 shrink-0">
      <div className={containerClass}>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800 hidden sm:block">
              Hovarlay
            </span>
          </Link>

          {/* User section */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-slate-600 max-w-[200px] truncate">
                {user?.email}
              </span>
            </div>
            <Button onClick={logout} variant="ghost" size="sm">
              <svg
                className="w-5 h-5 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
